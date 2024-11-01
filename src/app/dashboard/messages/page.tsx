import DashboardNav from "@/app/ui/dashboard/dashboard-primary-nav";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Изпратени съобщения",
};

export default function DashboardMessagesPage() {
  return (
    <>
      <DashboardNav />
      <h1>АДМИНИСТРАТОРСКИ ПАНЕЛ - СЪОБЩЕНИЯ</h1>;
    </>
  );
}
