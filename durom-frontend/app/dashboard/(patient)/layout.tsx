import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

export default function PatientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-secondary-white font-sans">
      {/*  Navigation Sidebar */}
      <Sidebar />

      {/* Main Content  */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <DashboardHeader />

        {/* Dynamic Page Routing Frame */}
        <main className="flex-1 overflow-y-auto p-8 animate-page-fade">
          {children}
        </main>
      </div>
    </div>
  );
}
