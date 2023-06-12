import { Gender } from "./Employee";
import { MaritalStatus } from "./UserProfile";

// Contains all User fields and all UserProfile fields
export interface UserRegisterDTO {
    name: string;
    password: string;

    bio: string;
    location: string;

    birthday?: string;
    gender: Gender;
    maritalStatus: MaritalStatus;
}
