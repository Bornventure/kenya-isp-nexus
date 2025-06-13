
import { authService } from './api/authService';
import { servicePackageService } from './api/servicePackageService';
import { isClientActive, getAccountStatusMessage, formatCurrency, hasOverdueInvoices, getNextPaymentDue } from './authUtils';

class IspApiService {
  // Delegate authentication to the auth service
  async loginClient(credentials: any) {
    return authService.loginClient(credentials);
  }

  // Delegate service package retrieval to the service package service
  async getServicePackages() {
    return servicePackageService.getServicePackages();
  }

  // Helper methods from authUtils
  isClientActive = isClientActive;
  getAccountStatusMessage = getAccountStatusMessage;
  formatCurrency = formatCurrency;
  hasOverdueInvoices = hasOverdueInvoices;
  getNextPaymentDue = getNextPaymentDue;
}

export const ispApiService = new IspApiService();
export type { Client, ServicePackage, ClientLoginCredentials } from '@/types/client';
export * from '@/types/client';
