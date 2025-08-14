import DashboardNav from "@/ui/dashboard/dashboard-primary-nav";

export default function DashboardOrdersPage() {
  return (
    <>
      <DashboardNav />
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-5xl bg-bg-secondary min-h-screen">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-text-primary mb-4 sm:mb-6 tracking-wide">
          Поръчки
        </h1>
      </div>
    </>
  );
}
