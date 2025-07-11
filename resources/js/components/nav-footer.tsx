import { type ComponentPropsWithoutRef } from 'react';

export function NavFooter({ className = '', ...props }: ComponentPropsWithoutRef<'footer'>) {
    return (
        <footer className={`w-full text-center py-3 text-xs text-muted-foreground bg-background border-t border-border ${className}`} {...props}>
            © {new Date().getFullYear()} Studio FisioPilates. Todos os direitos reservados.
        </footer>
    );
}
