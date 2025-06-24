
import React, { useState, useEffect } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Search, Users, Router, FileText, HeadphonesIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  type: 'client' | 'equipment' | 'invoice' | 'ticket';
  description: string;
  url: string;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ open, onOpenChange }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();

  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'John Doe - Premium Client',
      type: 'client',
      description: 'Active fiber connection - Westlands',
      url: '/clients',
    },
    {
      id: '2',
      title: 'Router-001',
      type: 'equipment',
      description: 'Mikrotik RB2011 - Base Station Alpha',
      url: '/equipment',
    },
    {
      id: '3',
      title: 'Invoice #INV-2025-001',
      type: 'invoice',
      description: 'KES 2,500 - Due Jan 30, 2025',
      url: '/invoices',
    },
    {
      id: '4',
      title: 'Ticket #TK-001',
      type: 'ticket',
      description: 'Connection issue - High priority',
      url: '/support',
    },
  ];

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const filtered = mockResults.filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  }, [query]);

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'client':
        return <Users className="h-4 w-4" />;
      case 'equipment':
        return <Router className="h-4 w-4" />;
      case 'invoice':
        return <FileText className="h-4 w-4" />;
      case 'ticket':
        return <HeadphonesIcon className="h-4 w-4" />;
    }
  };

  const handleSelect = (url: string) => {
    navigate(url);
    onOpenChange(false);
    setQuery('');
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search clients, equipment, invoices, tickets..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading="Results">
            {results.map((result) => (
              <CommandItem
                key={result.id}
                onSelect={() => handleSelect(result.url)}
                className="flex items-center gap-2"
              >
                {getIcon(result.type)}
                <div className="flex flex-col">
                  <span className="font-medium">{result.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {result.description}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default GlobalSearch;
