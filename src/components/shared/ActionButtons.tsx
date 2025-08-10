
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  FileText, 
  Printer, 
  Settings,
  Trash2,
  Edit,
  Plus
} from 'lucide-react';
import { useDocumentGeneration } from '@/hooks/useDocumentGeneration';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActionButtonsProps {
  data?: any[];
  title?: string;
  filename?: string;
  onAdd?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSettings?: () => void;
  selectedItems?: string[];
  showAdd?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showSettings?: boolean;
  showExport?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  data = [],
  title = 'Export',
  filename = 'export',
  onAdd,
  onEdit,
  onDelete,
  onSettings,
  selectedItems = [],
  showAdd = true,
  showEdit = true,
  showDelete = true,
  showSettings = true,
  showExport = true,
}) => {
  const { generatePDF, downloadCSV, printData, isGeneratingPDF, isDownloadingCSV, isPrinting } = useDocumentGeneration();

  const handleExportPDF = () => {
    generatePDF({ data, title, filename });
  };

  const handleExportCSV = () => {
    downloadCSV({ data, filename });
  };

  const handlePrint = () => {
    printData({ data, title });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {showAdd && onAdd && (
        <Button onClick={onAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      )}

      {showEdit && onEdit && selectedItems.length === 1 && (
        <Button variant="outline" size="sm" onClick={() => onEdit(selectedItems[0])}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      )}

      {showDelete && onDelete && selectedItems.length > 0 && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => selectedItems.forEach(onDelete)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete ({selectedItems.length})
        </Button>
      )}

      {showSettings && onSettings && (
        <Button variant="outline" size="sm" onClick={onSettings}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      )}

      {showExport && data.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleExportPDF} disabled={isGeneratingPDF}>
              <FileText className="h-4 w-4 mr-2" />
              {isGeneratingPDF ? 'Generating...' : 'Export as PDF'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportCSV} disabled={isDownloadingCSV}>
              <Download className="h-4 w-4 mr-2" />
              {isDownloadingCSV ? 'Downloading...' : 'Export as CSV'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePrint} disabled={isPrinting}>
              <Printer className="h-4 w-4 mr-2" />
              {isPrinting ? 'Preparing...' : 'Print'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default ActionButtons;
