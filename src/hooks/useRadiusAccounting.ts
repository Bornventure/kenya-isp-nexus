
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RadiusAccountingRecord {
  id: string;
  username: string;
  nas_ip_address: string;
  session_id: string;
  session_time: number;
  input_octets: number;
  output_octets: number;
  terminate_cause: string;
  client_id?: string;
  isp_company_id: string;
  created_at: string;
  clients?: {
    name: string;
    email: string;
    phone: string;
  };
}

export const useRadiusAccounting = () => {
  const { profile } = useAuth();

  const { data: accountingRecords = [], isLoading } = useQuery({
    queryKey: ['radius-accounting', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('radius_accounting' as any)
        .select(`
          *,
          clients (
            name,
            email,
            phone
          )
        `)
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('Error fetching accounting records:', error);
        throw error;
      }

      return data as RadiusAccountingRecord[];
    },
    enabled: !!profile?.isp_company_id,
    refetchInterval: 60000 // Refresh every minute
  });

  const getAccountingByUsername = (username: string) => {
    return accountingRecords.filter(record => record.username === username);
  };

  const getAccountingByDateRange = (startDate: Date, endDate: Date) => {
    return accountingRecords.filter(record => {
      const recordDate = new Date(record.created_at);
      return recordDate >= startDate && recordDate <= endDate;
    });
  };

  const getTotalDataUsage = () => {
    return accountingRecords.reduce((total, record) => ({
      input: total.input + (record.input_octets || 0),
      output: total.output + (record.output_octets || 0),
      total: total.total + (record.input_octets || 0) + (record.output_octets || 0)
    }), { input: 0, output: 0, total: 0 });
  };

  return {
    accountingRecords,
    isLoading,
    getAccountingByUsername,
    getAccountingByDateRange,
    getTotalDataUsage
  };
};
