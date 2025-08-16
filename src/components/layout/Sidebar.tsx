
import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  BarChart,
  ClipboardList,
  CreditCard,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Mail,
  MapPin,
  MessageSquare,
  Network,
  Package,
  Power,
  Receipt,
  Settings,
  Users,
  Wallet,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [expanded, setExpanded] = useState<string[]>([]);

  const handleItemClick = (id: string, subId?: string) => {
    if (subId) {
      navigate(`/${subId}`);
    } else {
      navigate(`/${id}`);
    }
    onClose();
  };

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard 
    },
    { 
      id: 'clients', 
      label: 'Clients', 
      icon: Users 
    },
    { 
      id: 'equipment', 
      label: 'Equipment', 
      icon: Package 
    },
    { 
      id: 'invoices', 
      label: 'Invoices', 
      icon: Receipt, 
      subItems: [
        { id: 'installation', label: 'Installation Invoices' },
        { id: 'payment-monitor', label: 'Payment Monitor' },
        { id: 'regular', label: 'Regular Invoices' }
      ]
    },
    { 
      id: 'service-activation', 
      label: 'Service Activation', 
      icon: Power 
    },
    { 
      id: 'billing', 
      label: 'Billing', 
      icon: CreditCard 
    },
    { 
      id: 'tickets', 
      label: 'Tickets', 
      icon: Inbox 
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart 
    },
    { 
      id: 'workflow', 
      label: 'Workflow', 
      icon: FolderKanban 
    },
    { 
      id: 'onboarding', 
      label: 'Onboarding', 
      icon: ListChecks 
    },
    { 
      id: 'sms-templates', 
      label: 'SMS Templates', 
      icon: MessageSquare 
    },
    { 
      id: 'messaging', 
      label: 'Messaging', 
      icon: Mail 
    },
    { 
      id: 'inventory', 
      label: 'Inventory', 
      icon: ClipboardList 
    },
    { 
      id: 'hotspots', 
      label: 'Hotspots', 
      icon: MapPin 
    },
    { 
      id: 'network', 
      label: 'Network', 
      icon: Network,
      subItems: [
        { id: 'network-integration', label: 'Network Integration' },
        { id: 'wallet-monitor', label: 'Wallet Monitor' }
      ]
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings 
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0 border-r">
        <ScrollArea className="h-screen">
          <div className="p-4">
            <SheetHeader className="text-left">
              <SheetTitle>
                {profile?.isp_name || 'Control Panel'}
              </SheetTitle>
              <SheetDescription>
                Manage your ISP operations efficiently.
              </SheetDescription>
            </SheetHeader>
            <Separator className="my-4" />
            <nav className="flex flex-col space-y-1">
              {menuItems.map((item) =>
                item.subItems ? (
                  <Accordion type="single" collapsible className="w-full" key={item.id}>
                    <AccordionItem value={item.id}>
                      <AccordionTrigger className="hover:bg-secondary rounded-md px-2 py-1.5 text-sm flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-8">
                        <nav className="flex flex-col space-y-1">
                          {item.subItems.map((subItem) => (
                            <Button
                              key={subItem.id}
                              variant="ghost"
                              className={cn(
                                "w-full justify-start hover:bg-secondary text-sm",
                                isActive(`/${subItem.id}`)
                                  ? "font-medium"
                                  : "text-muted-foreground"
                              )}
                              onClick={() => handleItemClick(subItem.id)}
                            >
                              {subItem.label}
                            </Button>
                          ))}
                        </nav>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start hover:bg-secondary text-sm",
                      isActive(`/${item.id}`) ? "font-medium" : "text-muted-foreground"
                    )}
                    onClick={() => handleItemClick(item.id)}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    <span>{item.label}</span>
                  </Button>
                )
              )}
            </nav>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;
