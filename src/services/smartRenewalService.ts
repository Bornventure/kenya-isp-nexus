
import { supabase } from '@/integrations/supabase/client';

export interface WalletAnalysis {
  clientId: string;
  currentBalance: number;
  requiredAmount: number;
  shortfall: number;
  canAffordRenewal: boolean;
  daysUntilExpiry: number;
  packageName: string;
  subscriptionEndDate: string;
}

export interface RenewalAction {
  type: 'auto_renew' | 'partial_payment' | 'top_up_required' | 'suspend_service';
  message: string;
  amount?: number;
  newExpiryDate?: string;
}

class SmartRenewalService {
  async analyzeClientWallet(clientId: string): Promise<WalletAnalysis | null> {
    try {
      const { data: client, error } = await supabase
        .from('clients')
        .select(`
          *,
          service_packages (name, monthly_rate)
        `)
        .eq('id', clientId)
        .single();

      if (error || !client) return null;

      const currentBalance = parseFloat(client.wallet_balance?.toString() || '0');
      const requiredAmount = parseFloat(client.monthly_rate?.toString() || '0');
      const shortfall = Math.max(0, requiredAmount - currentBalance);
      const subscriptionEnd = new Date(client.subscription_end_date);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((subscriptionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        clientId,
        currentBalance,
        requiredAmount,
        shortfall,
        canAffordRenewal: currentBalance >= requiredAmount,
        daysUntilExpiry,
        packageName: client.service_packages?.name || 'Unknown Package',
        subscriptionEndDate: client.subscription_end_date
      };
    } catch (error) {
      console.error('Wallet analysis failed:', error);
      return null;
    }
  }

  async processSmartRenewal(analysis: WalletAnalysis): Promise<RenewalAction> {
    try {
      if (analysis.canAffordRenewal) {
        return await this.processFullRenewal(analysis);
      } else if (analysis.currentBalance > 0) {
        return await this.processPartialRenewal(analysis);
      } else {
        return this.createTopUpAction(analysis);
      }
    } catch (error) {
      console.error('Smart renewal processing failed:', error);
      return {
        type: 'suspend_service',
        message: 'Renewal processing failed'
      };
    }
  }

  private async processFullRenewal(analysis: WalletAnalysis): Promise<RenewalAction> {
    try {
      const { data, error } = await supabase.rpc('process_subscription_renewal', {
        p_client_id: analysis.clientId
      });

      if (error || !data || (typeof data === 'object' && 'success' in data && !data.success)) {
        throw new Error('Renewal processing failed');
      }

      // Send renewal success notification
      await this.sendRenewalNotification(analysis.clientId, 'renewal_success', {
        amount: analysis.requiredAmount,
        remaining_balance: analysis.currentBalance - analysis.requiredAmount,
        package_name: analysis.packageName
      });

      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + 30);

      return {
        type: 'auto_renew',
        message: 'Service renewed successfully',
        amount: analysis.requiredAmount,
        newExpiryDate: newExpiryDate.toISOString()
      };
    } catch (error) {
      console.error('Full renewal failed:', error);
      return this.createTopUpAction(analysis);
    }
  }

  private async processPartialRenewal(analysis: WalletAnalysis): Promise<RenewalAction> {
    try {
      // Calculate partial service period based on available balance
      const fullPeriodDays = 30;
      const affordableDays = Math.floor((analysis.currentBalance / analysis.requiredAmount) * fullPeriodDays);
      
      if (affordableDays < 3) {
        // Less than 3 days affordable, request top-up instead
        return this.createTopUpAction(analysis);
      }

      // Deduct available balance and extend service for calculated days
      const { error: deductError } = await supabase
        .from('clients')
        .update({
          wallet_balance: 0,
          subscription_end_date: new Date(Date.now() + (affordableDays * 24 * 60 * 60 * 1000)).toISOString()
        })
        .eq('id', analysis.clientId);

      if (deductError) throw deductError;

      // Record partial payment transaction
      await supabase
        .from('wallet_transactions')
        .insert({
          client_id: analysis.clientId,
          transaction_type: 'debit',
          amount: analysis.currentBalance,
          description: `Partial renewal for ${affordableDays} days`,
          isp_company_id: (await this.getClientCompanyId(analysis.clientId))
        });

      // Send partial renewal notification
      await this.sendRenewalNotification(analysis.clientId, 'partial_renewal', {
        amount: analysis.currentBalance,
        days_extended: affordableDays,
        shortfall: analysis.shortfall,
        package_name: analysis.packageName
      });

      return {
        type: 'partial_payment',
        message: `Partial renewal for ${affordableDays} days. Top-up KES ${analysis.shortfall.toFixed(2)} for full month.`,
        amount: analysis.currentBalance
      };
    } catch (error) {
      console.error('Partial renewal failed:', error);
      return this.createTopUpAction(analysis);
    }
  }

  private createTopUpAction(analysis: WalletAnalysis): RenewalAction {
    return {
      type: 'top_up_required',
      message: `Top-up required: KES ${analysis.shortfall.toFixed(2)} for ${analysis.packageName}`,
      amount: analysis.shortfall
    };
  }

  async sendTargetedTopUpReminder(clientId: string, analysis: WalletAnalysis): Promise<void> {
    try {
      const reminderType = analysis.daysUntilExpiry <= 1 ? 'urgent_top_up' : 'top_up_reminder';
      
      await this.sendRenewalNotification(clientId, reminderType, {
        days_remaining: analysis.daysUntilExpiry,
        current_balance: analysis.currentBalance,
        required_amount: analysis.requiredAmount,
        shortfall: analysis.shortfall,
        package_name: analysis.packageName,
        can_afford_partial: analysis.currentBalance > (analysis.requiredAmount * 0.1) // 10% threshold
      });
    } catch (error) {
      console.error('Top-up reminder failed:', error);
    }
  }

  private async sendRenewalNotification(clientId: string, type: string, data: any): Promise<void> {
    try {
      await supabase.functions.invoke('send-notifications', {
        body: {
          client_id: clientId,
          type,
          data
        }
      });
    } catch (error) {
      console.error('Notification failed:', error);
    }
  }

  private async getClientCompanyId(clientId: string): Promise<string> {
    const { data } = await supabase
      .from('clients')
      .select('isp_company_id')
      .eq('id', clientId)
      .single();
    
    return data?.isp_company_id;
  }
}

export const smartRenewalService = new SmartRenewalService();
