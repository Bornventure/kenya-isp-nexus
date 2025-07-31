
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export const MigrationRunner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const { toast } = useToast();

  const runPaymentMigration = async () => {
    setIsRunning(true);
    setMigrationResult(null);
    
    try {
      console.log('Starting payment data migration...');
      
      const { data, error } = await supabase.functions.invoke('migrate-payment-data', {
        body: {}
      });

      if (error) {
        console.error('Migration error:', error);
        throw error;
      }

      console.log('Migration completed:', data);
      setMigrationResult(data);

      if (data.success) {
        toast({
          title: "Migration Successful",
          description: `Migrated ${data.migrated_count} payment records from ${data.total_transactions} wallet transactions.`,
        });
      } else {
        toast({
          title: "Migration Failed",
          description: data.error || "Unknown error occurred during migration",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Migration failed:', error);
      toast({
        title: "Migration Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
      setMigrationResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          Payment Data Migration
        </CardTitle>
        <CardDescription>
          Migrate wallet transaction data to the main payments table to fix revenue tracking and analytics.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            This migration will:
            <br />• Find wallet credit transactions without corresponding payment records
            <br />• Create payment records in the main payments table
            <br />• Fix revenue calculations and analytics data
            <br />• Skip transactions that already have payment records
          </p>
        </div>

        <Button 
          onClick={runPaymentMigration}
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Migration...
            </>
          ) : (
            'Run Payment Migration'
          )}
        </Button>

        {migrationResult && (
          <div className={`rounded-lg p-4 ${
            migrationResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start gap-2">
              {migrationResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className={`font-medium ${
                  migrationResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  Migration {migrationResult.success ? 'Completed' : 'Failed'}
                </h4>
                
                {migrationResult.success ? (
                  <div className="mt-2 text-sm text-green-800">
                    <p><strong>Total wallet transactions processed:</strong> {migrationResult.total_transactions}</p>
                    <p><strong>Payment records created:</strong> {migrationResult.migrated_count}</p>
                    {migrationResult.errors && migrationResult.errors.length > 0 && (
                      <div className="mt-2">
                        <p><strong>Errors encountered:</strong></p>
                        <ul className="list-disc list-inside ml-2">
                          {migrationResult.errors.map((error: string, index: number) => (
                            <li key={index} className="text-xs">{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-red-800">
                    {migrationResult.error}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p><strong>Note:</strong> This migration is safe to run multiple times. It will only create missing payment records and won't duplicate existing ones.</p>
        </div>
      </CardContent>
    </Card>
  );
};
