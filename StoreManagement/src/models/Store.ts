import { StoreShift } from "./StoreShift";
import { User } from "./User";

export enum StoreCategory {
    General,
    Food,
    Clothing,
    Electronics,
    Furniture,
}

export interface Store {
    id?: number;
    name: string;
    description: string;

    category: StoreCategory;
    address: string;

    city: string;
    state: string;

    zipCode: string;
    country: string;

    openDate?: string;
    closeDate?: string;

    storeShifts?: StoreShift[];

    userId?: number;
    user?: User;
}
