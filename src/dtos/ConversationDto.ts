import {
  IsString,
  IsArray,
  IsMongoId,
  IsOptional,
  IsEnum,
} from "class-validator";
import { ConversationType } from "../models/Conversation";

export class CreateGroupDto {
  @IsString()
  name!: string;

  @IsArray()
  @IsMongoId({ each: true })
  participants!: string[];
}

export class AddParticipantDto {
  @IsMongoId()
  userId!: string;
}
