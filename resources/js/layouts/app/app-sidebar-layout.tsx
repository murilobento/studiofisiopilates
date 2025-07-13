import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { NavFooter } from '@/components/nav-footer';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <div className="flex flex-1 flex-col w-full max-w-full overflow-x-hidden">
                <AppContent variant="sidebar" className="flex-1 w-full max-w-full overflow-x-hidden">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    <div className="flex-1 w-full max-w-full overflow-x-hidden p-4">
                        {children}
                    </div>
                </AppContent>
                <NavFooter />
            </div>
        </AppShell>
    );
}
