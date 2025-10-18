import { injectable } from "inversify";
import { IUserRepository } from "../interfaces/IUserRepository";
import { IUser, UserModel } from "../models";
// import { HydratedDocument, LeanDocument } from "mongoose";

export class UserRepository implements IUserRepository {
  async create(user: Partial<IUser>): Promise<IUser> {
    return UserModel.create(user);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email });
  }

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id);
  }

  async updateProfile(
    userId: string,
    updates: Partial<IUser>
  ): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(userId, updates, { new: true });
  }

  async addContact(userId: string, contactId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: { contacts: contactId }, //Prevent duplicate
    });
    await UserModel.findByIdAndUpdate(contactId, {
      $addToSet: { contacts: userId },
    });
  }

  async removeContact(userId: string, contactId: string): Promise<void> {
    await UserModel.updateMany(
      { _id: { $in: [userId, contactId] } },
      { $pull: { contacts: { $in: [userId, contactId] } } }
    );
  }

  async findByIdWithContacts(id: string): Promise<IUser | null> {
    return UserModel.findById(id)
      .populate("contacts", "username displayName avatarUrl status")
      .lean<IUser>();
  }
}
