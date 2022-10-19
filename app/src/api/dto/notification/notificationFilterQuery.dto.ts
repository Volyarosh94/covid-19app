import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";

export class NotificationFilterQuery {
    @ApiPropertyOptional({
        example: 1
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page?: number;
}
