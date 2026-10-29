export interface Sauce {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSauceInput {
  name: string;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateSauceInput = Partial<{
  name: string;
  isActive: boolean;
  sortOrder: number;
}>;
