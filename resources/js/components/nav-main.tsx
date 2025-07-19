import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, CirclePlus, CircleDollarSign, UserRoundPlus, UserCheck, Calendar, ChevronDown, Clock, CalendarPlus } from 'lucide-react';
import { useState } from 'react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const [isCadastrosOpen, setIsCadastrosOpen] = useState(false);
    const [isAgendaOpen, setIsAgendaOpen] = useState(false);
    
    // @ts-ignore - acessar dados do usuário
    const user = page.props.auth?.user;
    const isAdmin = user?.role === 'admin';
    
    return (
        <>
            <SidebarGroup className="px-2 py-0">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip={{ children: 'Dashboard' }} isActive={page.url.startsWith('/dashboard')}>
                            <Link href="/dashboard" prefetch>
                                <LayoutGrid className="mr-2" />
                                <span>Dashboard</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup className="px-2 py-0">
                <Collapsible open={isAgendaOpen} onOpenChange={setIsAgendaOpen}>
                    <CollapsibleTrigger asChild>
                        <SidebarGroupLabel className="gap-2 cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm text-sidebar-foreground font-normal">
                            <Calendar className="mr-2" />
                            <span>Agenda</span>
                            <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${isAgendaOpen ? 'rotate-180' : ''}`} />
                        </SidebarGroupLabel>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={page.url.startsWith('/calendar')} className="pl-8">
                                        <Link href="/calendar" prefetch>
                                            <Calendar className="mr-2" />
                                            <span>Agenda</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={page.url.startsWith('/recurring-classes')} className="pl-8">
                                        <Link href="/recurring-classes" prefetch>
                                            <Clock className="mr-2" />
                                            <span>Aula Recorrente</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={page.url.startsWith('/classes/create')} className="pl-8">
                                        <Link href="/classes/create" prefetch>
                                            <CalendarPlus className="mr-2" />
                                            <span>Aula Avulsa</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </CollapsibleContent>
                </Collapsible>
            </SidebarGroup>
            
            <SidebarGroup className="px-2 py-0">
                <Collapsible open={isCadastrosOpen} onOpenChange={setIsCadastrosOpen}>
                    <CollapsibleTrigger asChild>
                        <SidebarGroupLabel className="gap-2 cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm text-sidebar-foreground font-normal">
                            <CirclePlus className="mr-2" />
                            <span>Cadastros</span>
                            <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${isCadastrosOpen ? 'rotate-180' : ''}`} />
                        </SidebarGroupLabel>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {isAdmin && (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={page.url.startsWith('/plans')} className="pl-8">
                                            <Link href="/plans" prefetch>
                                                <CircleDollarSign className="mr-2" />
                                                <span>Planos</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )}
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={page.url.startsWith('/students')} className="pl-8">
                                        <Link href="/students" prefetch>
                                            <UserRoundPlus className="mr-2" />
                                            <span>Alunos</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                {isAdmin && (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={page.url.startsWith('/users')} className="pl-8">
                                            <Link href="/users" prefetch>
                                                <UserCheck className="mr-2" />
                                                <span>Usuários</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </CollapsibleContent>
                </Collapsible>
            </SidebarGroup>

            <SidebarGroup className="px-2 py-0">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip={{ children: 'Mensalidades' }} isActive={page.url.startsWith('/payments')}>
                            <Link href="/payments" prefetch>
                                <CircleDollarSign className="mr-2" />
                                <span>Mensalidades</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>
        </>
    );
}
