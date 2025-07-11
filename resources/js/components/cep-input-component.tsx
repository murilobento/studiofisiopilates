import React from 'react';
import { Input } from '@/components/ui/input';

interface CepInputProps {
    value: string;
    onChange: (value: string) => void;
    onAddressFound?: (address: any) => void;
    className?: string;
    placeholder?: string;
    required?: boolean;
}

const CepInput: React.FC<CepInputProps> = ({ 
    value, 
    onChange, 
    onAddressFound,
    className = '', 
    placeholder = '00000-000',
    required = false 
}) => {
    const formatCep = (cep: string) => {
        // Remove tudo que não é dígito
        const numbers = cep.replace(/\D/g, '');
        
        // Aplica a máscara
        if (numbers.length <= 5) {
            return numbers;
        } else {
            return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const formattedValue = formatCep(rawValue);
        onChange(formattedValue);
    };

    const handleBlur = async () => {
        if (value && value.replace(/\D/g, '').length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${value.replace(/\D/g, '')}/json/`);
                const data = await response.json();
                
                if (!data.erro && onAddressFound) {
                    onAddressFound(data);
                }
            } catch (error) {
                console.error('Erro ao buscar CEP:', error);
            }
        }
    };

    return (
        <Input
            type="text"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            className={className}
            placeholder={placeholder}
            required={required}
            maxLength={9}
        />
    );
};

export default CepInput; 