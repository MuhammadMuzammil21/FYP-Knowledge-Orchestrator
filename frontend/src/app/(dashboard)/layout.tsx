import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <main className="md:ml-64 flex-1 overflow-y-auto bg-background">
                {children}
            </main>
        </div>
    );
}
