import { Head } from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Sun, Info } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Configurações',
        href: '/settings',
    },
    {
        title: 'Aparência',
        href: '/settings/appearance',
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configurações de Aparência" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Configurações de Aparência" description="Configurações de tema do sistema" />
                    
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                                    <Sun className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Modo Light Ativo</CardTitle>
                                    <CardDescription>
                                        O sistema está configurado para usar apenas o tema claro
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium mb-1">Tema fixo configurado</p>
                                    <p>
                                        Para manter a consistência visual e melhor experiência do usuário, 
                                        o sistema está configurado para usar exclusivamente o tema claro. 
                                        Esta configuração não pode ser alterada pelos usuários.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
