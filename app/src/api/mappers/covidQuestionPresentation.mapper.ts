import { CovidQuestionEntity } from "../../covid-question-service/entity/covidQuestion.entity";
import { CovidQuestionnaireScheduleEntity } from "../../covid-question-service/entity/covidQuestionnaireSchedule.entity";
import { CovidQuestionPresentation } from "../dto/covid-question/covidQuestionPresentation";
import { QuestionnaireSchedulePresentation } from "../dto/covid-question/questionnaireSchedulePresentation.dto";

export class CovidQuestionPresentationMapper {
    mapToCovidQuestionPresentation(entity: CovidQuestionEntity): CovidQuestionPresentation {
        return {
            id: entity.id,
            questionDetails: entity.questionDetails,
            questionText: entity.questionText,
            isPositive: entity.isPositive,
            createdAt: entity.createdAt,
            locationId: entity.location.id
        };
    }

    mapToQuestionnaireSchedulePresentation(
        entity: CovidQuestionnaireScheduleEntity
    ): QuestionnaireSchedulePresentation {
        return {
            id: entity.id,
            startTime: entity.startTime,
            reminderTime: entity.reminderTime,
            cancellationTime: entity.cancellationTime,
            locationId: entity.location.id,
            isActive: entity.isActive
        };
    }
}
