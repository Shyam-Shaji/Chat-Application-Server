import { injectable } from "inversify";
import { IUserRepository } from "../interfaces/IUserRepository";
import { IUser, UserModel } from "../models";

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
}
