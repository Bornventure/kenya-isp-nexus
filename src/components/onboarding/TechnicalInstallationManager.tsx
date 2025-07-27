import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, Clock, AlertCircle, Calendar, User, MapPin, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

interface TechnicalInstallation extends Tables<'technical_installations'> {
  client: Tables<'clients'> | null;
}

interface InstallationStatusProps {
  status: 'pending' | 'completed' | 'failed';
}

const InstallationStatus: React.FC<InstallationStatusProps> = ({ status }) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline"><Clock className="mr-2 h-4 w-4" /> Pending</Badge>;
    case 'completed':
      return <Badge variant="success"><CheckCircle className="mr-2 h-4 w-4" /> Completed</Badge>;
    case 'failed':
      return <Badge variant="destructive"><AlertCircle className="mr-2 h-4 w-4" /> Failed</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
};

export default function TechnicalInstallationManager() {
  const [selectedInstallation, setSelectedInstallation] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: technicalInstallations, isLoading, isError } = useQuery({
    queryKey: ['technical-installations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('technical_installations')
        .select(`
          *,
          client:clients (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TechnicalInstallation[];
    },
  });

  const completeInstallationMutation = useMutation({
    mutationFn: async ({ installationId, notes }: { installationId: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('technical_installations')
        .update({
          status: 'completed',
          notes: notes || null,
        })
        .eq('id', installationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-installations'] });
      toast.success('Installation completed successfully');
      setSelectedInstallation(null);
      setCompletionNotes('');
    },
    onError: (error) => {
      console.error('Error completing installation:', error);
      toast.error('Failed to complete installation');
    },
  });

  const handleCompleteInstallation = () => {
    if (!selectedInstallation) return;
    
    completeInstallationMutation.mutate({
      installationId: selectedInstallation,
      notes: completionNotes,
    });
  };

  if (isLoading) return <div>Loading installations...</div>;
  if (isError) return <div>Error fetching installations.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Technical Installation Manager</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {technicalInstallations?.map((installation) => (
          <Card key={installation.id} className="bg-white shadow-md rounded-md">
            <CardHeader>
              <CardTitle>{installation.client?.name}</CardTitle>
              <CardDescription>
                <InstallationStatus status={installation.status} />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <Label>Client Information</Label>
                <p className="text-sm text-gray-500">
                  <User className="mr-2 inline-block h-4 w-4" /> {installation.client?.name}
                  <br />
                  <Mail className="mr-2 inline-block h-4 w-4" /> {installation.client?.email}
                  <br />
                  <Phone className="mr-2 inline-block h-4 w-4" /> {installation.client?.phone}
                  <br />
                  <MapPin className="mr-2 inline-block h-4 w-4" /> {installation.client?.address}, {installation.client?.county}
                </p>
              </div>
              <div className="mb-2">
                <Label>Installation Date</Label>
                <p className="text-sm text-gray-500">
                  <Calendar className="mr-2 inline-block h-4 w-4" /> {installation.installation_date || 'Not Scheduled'}
                </p>
              </div>
              <div className="flex justify-between items-center">
                {installation.status === 'pending' && (
                  <Button
                    onClick={() => setSelectedInstallation(installation.id)}
                    disabled={selectedInstallation === installation.id}
                  >
                    {selectedInstallation === installation.id ? 'Selected' : 'Complete Installation'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedInstallation && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Complete Installation</h2>
          <Card className="bg-white shadow-md rounded-md">
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="completionNotes">Completion Notes</Label>
                <Textarea
                  id="completionNotes"
                  placeholder="Enter any notes about the installation"
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                />
              </div>
              <Button onClick={handleCompleteInstallation} disabled={completeInstallationMutation.isPending}>
                {completeInstallationMutation.isPending ? 'Completing...' : 'Mark as Completed'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
