
import React, { useState, useEffect, useCallback } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Search, Users, Router, FileText, HeadphonesIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { debounce } from 'lodash';

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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { profile } = useAuth();

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || !profile?.isp_company_id) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];

      // Search clients
      const { data: clients } = await supabase
        .from('clients')
        .select('id, name, phone, email, address')
        .eq('isp_company_id', profile.isp_company_id)
        .or(`name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .limit(5);

      if (clients) {
        clients.forEach(client => {
          searchResults.push({
            id: client.id,
            title: client.name,
            type: 'client',
            description: `${client.phone} - ${client.address}`,
            url: `/clients`,
          });
        });
      }

      // Search equipment
      const { data: equipment } = await supabase
        .from('equipment')
        .select('id, type, brand, model, serial_number, location')
        .eq('isp_company_id', profile.isp_company_id)
        .or(`type.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%,serial_number.ilike.%${searchQuery}%`)
        .limit(5);

      if (equipment) {
        equipment.forEach(item => {
          searchResults.push({
            id: item.id,
            title: `${item.brand || ''} ${item.model || ''} - ${item.type}`,
            type: 'equipment',
            description: `Serial: ${item.serial_number} - ${item.location || 'No location'}`,
            url: `/equipment`,
          });
        });
      }

      // Search invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, invoice_number, total_amount, status, clients(name)')
        .eq('isp_company_id', profile.isp_company_id)
        .ilike('invoice_number', `%${searchQuery}%`)
        .limit(5);

      if (invoices) {
        invoices.forEach(invoice => {
          searchResults.push({
            id: invoice.id,
            title: `Invoice ${invoice.invoice_number}`,
            type: 'invoice',
            description: `KES ${invoice.total_amount} - ${invoice.status} - ${(invoice.clients as any)?.name || 'Unknown client'}`,
            url: `/invoices`,
          });
        });
      }

      // Search support tickets
      const { data: tickets } = await supabase
        .from('support_tickets')
        .select('id, title, status, priority, clients(name)')
        .eq('isp_company_id', profile.isp_company_id)
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .limit(5);

      if (tickets) {
        tickets.forEach(ticket => {
          searchResults.push({
            id: ticket.id,
            title: ticket.title,
            type: 'ticket',
            description: `${ticket.status} - ${ticket.priority} priority - ${(ticket.clients as any)?.name || 'No client'}`,
            url: `/support`,
          });
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search to avoid too many API calls
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      performSearch(searchQuery);
    }, 300),
    [profile?.isp_company_id]
  );

  useEffect(() => {
    if (query.length >= 2) {
      debouncedSearch(query);
    } else {
      setResults([]);
      setLoading(false);
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);

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
        {loading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Searching...</span>
          </div>
        )}
        
        {!loading && query.length > 0 && query.length < 2 && (
          <CommandEmpty>Type at least 2 characters to search.</CommandEmpty>
        )}
        
        {!loading && query.length >= 2 && results.length === 0 && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}
        
        {!loading && results.length > 0 && (
          <CommandGroup heading="Results">
            {results.map((result) => (
              <CommandItem
                key={`${result.type}-${result.id}`}
                onSelect={() => handleSelect(result.url)}
                className="flex items-center gap-2 cursor-pointer"
              >
                {getIcon(result.type)}
                <div className="flex flex-col flex-1">
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
