
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const useDocumentGeneration = () => {
  const { toast } = useToast();

  const generatePDFMutation = useMutation({
    mutationFn: async ({ 
      data, 
      title, 
      filename 
    }: { 
      data: any[]; 
      title: string; 
      filename: string;
    }) => {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text(title, 20, 20);
      
      // Add timestamp
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
      
      // Convert data to table format
      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        const rows = data.map(item => headers.map(header => item[header] || ''));
        
        doc.autoTable({
          head: [headers],
          body: rows,
          startY: 40,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [66, 139, 202] },
        });
      }
      
      // Save the PDF
      doc.save(`${filename}.pdf`);
      
      return filename;
    },
    onSuccess: (filename) => {
      toast({
        title: "PDF Generated",
        description: `${filename}.pdf has been downloaded successfully.`,
      });
    },
    onError: (error) => {
      console.error('Error generating PDF:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    },
  });

  const downloadCSVMutation = useMutation({
    mutationFn: async ({ 
      data, 
      filename 
    }: { 
      data: any[]; 
      filename: string;
    }) => {
      if (data.length === 0) {
        throw new Error('No data to export');
      }
      
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header] || '';
            // Escape commas and quotes
            return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
              ? `"${value.replace(/"/g, '""')}"` 
              : value;
          }).join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      return filename;
    },
    onSuccess: (filename) => {
      toast({
        title: "CSV Downloaded",
        description: `${filename}.csv has been downloaded successfully.`,
      });
    },
    onError: (error) => {
      console.error('Error downloading CSV:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download CSV. Please try again.",
        variant: "destructive",
      });
    },
  });

  const printDataMutation = useMutation({
    mutationFn: async ({ 
      data, 
      title 
    }: { 
      data: any[]; 
      title: string;
    }) => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Unable to open print window');
      }
      
      const headers = data.length > 0 ? Object.keys(data[0]) : [];
      
      const html = `
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; margin-bottom: 10px; }
              .timestamp { color: #666; font-size: 12px; margin-bottom: 20px; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f4f4f4; font-weight: bold; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <div class="timestamp">Generated on: ${new Date().toLocaleString()}</div>
            <table>
              <thead>
                <tr>
                  ${headers.map(header => `<th>${header}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.map(row => 
                  `<tr>
                    ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
                  </tr>`
                ).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;
      
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      
      return title;
    },
    onSuccess: (title) => {
      toast({
        title: "Print Ready",
        description: `${title} is ready for printing.`,
      });
    },
    onError: (error) => {
      console.error('Error preparing print:', error);
      toast({
        title: "Print Failed",
        description: error instanceof Error ? error.message : "Failed to prepare print. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    generatePDF: generatePDFMutation.mutate,
    downloadCSV: downloadCSVMutation.mutate,
    printData: printDataMutation.mutate,
    isGeneratingPDF: generatePDFMutation.isPending,
    isDownloadingCSV: downloadCSVMutation.isPending,
    isPrinting: printDataMutation.isPending,
  };
};
