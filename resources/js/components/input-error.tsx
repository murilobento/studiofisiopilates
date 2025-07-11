import { cn } from '@/lib/utils';
import { type HTMLAttributes } from 'react';

export default function InputError({ message, className = '', ...props }: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    // Mensagem padrão em português caso não haja mensagem específica
    const msg = message || 'Ocorreu um erro.';
    return message ? (
        <p {...props} className={cn('text-sm text-red-600 dark:text-red-400', className)}>
            {msg}
        </p>
    ) : null;
}
