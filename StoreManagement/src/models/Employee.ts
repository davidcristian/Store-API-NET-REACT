import { EmployeeRole } from "./EmployeeRole";
import { StoreShift } from "./StoreShift";
import { User } from "./User";

export enum Gender {
    Female,
    Male,
    Other,
}

export interface Employee {
    id?: number;
    firstName: string;
    lastName: string;

    gender: Gender;

    employmentDate?: string;
    terminationDate?: string;
    salary: number;
    prediction?: number;

    storeEmployeeRoleId?: number;

    storeEmployeeRole?: EmployeeRole;
    storeShifts?: StoreShift[];

    userId?: number;
    user?: User;

    [key: string]: any;
}
