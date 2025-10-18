import { Schema, model, Document, Types } from "mongoose";

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  MODERATOR = "moderator",
}

export enum UserStatus{
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away',
}

export interface IUser extends Document {
  _id: Types.ObjectId | string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  lastSeen: Date;
  status: UserStatus;
  contacts: Types.ObjectId[];
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    displayName:{
      type: String,
      default: '',
    },
    avatarUrl:{
      type: String,
    },
    bio:{
      type: String,
    },
    lastSeen:{
      type: Date,
      default: Date.now
    },
    status:{
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.OFFLINE
    },
    contacts:[{
      type: Schema.Types.ObjectId,
      ref:'User'
    }],
  },
  { timestamps: true }
);

export const UserModel = model<IUser>("User", userSchema);
