import { IUser } from "../models";

export interface IUserRepository {
  create(user: Partial<IUser>): Promise<IUser>;
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;

  updateProfile(userId: string, updates: Partial<IUser>): Promise<IUser | null>;
  addContact(userId: string, contactId: string): Promise<void>;
  removeContact(userId: string, contactId: string): Promise<void>;
  findByIdWithContacts(id: string): Promise<IUser | null>;
}
