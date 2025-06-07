
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, Download, Share2, Search, Filter } from 'lucide-react';
import { Receipt } from '@/types/receipt';
import ReceiptViewer from './ReceiptViewer';

// Mock data for receipts
const mockReceipts: Receipt[] = [
  {
    id: 'RCP-001',
    invoiceId: 'INV-2024-001',
    clientId: '1',
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    amount: 3500,
    paymentMethod: 'M-Pesa',
    paymentReference: 'QA12345678',
    dateCreated: '2024-01-15T10:30:00Z',
    datePaid: '2024-01-15T10:30:00Z',
    servicePackage: 'Premium Fiber 50Mbps',
    servicePeriod: {
      from: '2024-01-01',
      to: '2024-01-31'
    },
    status: 'sent',
    receiptNumber: 'RCP-2024-001'
  },
  {
    id: 'RCP-002',
    invoiceId: 'INV-2024-002',
    clientId: '2',
    clientName: 'Tech Solutions Ltd',
    clientEmail: 'contact@techsolutions.com',
    amount: 15000,
    paymentMethod: 'Bank Transfer',
    paymentReference: 'BNK987654321',
    dateCreated: '2024-01-14T15:45:00Z',
    datePaid: '2024-01-14T15:45:00Z',
    servicePackage: 'Business Fiber 100Mbps',
    servicePeriod: {
      from: '2024-01-01',
      to: '2024-01-31'
    },
    status: 'viewed',
    receiptNumber: 'RCP-2024-002'
  },
  {
    id: 'RCP-003',
    invoiceId: 'INV-2024-003',
    clientId: '3',
    clientName: 'Mary Johnson',
    clientEmail: 'mary@example.com',
    amount: 2200,
    paymentMethod: 'M-Pesa',
    paymentReference: 'QA87654321',
    dateCreated: '2024-01-13T09:15:00Z',
    datePaid: '2024-01-13T09:15:00Z',
    servicePackage: 'Basic Wireless 10Mbps',
    servicePeriod: {
      from: '2024-01-01',
      to: '2024-01-31'
    },
    status: 'generated',
    receiptNumber: 'RCP-2024-003'
  }
];

const ReceiptManager = () => {
  const [receipts] = useState<Receipt[]>(mockReceipts);
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>(mockReceipts);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  // Filter receipts based on search and filters
  React.useEffect(() => {
    let filtered = receipts.filter(receipt => {
      const matchesSearch = receipt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           receipt.invoiceId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter;
      const matchesMethod = methodFilter === 'all' || receipt.paymentMethod === methodFilter;
      
      return matchesSearch && matchesStatus && matchesMethod;
    });
    
    setFilteredReceipts(filtered);
  }, [receipts, searchTerm, statusFilter, methodFilter]);

  const getStatusColor = (status: Receipt['status']) => {
    switch (status) {
      case 'generated':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'viewed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleDownload = (receipt: Receipt) => {
    // Simulate PDF download
    console.log('Downloading receipt:', receipt.receiptNumber);
    // In a real implementation, this would generate and download a PDF
  };

  const handleShare = (receipt: Receipt) => {
    // Simulate sharing receipt
    console.log('Sharing receipt:', receipt.receiptNumber);
    // In a real implementation, this would open share options or copy link
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Receipt Management</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search receipts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="generated">Generated</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Receipts Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReceipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium">{receipt.receiptNumber}</TableCell>
                  <TableCell>{receipt.clientName}</TableCell>
                  <TableCell>{formatCurrency(receipt.amount)}</TableCell>
                  <TableCell>{receipt.paymentMethod}</TableCell>
                  <TableCell>{new Date(receipt.datePaid).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(receipt.status)}>
                      {receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReceipt(receipt)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(receipt)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare(receipt)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredReceipts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No receipts found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt Viewer Modal */}
      <ReceiptViewer
        receipt={selectedReceipt}
        open={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        onDownload={handleDownload}
        onShare={handleShare}
      />
    </div>
  );
};

export default ReceiptManager;
