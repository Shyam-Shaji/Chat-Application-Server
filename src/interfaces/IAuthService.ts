import { RegisterDto } from "../dtos/RegisterDto";
import { LoginDto } from "../dtos/LoginDto";
import { type IUser } from "../models";

// export interface IAuthService {
//   register(dto: RegisterDto): Promise<{ user: IUser; token: string }>;
//   login(dto: LoginDto): Promise<{ user: IUser; token: string }>;
// }

export interface IAuthService {
  register(dto: RegisterDto): Promise<{ user: Partial<IUser>; token: string }>; // ✅ FIXED: Full IUser
  login(dto: LoginDto): Promise<{ user: Partial<IUser>; token: string }>; // ✅ FIXED: Full IUser
}
