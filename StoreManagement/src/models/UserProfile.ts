import { User } from "./User";
import { Gender } from "./Employee";

export enum MaritalStatus {
    Single,
    Married,
    Widowed,
    Separated,
    Divorced,
}

export interface UserProfile {
    id?: number;

    userId?: number;
    user?: User;

    bio: string;
    location: string;

    birthday?: string;
    gender: Gender;
    maritalStatus: MaritalStatus;

    pagePreference?: number;
}
