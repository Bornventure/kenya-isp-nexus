
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  File, 
  Folder, 
  Upload, 
  Download, 
  Trash2, 
  Search,
  HardDrive,
  Archive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: number;
  created_at: string;
  updated_at: string;
  mime_type?: string;
  path: string;
}

const FileManagement = () => {
  const { toast } = useToast();
  const [currentPath, setCurrentPath] = useState('/');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [files] = useState<FileItem[]>([
    {
      id: '1',
      name: 'client-documents',
      type: 'folder',
      size: 0,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T12:00:00Z',
      path: '/client-documents'
    },
    {
      id: '2',
      name: 'invoice-template.pdf',
      type: 'file',
      size: 524288,
      created_at: '2024-01-10T00:00:00Z',
      updated_at: '2024-01-10T00:00:00Z',
      mime_type: 'application/pdf',
      path: '/invoice-template.pdf'
    },
    {
      id: '3',
      name: 'network-diagram.png',
      type: 'file',
      size: 1048576,
      created_at: '2024-01-12T00:00:00Z',
      updated_at: '2024-01-12T00:00:00Z',
      mime_type: 'image/png',
      path: '/network-diagram.png'
    },
  ]);

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          toast({
            title: "File Uploaded",
            description: "File has been uploaded successfully",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDeleteFile = (id: string, name: string) => {
    toast({
      title: "File Deleted",
      description: `${name} has been deleted successfully`,
    });
  };

  const handleDownloadFile = (name: string) => {
    toast({
      title: "Download Started",
      description: `${name} download has been initiated`,
    });
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return <Folder className="h-4 w-4 text-blue-600" />;
    }
    return <File className="h-4 w-4 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                File Management
              </CardTitle>
              <CardDescription>
                Organize and manage documents, images, and other files
              </CardDescription>
            </div>
            <Button onClick={handleFileUpload} disabled={isUploading}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="browser" className="space-y-4">
            <TabsList>
              <TabsTrigger value="browser">File Browser</TabsTrigger>
              <TabsTrigger value="storage">Storage Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="browser" className="space-y-4">
              {/* Search and Path */}
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="Search files and folders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Badge variant="outline">
                  Path: {currentPath}
                </Badge>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading files...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}

              {/* File Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Modified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getFileIcon(file)}
                          <span>{file.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {file.type === 'folder' ? '-' : formatFileSize(file.size)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {file.type === 'folder' ? 'Folder' : file.mime_type || 'File'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(file.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {file.type === 'file' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadFile(file.name)}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteFile(file.id, file.name)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="storage">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold">2.4 GB</div>
                    <p className="text-sm text-muted-foreground">Total Storage Used</p>
                    <Progress value={24} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">24% of 10 GB</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold">156</div>
                    <p className="text-sm text-muted-foreground">Total Files</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold">23</div>
                    <p className="text-sm text-muted-foreground">Folders</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-medium mb-4">Storage Settings</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Auto-archive files older than</label>
                        <select className="w-full mt-1 p-2 border rounded">
                          <option value="30">30 days</option>
                          <option value="90">90 days</option>
                          <option value="365">1 year</option>
                          <option value="never">Never</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Maximum file size (MB)</label>
                        <Input type="number" defaultValue="10" className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Allowed file types</label>
                        <Input 
                          defaultValue="pdf,doc,docx,xls,xlsx,png,jpg,jpeg" 
                          className="mt-1"
                          placeholder="Comma-separated file extensions"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileManagement;
