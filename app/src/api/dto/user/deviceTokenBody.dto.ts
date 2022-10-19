import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class DeviceTokenBody {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    deviceToken?: string;
}
