
import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { debounce } from 'lodash';

interface SearchResult {
  id: string;
  type: 'client' | 'equipment' | 'invoice' | 'ticket';
  title: string;
  subtitle: string;
  url: string;
}

const GlobalSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { profile } = useAuth();

  const performSearch = debounce(async (query: string) => {
    if (!query.trim() || !profile?.isp_company_id) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const results: SearchResult[] = [];

      // Search clients
      const { data: clients } = await supabase
        .from('clients')
        .select('id, name, phone, email')
        .eq('isp_company_id', profile.isp_company_id)
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(5);

      if (clients) {
        clients.forEach(client => {
          results.push({
            id: client.id,
            type: 'client',
            title: client.name,
            subtitle: `${client.phone} • ${client.email || 'No email'}`,
            url: `/clients/${client.id}`
          });
        });
      }

      // Search equipment
      const { data: equipment } = await supabase
        .from('equipment')
        .select('id, type, brand, model, serial_number')
        .eq('isp_company_id', profile.isp_company_id)
        .or(`type.ilike.%${query}%,brand.ilike.%${query}%,model.ilike.%${query}%,serial_number.ilike.%${query}%`)
        .limit(5);

      if (equipment) {
        equipment.forEach(item => {
          results.push({
            id: item.id,
            type: 'equipment',
            title: `${item.brand || ''} ${item.model || ''}`.trim() || item.type,
            subtitle: `Type: ${item.type} • Serial: ${item.serial_number}`,
            url: `/equipment/${item.id}`
          });
        });
      }

      // Search invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, invoice_number, total_amount, clients(name)')
        .eq('isp_company_id', profile.isp_company_id)
        .ilike('invoice_number', `%${query}%`)
        .limit(5);

      if (invoices) {
        invoices.forEach(invoice => {
          results.push({
            id: invoice.id,
            type: 'invoice',
            title: `Invoice ${invoice.invoice_number}`,
            subtitle: `${(invoice.clients as any)?.name || 'Unknown Client'} • KES ${invoice.total_amount}`,
            url: `/invoices/${invoice.id}`
          });
        });
      }

      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, 300);

  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery]);

  const handleResultClick = (result: SearchResult) => {
    // Navigate to the result URL
    window.location.href = result.url;
    setShowResults(false);
    setSearchQuery('');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'client': return '👤';
      case 'equipment': return '📡';
      case 'invoice': return '📄';
      case 'ticket': return '🎫';
      default: return '📋';
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search clients, equipment, invoices..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 pr-8 h-8 w-64"
        />
        {searchQuery && (
          <X 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
            onClick={clearSearch}
          />
        )}
      </div>

      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto">
          <CardContent className="p-0">
            {isSearching ? (
              <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
            ) : searchResults.length > 0 ? (
              <div className="divide-y">
                {searchResults.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getResultIcon(result.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{result.title}</div>
                        <div className="text-xs text-gray-500 truncate">{result.subtitle}</div>
                      </div>
                      <div className="text-xs text-gray-400 capitalize">{result.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                No results found for "{searchQuery}"
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GlobalSearch;
