import React from 'react';
import { Input } from '@/components/ui/input';

interface CpfInputProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
    required?: boolean;
}

const CpfInput: React.FC<CpfInputProps> = ({ 
    value, 
    onChange, 
    className = '', 
    placeholder = '000.000.000-00',
    required = false 
}) => {
    const formatCpf = (cpf: string) => {
        // Remove tudo que não é dígito
        const numbers = cpf.replace(/\D/g, '');
        
        // Aplica a máscara
        if (numbers.length <= 3) {
            return numbers;
        } else if (numbers.length <= 6) {
            return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
        } else if (numbers.length <= 9) {
            return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
        } else {
            return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const formattedValue = formatCpf(rawValue);
        onChange(formattedValue);
    };

    return (
        <Input
            type="text"
            value={value}
            onChange={handleChange}
            className={className}
            placeholder={placeholder}
            required={required}
            maxLength={14}
        />
    );
};

export default CpfInput; 