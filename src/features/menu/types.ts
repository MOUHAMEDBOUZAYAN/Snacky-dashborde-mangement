export interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuItemCategoryRef {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  categoryId: string;
  createdAt?: string;
  updatedAt?: string;
  category?: MenuItemCategoryRef;
}

export interface CategoryWithItems extends Category {
  items: Omit<MenuItem, "category">[];
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export interface CreateMenuItemInput {
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  isAvailable: boolean;
  categoryId: string;
}

export type UpdateMenuItemInput = Partial<CreateMenuItemInput>;

export interface MenuListQuery {
  categoryId?: string;
  availableOnly?: boolean;
  grouped?: boolean;
}
