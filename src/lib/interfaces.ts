import { Category as CategoryPrisma } from "@prisma/client";
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

export interface Product extends Omit<ProductBase, "id"> {
  id?: string;
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

export interface ProductWithSubcategories extends ProductBase {
  subcategories: Array<{
    id: string;
    name: string;
    code: string;
    categoryId: string;
    subcategory: {
      id: string;
      name: string;
      code: string;
      categoryId: string;
      category: {
        name: string;
      };
    };
  }>;
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
    code: string;
    description?: string;
  };
  subcategories: Array<{
    id: string;
    name: string;
    code: string;
    categoryId: string;
    createdAt: Date;
    updatedAt: Date;
    category: {
      id: string;
      name: string;
      code: string;
    };
  }>;
  allProducts?: ProductWithRelations[];
  categories?: CategoryPrisma[];
}

export interface ConfirmationModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  message: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  deletingMessage?: string;
  isDeleting?: boolean;
}

export interface PaginationButtonsProps {
  itemsPerPage: number;
  totalItems: number;
  paginate: (pageNumber: number) => void;
  currentPage: number;
  className?: string;
}

export interface DashboardProductCardProps {
  product: ProductBase;
  onDelete: (id: string) => void;
}

export interface ProductBase {
  id?: string;
  name: string;
  code: string;
  price: number;
  description: string;
  images: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ProductCardProps {
  product: ProductBase;
  onAddToCart?: (id: string) => void;
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

export interface FavoritesState {
  products: Product[];
}

export interface UpdateUser {
  firstName?: string;
  lastName?: string;
  email?: string;
  city?: string;
  address?: string;
  phone?: string;
}

export interface CartItem {
  product: ProductBase;
  quantity: number;
}

export interface FavoritesState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export interface ProductWithRelations {
  id: string;
  name: string;
  code: string;
  price: number;
  description: string;
  images: string[];
  subcategories: Array<{
    subcategory: {
      id: string;
      name: string;
      code: string;
      category: {
        id: string;
        name: string;
        code: string;
        imageUrl: string | null;
      };
    };
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Office {
  id: string;
  name: string;
  address: {
    full: string;
    city: string;
    street: string;
    number: string;
    quarter: string;
    other: string;
    workTime?: string;
  };
  phones: string[];
  workTime: string;
  isMachine: boolean;
  latitude?: number;
  longitude?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  weeklySchedule: Array<{
    day: string;
    time: string | null;
    isDayOff: boolean;
  }>;
}

interface EcontOfficeAddress {
  city?: {
    name: string;
  };
  fullAddress?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface EcontOffice {
  id: string | number;
  name: string;
  address?: EcontOfficeAddress;
  normalBusinessHoursFrom: number;
  normalBusinessHoursTo: number;
  halfDayBusinessHoursFrom: number;
  halfDayBusinessHoursTo: number;
  phones?: string[];
  emails?: string[];
}

export interface EcontOfficeResponse {
  code: string;
  id: string;
  name: string;
  address: {
    city: {
      name: string;
    };
    street: string;
    num: string;
    quarter: string;
    other: string;
    full: string;
    fullAddress: string;
  };
  phones: string[];
  isMachine: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
  latitude?: number;
  longitude?: number;
}

export interface SpeedyOffice {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  workTime: string;
  isMachine: boolean;
  latitude?: number;
  longitude?: number;
}

export interface SpeedyOfficeResponse {
  id: string;
  code: string;
  name: string;
  fullAddress: string;
  address: {
    city: {
      name: string;
    };
    fullAddress: string;
    quarter: string;
    street: string;
    num: string;
    other: string;
  };
  phones: string[];
  workTime: string;
  isAPS: boolean;
  isMachine: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
  weeklySchedule: Array<{
    day: string;
    time: string;
  }>;
}

export interface FormDataDelivery {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  deliveryMethod: "speedy" | "econt" | "address";
  officeId: string;
  city: string;
  region: string;
  municipality: string;
  address: string;
  notes: string;
  agreeTerms: boolean;
}

export interface DeliveryOption {
  id: "address" | "speedy" | "econt";
  title: string;
  shortTitle?: string;
  description: string;
  icon: React.ReactNode;
  price: string;
  color: string;
}

export interface ApiOffice {
  id: string | number;
  name: string;
  fullAddress?: string;
  city?: string | { name: string };
  street?: string;
  num?: string | number;
  quarter?: string;
  other?: string;
  workTime?: string;
  phones?: (string | number)[];
  isMachine?: boolean;
  isAPS?: boolean;
  latitude?: number;
  longitude?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  weeklySchedule?: Array<{
    day: string;
    time?: string | null;
  }>;
  address?: {
    fullAddress?: string;
    city?: string | { name: string };
    street?: string;
    num?: string | number;
    quarter?: string;
    other?: string;
  };
}

export interface OfficeMapProps {
  cityName: string;
  offices: Office[];
  selectedOfficeId?: string;
  onOfficeSelect?: (officeId: string) => void;
  className?: string;
  center?: [number, number];
}

export interface Settlement {
  placeName: string;
  postalCode: string;
  adminName1: string;
  adminName2: string;
  countryCode: string;
  lat: string;
  lng: string;
}

export interface SettlementInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (settlement: Settlement) => void;
  required?: boolean;
  className?: string;
}

export interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

export interface CartItem {
  product: ProductBase;
  quantity: number;
}

export interface CartItemResponse {
  product: {
    id: string;
    name: string;
    code: string;
    price: number;
    description?: string;
    images?: string[];
    createdAt?: string;
    updatedAt?: string;
  };
  quantity: number;
}

export interface ClearCartConfirmationModalProps
  extends Omit<ConfirmationModalProps, "title" | "message"> {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface OrderItem {
  id?: string;
  product: Product;
  quantity: number;
  price?: number;
}

export interface OrderResponse {
  id: string;
  name: string;
  email: string;
  city: string;
  address: string;
  phone: string;
  additionalInfo: string | null;
  items: OrderItem[];
  status: string;
  createdAt: string;
  updatedAt: string;
  total: number;
  productsTotal: number;
  shippingCost: number;
}

export interface OrderStatusResponse {
  status: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface ConfirmOrCancelPageProps {
  searchParams: {
    orderId?: string;
  };
}

export interface StatusPageProps {
  searchParams: {
    orderId?: string;
    status?: string;
  };
}

export interface OrderData {
  customerId: string;
  name: string;
  email: string;
  city: string;
  address: string;
  phone: string;
  additionalInfo: string;
  items: OrderItem[];
}
