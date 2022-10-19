import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CovidQuestionUpdateBody {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    questionText?: string;
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    questionDetails?: string;
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isPositive?: boolean;
}
