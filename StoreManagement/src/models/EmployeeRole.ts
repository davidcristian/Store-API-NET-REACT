import { Employee } from "./Employee";
import { User } from "./User";

export interface EmployeeRole {
    id?: number;
    name: string;
    description: string;

    roleLevel: number;

    storeEmployees?: Employee[];

    userId?: number;
    user?: User;
}
