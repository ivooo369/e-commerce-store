import DashboardNav from "@/app/ui/dashboard/dashboard-primary-nav";
import DashboardSecondaryNav from "@/app/ui/dashboard/dashboard-secondary-nav";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Направени поръчки",
};

export default function DashboardCategoriesAndSubcategoriesPage() {
  return (
    <>
      <DashboardNav />
      <DashboardSecondaryNav />
      <h1>АДМИНИСТРАТОРСКИ ПАНЕЛ - УПРАВЛЕНИЕ НА КАТЕГОРИИ И ПОДКАТЕГОРИИ</h1>
    </>
  );
}
