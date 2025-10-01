import { Subcategory, Category, Product } from "@prisma/client";
import { store } from "../store/store";

export type Theme = "light" | "dark";

export type AlertSeverity = "success" | "error";

type SerializablePrimitive = string | number | boolean | null | undefined;

export type SerializableObject = { [key: string]: Serializable };

type SerializableArray = Serializable[];

export type Serializable =
  | SerializablePrimitive
  | Date
  | SerializableObject
  | SerializableArray;

export type SubcategoryWithRelations = Subcategory & {
  category: Category;
};

export type ProductWithSubcategories = Product & {
  subcategories: Array<{
    subcategory: SubcategoryWithRelations;
  }>;
  createdAt: Date;
  updatedAt: Date;
};

export type SortField =
  | "id"
  | "createdAt"
  | "total"
  | "customer"
  | "status"
  | "isCompleted";

export type SortOrder = "asc" | "desc";

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
