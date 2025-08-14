
import React from 'react';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import Sidebar from '@/components/layout/Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <div className="w-64 border-r bg-card">
          <Sidebar />
        </div>
        <SidebarInset className="flex-1">
          <div className="flex items-center gap-2 p-4 border-b">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1" />
          </div>
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
