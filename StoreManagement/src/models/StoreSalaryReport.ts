import { StoreCategory } from "./Store";

export interface StoreSalaryReport {
  id: number;
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

  averageSalary: number;
}
