import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ILocationService } from "../location-service/ILocationService";
import { LOCATION_SERVICE } from "../location-service/ioc";
import { AddQuestionRequest } from "./contract/addQuestionRequest";
import { QuestionnaireScheduleCreateOrUpdateRequest } from "./contract/questionnaireScheduleCreateOrUpdateRequest";
import { UpdateQuestionRequest } from "./contract/updateQuestionRequest";
import { CovidQuestionEntity } from "./entity/covidQuestion.entity";
import { CovidQuestionnaireScheduleEntity } from "./entity/covidQuestionnaireSchedule.entity";
import { ICovidQuestionService } from "./ICovidQuestionService";

@Injectable()
export class CovidQuestionService implements ICovidQuestionService {
    constructor(
        @InjectRepository(CovidQuestionEntity)
        private readonly questionRepository: Repository<CovidQuestionEntity>,
        @Inject(LOCATION_SERVICE)
        private readonly locationService: ILocationService,
        @InjectRepository(CovidQuestionnaireScheduleEntity)
        private readonly questionnaireScheduleRepository: Repository<CovidQuestionnaireScheduleEntity>
    ) {}

    async addQuestion(locationId: string, request: AddQuestionRequest): Promise<CovidQuestionEntity> {
        const [location, questions] = await Promise.all([
            this.locationService.getLocationById(locationId),
            this.getAllQuestions(locationId)
        ]);

        const entity = this.questionRepository.create(request);
        entity.location = location;
        entity.createdAt = new Date();

        const [createResult] = await Promise.all([
            this.questionRepository.save(entity),
            !questions.length ? this.createDefaultQuestionnaireScheduleConfig(locationId) : null
        ]);
        return createResult;
    }

    async updateQuestion(questionId: string, body: UpdateQuestionRequest): Promise<CovidQuestionEntity> {
        const question = await this.questionRepository.findOne(questionId);

        if (!question) {
            return null;
        }

        await this.questionRepository.save({ id: questionId, ...body });
        return this.getQuestionById(questionId);
    }

    async getQuestionById(questionId: string): Promise<CovidQuestionEntity> {
        const entity = await this.questionRepository.findOne(questionId, { relations: ["location"] });
        return entity ? entity : null;
    }

    async getAllQuestions(locationId: string): Promise<CovidQuestionEntity[]> {
        return this.questionRepository.find({
            where: { location: locationId },
            relations: ["location"],
            order: {
                createdAt: "ASC"
            }
        });
    }

    async removeQuestion(questionId: string): Promise<string> {
        await this.questionRepository.delete(questionId);
        return questionId;
    }

    async getCovidQuestionnaireScheduleConfig(locationId: string): Promise<CovidQuestionnaireScheduleEntity> {
        const entity = await this.questionnaireScheduleRepository.findOne({
            where: { location: locationId },
            relations: ["location"]
        });
        return entity ? entity : null;
    }

    async updateQuestionnaireScheduleConfig(
        locationId: string,
        body: QuestionnaireScheduleCreateOrUpdateRequest
    ): Promise<CovidQuestionnaireScheduleEntity> {
        const entity = await this.questionnaireScheduleRepository.findOne(body.id);

        if (!entity) {
            return null;
        }

        await this.questionnaireScheduleRepository.save(body);
        return this.getCovidQuestionnaireScheduleConfig(locationId);
    }

    async createDefaultQuestionnaireScheduleConfig(locationId: string): Promise<void> {
        const location = await this.locationService.getLocationById(locationId);
        const entity = this.questionnaireScheduleRepository.create({
            isActive: false,
            startTime: 4,
            reminderTime: 15,
            cancellationTime: 5
        });
        entity.location = location;

        await this.questionnaireScheduleRepository.save(entity);
    }
}
