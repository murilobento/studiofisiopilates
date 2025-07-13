import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import AppLogo from './app-logo';
import { Home, Calendar, KanbanSquare, Users, CreditCard, Clock, UserCog } from 'lucide-react';

const menu: NavItem[] = [
    { title: 'Dashboard', href: '/dashboard', icon: Home },
    { title: 'Agenda', href: '/calendar', icon: Calendar },
    { title: 'Aulas', href: '/classes', icon: KanbanSquare },
    { title: 'Alunos', href: '/students', icon: Users },
    { title: 'Planos', href: '/plans', icon: CreditCard },
    { title: 'Grade Fixa', href: '/recurring-classes', icon: Clock },
    { title: 'Usuários', href: '/users', icon: UserCog },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={menu} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
