import DashboardNav from "@/app/ui/dashboard/dashboard-primary-nav";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Направени поръчки",
};

export default function DashboardOrdersPage() {
  return (
    <>
      <DashboardNav />
      <h1>АДМИНИСТРАТОРСКИ ПАНЕЛ - ПОРЪЧКИ</h1>
    </>
  );
}
