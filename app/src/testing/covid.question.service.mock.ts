import { ICovidQuestionService } from "../covid-question-service/ICovidQuestionService";

export const mockCovidQuestionService = (): ICovidQuestionService => ({
    getQuestionById: jest.fn(),
    addQuestion: jest.fn(),
    getAllQuestions: jest.fn(),
    removeQuestion: jest.fn(),
    updateQuestion: jest.fn(),
    updateQuestionnaireScheduleConfig: jest.fn(),
    getCovidQuestionnaireScheduleConfig: jest.fn(),
    createDefaultQuestionnaireScheduleConfig: jest.fn()
});
