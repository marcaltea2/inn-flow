import {
  LayoutDashboard,
  BedDouble,
  CalendarRange,
  Users,
  Receipt,
  Sparkles,
  UserCog,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@prisma/client"; 

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  roles?: Role[]; 
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const dashboardNav: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Front Desk",
    items: [
      {
        title: "Reservations",
        url: "/dashboard/reservations",
        icon: CalendarRange,
        roles: ["ADMIN", "MANAGER", "FRONT_DESK"],
      },
      {
        title: "Guests",
        url: "/dashboard/guests",
        icon: Users,
        roles: ["ADMIN", "MANAGER", "FRONT_DESK"],
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        title: "Rooms & Room Types",
        url: "/dashboard/rooms",
        icon: BedDouble,
        roles: ["ADMIN", "MANAGER"],
      },
      {
        title: "Housekeeping",
        url: "/dashboard/housekeeping",
        icon: Sparkles,
        roles: ["ADMIN", "MANAGER", "HOUSEKEEPING"],
      },
    ],
  },
  {
    label: "Billing",
    items: [
      {
        title: "Folios & Payments",
        url: "/dashboard/billing",
        icon: Receipt,
        roles: ["ADMIN", "MANAGER", "FRONT_DESK"],
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        title: "Staff & Users",
        url: "/dashboard/staff",
        icon: UserCog,
        roles: ["ADMIN"],
      },
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
        roles: ["ADMIN"],
      },
    ],
  },
];