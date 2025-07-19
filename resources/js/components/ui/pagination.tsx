import React from 'react';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';

interface ServerPaginationData {
  from: number;
  to: number;
  total: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
}

interface ClientPaginationData {
  currentPage: number;
  totalPages: number;
  from: number;
  to: number;
  total: number;
  onPageChange: (page: number) => void;
}

interface PaginationProps {
  type: 'server' | 'client';
  data: ServerPaginationData | ClientPaginationData;
  itemName: string; // ex: "alunos", "aulas", "planos"
  className?: string;
}

export function Pagination({ type, data, itemName, className = "" }: PaginationProps) {
  // Função para traduzir os textos dos botões de paginação
  const translatePaginationLabel = (label: string): string => {
    // Remove HTML entities e espaços extras
    const cleanLabel = label.replace(/&laquo;|&raquo;/g, '').trim();
    
    // Traduções
    const translations: { [key: string]: string } = {
      'Previous': 'Anterior',
      'Next': 'Próximo'
    };
    
    return translations[cleanLabel] || label;
  };

  const renderServerPagination = (serverData: ServerPaginationData) => (
    <div className={`flex items-center justify-between space-x-2 py-4 ${className}`}>
      <div className="flex-1 text-sm text-muted-foreground">
        Mostrando {serverData.from} até {serverData.to} de {serverData.total} {itemName}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {serverData.links.map((link, index) => (
          <Button
            key={index}
            variant={link.active ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              if (link.url) {
                router.get(link.url, {}, { preserveScroll: true });
              }
            }}
            disabled={!link.url}
          >
            {translatePaginationLabel(link.label)}
          </Button>
        ))}
      </div>
    </div>
  );

  const renderClientPagination = (clientData: ClientPaginationData) => (
    <div className={`flex items-center justify-between space-x-2 py-4 ${className}`}>
      <div className="flex-1 text-sm text-muted-foreground">
        Mostrando {clientData.from} até {clientData.to} de {clientData.total} {itemName}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          disabled={clientData.currentPage === 1} 
          onClick={() => clientData.onPageChange(clientData.currentPage - 1)}
        >
          Anterior
        </Button>
        {Array.from({ length: clientData.totalPages }).map((_, i) => (
          <Button 
            key={i} 
            size="sm" 
            variant={clientData.currentPage === i + 1 ? 'default' : 'outline'} 
            onClick={() => clientData.onPageChange(i + 1)}
          >
            {i + 1}
          </Button>
        ))}
        <Button 
          variant="outline" 
          size="sm" 
          disabled={clientData.currentPage === clientData.totalPages || clientData.totalPages === 0} 
          onClick={() => clientData.onPageChange(clientData.currentPage + 1)}
        >
          Próximo
        </Button>
      </div>
    </div>
  );

  if (type === 'server') {
    return renderServerPagination(data as ServerPaginationData);
  } else {
    return renderClientPagination(data as ClientPaginationData);
  }
} 