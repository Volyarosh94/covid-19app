import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as uuid from "uuid";
import { ILocationService } from "../../location-service/ILocationService";
import { LOCATION_SERVICE } from "../../location-service/ioc";
import { createMockLocation } from "../../testing/location/data/mockLocationData";
import { mockLocationService } from "../../testing/location/location.service.mock";
import { IMockRepository, mockRepository } from "../../testing/repository.mock";
import { CovidQuestionService } from "../covid.question.service";
import { CovidQuestionEntity } from "../entity/covidQuestion.entity";
import { CovidQuestionnaireScheduleEntity } from "../entity/covidQuestionnaireSchedule.entity";
import { ICovidQuestionService } from "../ICovidQuestionService";

describe("CovidQuestionService", () => {
    let covidQuestionService: ICovidQuestionService;
    let covidQuestionRepo: IMockRepository;
    let locationService: ILocationService;
    let covidQuestionScheduleRepo: IMockRepository;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module = await Test.createTestingModule({
            providers: [
                CovidQuestionService,
                {
                    provide: getRepositoryToken(CovidQuestionEntity),
                    useFactory: mockRepository
                },
                {
                    provide: getRepositoryToken(CovidQuestionnaireScheduleEntity),
                    useFactory: mockRepository
                },
                {
                    provide: LOCATION_SERVICE,
                    useFactory: mockLocationService
                }
            ]
        }).compile();

        covidQuestionService = module.get(CovidQuestionService);
        covidQuestionRepo = module.get(getRepositoryToken(CovidQuestionEntity));
        covidQuestionScheduleRepo = module.get(getRepositoryToken(CovidQuestionnaireScheduleEntity));
        locationService = module.get(LOCATION_SERVICE);
    });

    const location = createMockLocation();
    const locationId = location.id;

    const mockCovidQuestionEntity: CovidQuestionEntity = {
        id: uuid.v4(),
        questionText: "some_text",
        questionDetails: "mock_details",
        isPositive: true,
        location,
        createdAt: new Date()
    };

    const questionId = mockCovidQuestionEntity.id;

    const mockQuestionScheduleEntity = {
        id: "question_schedule_id",
        startTime: 4,
        reminderTime: 10,
        cancellationTime: 5,
        isActive: true,
        location
    };

    it("should return list of all questions", async () => {
        const getSpyRepo = jest.spyOn(covidQuestionRepo, "find").mockResolvedValueOnce([mockCovidQuestionEntity]);

        await covidQuestionService.getAllQuestions(locationId);

        expect(getSpyRepo).toHaveBeenCalledWith({
            where: { location: locationId },
            relations: ["location"],
            order: {
                createdAt: "ASC"
            }
        });
    });

    it("should get a certain question by id", async () => {
        const getSpyRepo = jest.spyOn(covidQuestionRepo, "findOne").mockResolvedValueOnce(mockCovidQuestionEntity);

        await covidQuestionService.getQuestionById(questionId);

        expect(getSpyRepo).toHaveBeenCalledWith(questionId, { relations: ["location"] });
    });

    it("should add a new question", async () => {
        const createRequest = {
            questionText: "some_text",
            questionDetails: "mock_details",
            isPositive: true
        };

        const getLocationSpy = jest.spyOn(locationService, "getLocationById").mockResolvedValueOnce(location);
        const mapToEntitySpy = jest.spyOn(covidQuestionRepo, "create").mockReturnValueOnce(mockCovidQuestionEntity);
        const getQuestionsSpy = jest
            .spyOn(covidQuestionService, "getAllQuestions")
            .mockResolvedValueOnce([mockCovidQuestionEntity]);
        const createSpyRepo = jest.spyOn(covidQuestionRepo, "save").mockResolvedValueOnce(mockCovidQuestionEntity);

        await covidQuestionService.addQuestion(locationId, createRequest);

        expect(getLocationSpy).toHaveBeenCalledWith(locationId);
        expect(getQuestionsSpy).toHaveBeenCalledWith(locationId);
        expect(mapToEntitySpy).toHaveBeenCalledWith(createRequest);
        expect(createSpyRepo).toHaveBeenCalledWith(mockCovidQuestionEntity);
    });

    it("should add default questionnaire config when adding first question", async () => {
        const createRequest = {
            questionText: "some_text",
            questionDetails: "mock_details",
            isPositive: true
        };

        jest.spyOn(locationService, "getLocationById").mockResolvedValueOnce(location);
        jest.spyOn(covidQuestionRepo, "create").mockReturnValueOnce(mockCovidQuestionEntity);
        jest.spyOn(covidQuestionService, "getAllQuestions").mockResolvedValueOnce([]);
        jest.spyOn(covidQuestionRepo, "save").mockResolvedValueOnce(mockCovidQuestionEntity);

        const addDefaultConfigSpy = jest
            .spyOn(covidQuestionService, "createDefaultQuestionnaireScheduleConfig")
            .mockReturnThis();

        await covidQuestionService.addQuestion(locationId, createRequest);

        expect(addDefaultConfigSpy).toHaveBeenCalledWith(locationId);
    });

    it("should update a certain question", async () => {
        const updateRequest = {
            questionDetails: "updated_details"
        };

        const getSpy = jest.spyOn(covidQuestionRepo, "findOne").mockResolvedValueOnce(mockCovidQuestionEntity);
        const updateSpy = jest.spyOn(covidQuestionRepo, "save").mockResolvedValueOnce({
            ...mockCovidQuestionEntity,
            questionDetails: "updated_details"
        });
        const getQuestionSpy = jest.spyOn(covidQuestionService, "getQuestionById");

        await covidQuestionService.updateQuestion(questionId, { questionDetails: "updated_details" });

        expect(getSpy).toHaveBeenCalledWith(mockCovidQuestionEntity.id);
        expect(updateSpy).toHaveBeenCalledWith({ id: questionId, ...updateRequest });
        expect(getQuestionSpy).toHaveBeenCalledWith(mockCovidQuestionEntity.id);
    });

    it("should remove a certain question", async () => {
        covidQuestionRepo.delete.mockImplementationOnce(undefined);

        const result = await covidQuestionService.removeQuestion(questionId);
        expect(result).toEqual(questionId);
    });

    it("should get questionnaire schedule config of a location", async () => {
        const findSpy = jest
            .spyOn(covidQuestionScheduleRepo, "findOne")
            .mockResolvedValueOnce(mockQuestionScheduleEntity);

        await covidQuestionService.getCovidQuestionnaireScheduleConfig(locationId);

        expect(findSpy).toHaveBeenCalledWith({
            where: { location: locationId },
            relations: ["location"]
        });
    });

    it("should update questionnaire schedule config", async () => {
        const updateRequest = {
            id: "question_schedule_id",
            startTime: 4,
            reminderTime: 10,
            cancellationTime: 5,
            isActive: false
        };

        const findSpy = jest
            .spyOn(covidQuestionScheduleRepo, "findOne")
            .mockResolvedValueOnce(mockQuestionScheduleEntity);
        const updateSpy = jest
            .spyOn(covidQuestionScheduleRepo, "save")
            .mockResolvedValueOnce(mockQuestionScheduleEntity);
        const getScheduleSpy = jest.spyOn(covidQuestionService, "getCovidQuestionnaireScheduleConfig");

        await covidQuestionService.updateQuestionnaireScheduleConfig(locationId, updateRequest);

        expect(findSpy).toHaveBeenCalledWith(updateRequest.id);
        expect(updateSpy).toHaveBeenCalledWith(updateRequest);
        expect(getScheduleSpy).toHaveBeenCalledWith(locationId);
    });
});
