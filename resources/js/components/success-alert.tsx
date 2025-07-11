import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, X } from 'lucide-react';

interface SuccessAlertProps {
    message: string;
    className?: string;
}

const SuccessAlert: React.FC<SuccessAlertProps> = ({ message, className = '' }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 10000);
        return () => clearTimeout(timer);
    }, [message]);

    if (!visible) return null;

    return (
        <Alert className={`bg-green-50 border-green-200 text-green-800 relative ${className}`}>
            <button
                type="button"
                onClick={() => setVisible(false)}
                className="absolute top-2 right-2 p-1 rounded hover:bg-green-100 focus:outline-none"
                aria-label="Fechar alerta"
            >
                <X className="h-4 w-4 text-green-600" />
            </button>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
                {message}
            </AlertDescription>
        </Alert>
    );
};

export default SuccessAlert; 