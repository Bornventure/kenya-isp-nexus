
import { paymentMonitoringService } from './paymentMonitoringService';
import { liveNetworkMonitoringService } from './liveNetworkMonitoringService';
import { precisionTimerService } from './precisionTimerService';
import { smartRenewalService } from './smartRenewalService';

class AutomationOrchestrator {
  private services: Array<{ name: string; service: any }> = [];

  constructor() {
    this.services = [
      { name: 'Payment Monitoring', service: paymentMonitoringService },
      { name: 'Network Monitoring', service: liveNetworkMonitoringService },
      { name: 'Precision Timer', service: precisionTimerService },
    ];
  }

  startAllServices(): void {
    console.log('Starting all automation services...');
    
    this.services.forEach(({ name, service }) => {
      try {
        if (service.start) {
          service.start();
          console.log(`✓ ${name} service started`);
        } else if (service.startMonitoring) {
          service.startMonitoring();
          console.log(`✓ ${name} service started`);
        }
      } catch (error) {
        console.error(`✗ Failed to start ${name} service:`, error);
      }
    });

    console.log('All automation services initialization complete');
  }

  stopAllServices(): void {
    console.log('Stopping all automation services...');
    
    this.services.forEach(({ name, service }) => {
      try {
        if (service.stop) {
          service.stop();
          console.log(`✓ ${name} service stopped`);
        } else if (service.stopMonitoring) {
          service.stopMonitoring();
          console.log(`✓ ${name} service stopped`);
        }
      } catch (error) {
        console.error(`✗ Failed to stop ${name} service:`, error);
      }
    });
  }

  getServiceStatus(): Array<{ name: string; status: string }> {
    return this.services.map(({ name, service }) => ({
      name,
      status: service.isMonitoring || service.isRunning ? 'running' : 'stopped'
    }));
  }

  async processClientWorkflow(clientId: string, action: string): Promise<void> {
    switch (action) {
      case 'activate':
        liveNetworkMonitoringService.addClientToMonitoring(clientId);
        break;
      case 'suspend':
        liveNetworkMonitoringService.removeClientFromMonitoring(clientId);
        break;
      case 'payment_received':
        // Trigger smart renewal check
        const analysis = await smartRenewalService.analyzeClientWallet(clientId);
        if (analysis) {
          await smartRenewalService.processSmartRenewal(analysis);
        }
        break;
    }
  }
}

export const automationOrchestrator = new AutomationOrchestrator();

// Auto-start services when imported (for production)
if (typeof window !== 'undefined') {
  // Start services after a short delay to ensure everything is initialized
  setTimeout(() => {
    automationOrchestrator.startAllServices();
  }, 5000);
}
