import { AddQuestionRequest } from "./contract/addQuestionRequest";
import { QuestionnaireScheduleCreateOrUpdateRequest } from "./contract/questionnaireScheduleCreateOrUpdateRequest";
import { UpdateQuestionRequest } from "./contract/updateQuestionRequest";
import { CovidQuestionEntity } from "./entity/covidQuestion.entity";
import { CovidQuestionnaireScheduleEntity } from "./entity/covidQuestionnaireSchedule.entity";

export interface ICovidQuestionService {
    addQuestion(locationId: string, request: AddQuestionRequest): Promise<CovidQuestionEntity>;
    updateQuestion(questionId: string, request: UpdateQuestionRequest): Promise<CovidQuestionEntity>;
    removeQuestion(questionId: string): Promise<string>;
    getQuestionById(questionId: string): Promise<CovidQuestionEntity>;
    getAllQuestions(locationId: string): Promise<CovidQuestionEntity[]>;
    getCovidQuestionnaireScheduleConfig(locationId: string): Promise<CovidQuestionnaireScheduleEntity>;
    updateQuestionnaireScheduleConfig(
        locationId: string,
        body: QuestionnaireScheduleCreateOrUpdateRequest
    ): Promise<CovidQuestionnaireScheduleEntity>;
    createDefaultQuestionnaireScheduleConfig(locationId: string): Promise<void>;
}
