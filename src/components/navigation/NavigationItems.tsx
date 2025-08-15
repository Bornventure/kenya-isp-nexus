import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  ArrowRight,
  BarChart,
  Book,
  CheckCircle,
  ChevronDown,
  CircleUserRound,
  File,
  FileText,
  FolderKanban,
  GitBranch,
  HelpCircle,
  Home,
  LayoutDashboard,
  ListChecks,
  Mail,
  MessageSquare,
  Network,
  Package,
  Plus,
  Send,
  Settings,
  ShoppingBag,
  User,
  Users,
} from "lucide-react"

interface NavItem {
  title: string
  url: string
  icon: any
  badge?: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

export const navigationItems: (NavItem | NavSection)[] = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Analytics",
        url: "/analytics",
        icon: BarChart,
      },
    ],
  },
  {
    title: "Sales",
    items: [
      {
        title: "Clients",
        url: "/clients",
        icon: Users,
      },
      {
        title: "Service Packages",
        url: "/service-packages",
        icon: Package,
      },
      {
        title: "Invoices",
        url: "/invoices",
        icon: FileText,
      },
      {
        title: "Payments",
        url: "/payments",
        icon: ShoppingBag,
      },
    ],
  },
  {
    title: "Network",
    items: [
      {
        title: "Network Map",
        url: "/network-map",
        icon: Network,
      },
      {
        title: "Base Stations",
        url: "/base-stations",
        icon: ListChecks,
      },
      {
        title: "Equipment",
        url: "/equipment",
        icon: Settings,
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        title: "Support Tickets",
        url: "/support-tickets",
        icon: HelpCircle,
      },
      {
        title: "Knowledge Base",
        url: "/knowledge-base",
        icon: Book,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Profile",
        url: "/profile",
        icon: CircleUserRound,
      },
      {
        title: "Settings",
        url: "/account-settings",
        icon: Settings,
      },
    ],
  },
  {
    title: "Workflow",
    items: [
      {
        title: "Workflow Dashboard",
        url: "/workflow",
        icon: GitBranch,
      },
      {
        title: "SMS Templates",
        url: "/sms-templates",
        icon: MessageSquare,
      },
      {
        title: "Invoice Distribution",
        url: "/invoice-distribution",
        icon: Send,
      },
    ],
  },
]

interface SidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  return (
    <div className="hidden border-r bg-gray-100/40 lg:block">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            ISP Admin
          </h2>
          <ul className="space-y-1">
            {navigationItems.map((item, index) => {
              if ("items" in item) {
                return (
                  <Accordion
                    key={item.title}
                    type="single"
                    collapsible
                    className="border-none"
                  >
                    <AccordionItem value={item.title}>
                      <AccordionTrigger className="group flex w-full items-center justify-between py-2 text-sm font-medium hover:underline">
                        {item.title}
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-300" />
                      </AccordionTrigger>
                      <AccordionContent className="space-y-1">
                        {item.items.map((subitem) => (
                          <li key={subitem.title}>
                            <Button
                              variant="ghost"
                              className="justify-start px-4 text-sm"
                              onClick={() => (window.location.href = subitem.url)}
                            >
                              {subitem.title}
                            </Button>
                          </li>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )
              }
              return (
                <li key={index}>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => (window.location.href = item.url)}
                  >
                    {item.title}
                  </Button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
