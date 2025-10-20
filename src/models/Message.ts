import { Schema, model, Document, Types } from "mongoose";

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  FILE = "file",
}

export interface IMessage extends Document {
  sender: Types.ObjectId;
  receiver?: Types.ObjectId | null;
  roomId?: Types.ObjectId | null;
  content: string;
  type: MessageType;
  attachments?: string[];
  editedAt?: Date;
  deleteAt?: Date;
  readBy: Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(MessageType),
      default: MessageType.TEXT,
    },
    attachments: [
      {
        type: String,
      },
    ],
    editedAt: {
      type: Date,
    },
    deleteAt: {
      type: Date,
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
