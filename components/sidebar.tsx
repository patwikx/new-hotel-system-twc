"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Building2,
  Users,
  FileText,
  BedDouble,
  CreditCard,
  BarChart3,
  Settings,
  ChevronRight,
  Receipt,
  Banknote,
  SprayCan,
  Wrench,
  CalendarCheck,
  Globe,
  LayoutDashboard, // A better icon for the main dashboard
  Hotel,          // A better icon for the main header
  ImageIcon,
} from "lucide-react"
import UserProfileLogout from "./user-profile-logout"
import BusinessUnitSwitcher from "./business-unit-switcher"
import type { BusinessUnitItem } from "@/types/business-unit-types"

// 1. UPDATED DATA STRUCTURE FOR HOTEL MANAGEMENT
// =================================================================
export interface NavItem {
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Front Desk",
    icon: Building2,
    children: [
      { title: "Reservations", href: "/reservations", icon: CalendarCheck },
      { title: "Guests", href: "/guests", icon: Users },
      { title: "Room Rack", href: "/rooms", icon: BedDouble },
    ],
  },
  {
    title: "Operations",
    icon: Wrench,
    children: [
      { title: "Housekeeping", href: "/operations/housekeeping", icon: SprayCan },
      { title: "Service Requests", href: "/operations/service-requests", icon: Receipt },
      { title: "Maintenance", href: "/operations/maintenance", icon: Wrench },
    ],
  },
  {
    title: "Billing & Rates",
    icon: Banknote,
    children: [
      { title: "Guest Folios", href: "/billing/folios", icon: Receipt },
      { title: "Payments", href: "/billing/payments", icon: CreditCard },
      { title: "Room Rates", href: "/billing/rates", icon: Banknote },
    ],
  },
  {
    title: "Website CMS",
    icon: Globe,
    children: [
      { title: "Content Management", href: "/cms", icon: Globe },
      { title: "Pages", href: "/cms/pages", icon: FileText },
      { title: "Media Library", href: "/cms/media", icon: ImageIcon },
    ],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Administration",
    icon: Settings,
    children: [
      { title: "Property Settings", href: "/admin/property", icon: Hotel },
      { title: "Users & Roles", href: "/admin/users", icon: Users },
      { title: "Room Types", href: "/admin/room-types", icon: BedDouble },
      { title: "Amenities", href: "/admin/amenities", icon: FileText },
      { title: "Services", href: "/admin/services", icon: Wrench },
    ],
  },
]

// 2. PROP TYPE DEFINITIONS (No changes needed)
// =================================================================
interface SidebarProps {
  businessUnitId: string
  businessUnits: BusinessUnitItem[]
}

interface SidebarLinkProps {
  item: NavItem
  businessUnitId: string
}

// 3. SIDEBAR LINK SUB-COMPONENT (No changes needed)
// =================================================================
function SidebarLink({ item, businessUnitId }: SidebarLinkProps) {
  const pathname = usePathname()
  const href = item.href ? `/${businessUnitId}${item.href}` : ""
  const isActive = pathname === href

  if (item.children) {
    const isAnyChildActive = item.children.some((child) => {
      const childHref = child.href ? `/${businessUnitId}${child.href}` : ""
      return pathname.startsWith(childHref) // Use startsWith for parent highlighting
    })

    return (
      <Collapsible defaultOpen={isAnyChildActive}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-start font-normal">
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
            <ChevronRight className="ml-auto h-4 w-4 transition-transform data-[state=open]:rotate-90" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="ml-4 mt-2 flex flex-col space-y-1 border-l pl-4">
            {item.children.map((child) => (
              <SidebarLink key={child.title} item={child} businessUnitId={businessUnitId} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start font-normal" asChild>
      <Link href={href}>
        <item.icon className="mr-2 h-4 w-4" />
        {item.title}
      </Link>
    </Button>
  )
}

// 4. MAIN SIDEBAR COMPONENT
// =================================================================
export function Sidebar({ businessUnitId, businessUnits }: SidebarProps) {
  return (
    <div className="flex h-full flex-col border-r bg-background">
      {/* UPDATED: Static Header Section */}
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <Hotel className="h-6 w-6" />
          <span className="text-lg font-semibold whitespace-nowrap">Tropicana HMS</span>
        </div>
      </div>
        
      <Separator />
      <div className="mt-2 mb-2 ml-4">
        <BusinessUnitSwitcher items={businessUnits} />
      </div>
      <Separator />
    
      {/* Scrollable Navigation Section */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col space-y-1">
          {navigation.map((item) => (
            <SidebarLink key={item.title} item={item} businessUnitId={businessUnitId} />
          ))}
        </div>
      </div>
      {/* Logout Section */}
      <div className="mt-auto p-3">
        <Separator className="mb-3" />
        <UserProfileLogout />
      </div>
    </div>
  )
}