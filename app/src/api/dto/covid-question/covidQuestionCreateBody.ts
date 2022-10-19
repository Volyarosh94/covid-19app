import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CovidQuestionCreateBody {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    questionText: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    questionDetails?: string;

    @ApiProperty()
    @IsBoolean()
    @IsNotEmpty()
    isPositive: boolean;
}
