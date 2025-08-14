import {
  Product as ProductPrisma,
  Category as CategoryPrisma,
  Subcategory as SubcategoryPrisma,
} from "@prisma/client";
import { Key } from "react";
import { Theme } from "./themeContext";

export interface DecodedToken {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface UserState {
  id: string | null;
  firstName: string | null;
  lastName: string | null;
  token: string | null;
  isLoggedIn: boolean;
}

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  city?: string;
  address?: string;
  phone?: string;
}

export interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  city: string;
  address: string;
  phone: string;
}

export interface Product {
  name: string;
  code: string;
  price: number | undefined;
  description: string;
  images: string[];
  subcategoryIds?: string[];
}

export interface Category {
  name: string;
  code: string;
  imageUrl: string | null;
}

export interface Subcategory {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  category: {
    name: string;
  };
}

export interface Message {
  name: string;
  email: string;
  title: string;
  content: string;
}

export interface ProductWithSubcategories extends ProductPrisma {
  subcategories: {
    subcategory: Subcategory;
    id: string;
    name: string;
    code: string;
    categoryId: string;
  }[];
}

export interface AlertMessageProps {
  severity: "success" | "error";
  message: string;
}

export interface DashboardCategoryCardProps {
  category: CategoryPrisma;
  onDelete: (id: string) => void;
}

export interface CategoryCardProps {
  category: Category;
}

export interface CategoryPageProps {
  category: {
    id: string;
    name: string;
  };
  subcategories: SubcategoryPrisma[];
}

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mainMessage: string;
  deletingMessage?: string;
  isDeleting?: boolean;
}

export interface PaginationButtonsProps {
  itemsPerPage: number;
  totalItems: number;
  paginate: (pageNumber: number) => void;
  currentPage: number;
}

export interface DashboardProductCardProps {
  product: ProductPrisma;
  onDelete: (id: string) => void;
}

export interface ProductCardProps {
  product: ProductPrisma;
  onAddToCart: (id: string) => void;
}

export interface DashboardSubcategoryCardProps {
  id: Key | null | undefined;
  subcategory: {
    id: string;
    name: string;
    code: string;
    category: {
      name: string;
    };
  };
  onDelete: (id: string) => void;
}

export interface DashboardSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
