import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LocationModule } from "../location-service/location.module";
import { CovidQuestionService } from "./covid.question.service";
import { CovidQuestionEntity } from "./entity/covidQuestion.entity";
import { CovidQuestionnaireScheduleEntity } from "./entity/covidQuestionnaireSchedule.entity";
import { COVID_QUESTION_SERVICE } from "./ioc";

@Module({
    imports: [TypeOrmModule.forFeature([CovidQuestionEntity, CovidQuestionnaireScheduleEntity]), LocationModule],
    providers: [
        {
            provide: COVID_QUESTION_SERVICE,
            useClass: CovidQuestionService
        }
    ],
    exports: [
        {
            provide: COVID_QUESTION_SERVICE,
            useClass: CovidQuestionService
        }
    ]
})
export class CovidQuestionModule {}
