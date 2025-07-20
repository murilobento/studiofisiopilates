import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance) => {
    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());

    document.documentElement.classList.toggle('dark', isDark);
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    applyTheme(currentAppearance || 'system');
};

export function initializeTheme() {
    // Força sempre o modo light - desabilita dark mode
    const forcedAppearance = 'light';
    
    // Remove qualquer configuração anterior de tema
    localStorage.setItem('appearance', forcedAppearance);
    setCookie('appearance', forcedAppearance);
    
    applyTheme(forcedAppearance);

    // Remove o listener de mudanças do sistema já que sempre usaremos light
    // mediaQuery()?.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance() {
    // Sempre retorna 'light' - dark mode desabilitado
    const [appearance, setAppearance] = useState<Appearance>('light');

    const updateAppearance = useCallback((mode: Appearance) => {
        // Ignora qualquer tentativa de mudança de tema - sempre mantém light
        console.warn('Mudança de tema desabilitada. O sistema está configurado para usar apenas o modo light.');
        
        // Força sempre o modo light
        const forcedMode = 'light';
        setAppearance(forcedMode);
        localStorage.setItem('appearance', forcedMode);
        setCookie('appearance', forcedMode);
        applyTheme(forcedMode);
    }, []);

    useEffect(() => {
        // Sempre força o modo light, ignorando qualquer configuração salva
        const forcedMode = 'light';
        setAppearance(forcedMode);
        localStorage.setItem('appearance', forcedMode);
        setCookie('appearance', forcedMode);
        applyTheme(forcedMode);

        // Remove listener do sistema já que não usaremos
        // return () => mediaQuery()?.removeEventListener('change', handleSystemThemeChange);
    }, []);

    return { appearance, updateAppearance } as const;
}
