import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
