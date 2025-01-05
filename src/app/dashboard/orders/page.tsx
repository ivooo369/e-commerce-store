import DashboardNav from "@/app/ui/dashboard/dashboard-primary-nav";

export default function DashboardOrdersPage() {
  return (
    <>
      <DashboardNav />
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-5xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-4 sm:mb-6 tracking-wide">
          Поръчки
        </h1>
      </div>
    </>
  );
}
