import { Schema, model, Document, Types } from "mongoose";

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  FILE = "file",
}

export interface IMessage extends Document {
  _id: Types.ObjectId;
  sender: Types.ObjectId;
  receiver?: Types.ObjectId | null;
  roomId?: Types.ObjectId | null;
  content: string;
  type: MessageType;
  attachments?: string[];
  editedAt?: Date | null;
  deletedAt?: Date | null;
  readBy: Types.ObjectId[];
  conversation: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      default: null,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(MessageType),
      default: MessageType.TEXT,
    },
    attachments: [
      {
        type: String,
        trim: true,
      },
    ],
    editedAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const MessageModel = model<IMessage>("Message", messageSchema);
