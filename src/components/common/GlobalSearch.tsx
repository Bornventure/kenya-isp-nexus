
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Router, FileText, Ticket } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  // Mock search function - in real implementation, this would call an API
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock results
    const mockResults: SearchResult[] = [
      {
        id: '1',
        title: `Client matching "${searchQuery}"`,
        type: 'client',
        description: 'John Doe - Active subscriber',
        url: '/clients'
      },
      {
        id: '2',
        title: `Equipment containing "${searchQuery}"`,
        type: 'equipment',
        description: 'Router RT-001 - Available',
        url: '/equipment'
      },
      {
        id: '3',
        title: `Invoice #INV-${searchQuery}`,
        type: 'invoice',
        description: 'Amount: KES 2,500 - Paid',
        url: '/invoices'
      },
      {
        id: '4',
        title: `Support ticket about "${searchQuery}"`,
        type: 'ticket',
        description: 'Open ticket - High priority',
        url: '/support'
      }
    ].filter(result => 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setResults(mockResults);
    setIsSearching(false);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'client': return <Users className="h-4 w-4" />;
      case 'equipment': return <Router className="h-4 w-4" />;
      case 'invoice': return <FileText className="h-4 w-4" />;
      case 'ticket': return <Ticket className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'client': return 'bg-blue-100 text-blue-800';
      case 'equipment': return 'bg-green-100 text-green-800';
      case 'invoice': return 'bg-yellow-100 text-yellow-800';
      case 'ticket': return 'bg-red-100 text-red-800';
    }
  };

  const handleResultClick = (result: SearchResult) => {
    toast({
      title: "Navigation",
      description: `Navigating to ${result.title}`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Global Search
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients, equipment, invoices, tickets..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {isSearching ? (
              <div className="text-center py-8 text-muted-foreground">
                Searching...
              </div>
            ) : results.length === 0 && query ? (
              <div className="text-center py-8 text-muted-foreground">
                No results found for "{query}"
              </div>
            ) : query ? (
              results.map((result) => (
                <div
                  key={result.id}
                  className="p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {getIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{result.title}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {result.description}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className={getTypeColor(result.type)}>
                      {result.type}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Type to search across all entities
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-muted rounded">K</kbd> to open search anytime
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSearch;
