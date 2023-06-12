import { Employee } from "./Employee";
import { Store } from "./Store";
import { User } from "./User";

export interface StoreShift {
    startDate?: string;
    endDate?: string;

    storeId: number;
    storeEmployeeId: number;

    store?: Store;
    storeEmployee?: Employee;

    userId?: number;
    user?: User;
}
