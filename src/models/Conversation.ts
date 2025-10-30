import { Schema, model, Document, Types } from "mongoose";

export enum ConversationType {
  PRIVATE = "private",
  GROUP = "group",
}

export interface IConversation extends Document {
  _id: Types.ObjectId;
  type: ConversationType;
  participants: Types.ObjectId[];
  name?: string;
  lastMessage?: Types.ObjectId | null;
  groupAvatar?: string;
  createdBy?: Types.ObjectId | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    type: {
      type: String,
      enum: Object.values(ConversationType),
      default: ConversationType.PRIVATE,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        require: true,
      },
    ],
    name: {
      type: String,
      trim: true,
    },
    groupAvatar: {
      type: String,
      trim: true,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });

export const ConversationModel = model<IConversation>(
  "Conversation",
  conversationSchema
);
