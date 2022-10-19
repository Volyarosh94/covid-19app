import {
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
    UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ICovidQuestionService } from "../../covid-question-service/ICovidQuestionService";
import { COVID_QUESTION_SERVICE } from "../../covid-question-service/ioc";
import { ILocationService } from "../../location-service/ILocationService";
import { LOCATION_SERVICE } from "../../location-service/ioc";
import { CovidQuestionCreateBody } from "../dto/covid-question/covidQuestionCreateBody";
import { CovidQuestionPresentation } from "../dto/covid-question/covidQuestionPresentation";
import { CovidQuestionUpdateBody } from "../dto/covid-question/covidQuestionUpdateBody";
import { QuestionnaireScheduleUpdateBody } from "../dto/covid-question/questionnaiareUpdateBody.dto";
import { QuestionnaireSchedulePresentation } from "../dto/covid-question/questionnaireSchedulePresentation.dto";
import { LocationNotFoundHttpException } from "../exceptions/locationNotFoundHttpException";
import { AzureADGuard } from "../guards/auth.guard";
import { CovidQuestionPresentationMapper } from "../mappers/covidQuestionPresentation.mapper";

@ApiTags("Covid-Question")
@Controller("covid-questions")
@ApiBearerAuth()
@UseGuards(AzureADGuard)
export class CovidQuestionController {
    constructor(
        @Inject(COVID_QUESTION_SERVICE)
        private readonly covidQuestionService: ICovidQuestionService,
        @Inject(LOCATION_SERVICE)
        private readonly locationService: ILocationService,
        private readonly mapper: CovidQuestionPresentationMapper
    ) {}

    @Get(":locationId/location-questions")
    @ApiOperation({ summary: "Get list of all questions" })
    @ApiOkResponse({ type: [CovidQuestionPresentation] })
    async getAll(
        @Param("locationId", new ParseUUIDPipe({ version: "4" })) locationId: string
    ): Promise<CovidQuestionPresentation[]> {
        const location = await this.locationService.getLocationById(locationId);
        if (!location) {
            throw new LocationNotFoundHttpException(locationId);
        }
        const entities = await this.covidQuestionService.getAllQuestions(locationId);
        return entities.map(this.mapper.mapToCovidQuestionPresentation);
    }

    @Get(":questionId")
    @ApiOperation({ summary: "Get a certain question" })
    @ApiOkResponse({ type: CovidQuestionPresentation })
    async get(
        @Param("questionId", new ParseUUIDPipe({ version: "4" })) questionId: string
    ): Promise<CovidQuestionPresentation> {
        const entity = await this.covidQuestionService.getQuestionById(questionId);
        return this.mapper.mapToCovidQuestionPresentation(entity);
    }

    @Post(":locationId")
    @ApiOperation({ summary: "Add new question" })
    @ApiOkResponse({ type: CovidQuestionPresentation })
    async addQuestion(
        @Param("locationId", new ParseUUIDPipe({ version: "4" })) locationId: string,
        @Body() body: CovidQuestionCreateBody
    ): Promise<CovidQuestionPresentation> {
        const location = await this.locationService.getLocationById(locationId);
        if (!location) {
            throw new LocationNotFoundHttpException(locationId);
        }
        const entity = await this.covidQuestionService.addQuestion(locationId, body);
        return this.mapper.mapToCovidQuestionPresentation(entity);
    }

    @Put(":questionId")
    @ApiOperation({ summary: "Update question" })
    @ApiOkResponse({ type: CovidQuestionPresentation })
    async updateQuestion(
        @Param("questionId", new ParseUUIDPipe({ version: "4" })) questionId: string,
        @Body() body: CovidQuestionUpdateBody
    ): Promise<CovidQuestionPresentation> {
        const question = await this.covidQuestionService.getQuestionById(questionId);

        if (!question) {
            throw new NotFoundException("Question not found");
        }

        const entity = await this.covidQuestionService.updateQuestion(questionId, body);
        return this.mapper.mapToCovidQuestionPresentation(entity);
    }

    @Delete(":questionId")
    @ApiOperation({ summary: "Remove question" })
    @ApiResponse({ status: 200 })
    async removeQuestion(
        @Param("questionId", new ParseUUIDPipe({ version: "4" })) questionId: string
    ): Promise<{ id: string }> {
        const id = await this.covidQuestionService.removeQuestion(questionId);
        return { id };
    }

    @Put(":locationId/schedule")
    @ApiOperation({ summary: "Update questionnaire schedule config" })
    @ApiResponse({ type: QuestionnaireSchedulePresentation })
    async updateQuestionnaireSchedule(
        @Param("locationId", new ParseUUIDPipe({ version: "4" })) locationId: string,
        @Body() body: QuestionnaireScheduleUpdateBody
    ): Promise<QuestionnaireSchedulePresentation> {
        const location = await this.locationService.getLocationById(locationId);

        if (!location) {
            throw new LocationNotFoundHttpException(locationId);
        }

        const entity = await this.covidQuestionService.updateQuestionnaireScheduleConfig(locationId, body);
        return this.mapper.mapToQuestionnaireSchedulePresentation(entity);
    }

    @Get(":locationId/schedule")
    @ApiOperation({ summary: "Get questionnaire schedule config" })
    @ApiResponse({ type: QuestionnaireSchedulePresentation })
    async getCovidQuestionnaireSchedule(
        @Param("locationId", new ParseUUIDPipe({ version: "4" })) locationId: string
    ): Promise<QuestionnaireSchedulePresentation> {
        const entity = await this.covidQuestionService.getCovidQuestionnaireScheduleConfig(locationId);
        return this.mapper.mapToQuestionnaireSchedulePresentation(entity);
    }
}
