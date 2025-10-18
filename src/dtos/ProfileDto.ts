import { IsString, IsOptional, IsEnum, IsUrl } from "class-validator";
import { UserStatus } from "../models";

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    displayName?: string;

    @IsOptional()
    @IsUrl()
    avatarUrl?: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsEnum(UserStatus)
    status?:UserStatus;
}