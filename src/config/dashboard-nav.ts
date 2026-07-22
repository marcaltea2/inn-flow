import {
  LayoutDashboard,
  BedDouble,
  CalendarRange,
  Users,
  Receipt,
  Sparkles,
  UserCog,
  Settings,
  ConciergeBell,
  type LucideIcon,
} from "lucide-react";
import { Role } from "@prisma/client";

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
    items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }],
  },
  {
    label: "Front Desk",
    items: [
      {
        title: "Reservations",
        url: "/reservations",
        icon: CalendarRange,
        roles: [Role.ADMIN, Role.MANAGER, Role.FRONT_DESK],
      },
      {
        title: "Guests",
        url: "/guests",
        icon: Users,
        roles: [Role.ADMIN, Role.MANAGER, Role.FRONT_DESK],
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        title: "Rooms",
        url: "/rooms",
        icon: BedDouble,
        roles: [Role.ADMIN, Role.MANAGER],
      },
      {
        title: "Housekeeping",
        url: "/housekeeping",
        icon: Sparkles,
        roles: [Role.ADMIN, Role.MANAGER, Role.HOUSEKEEPING],
      },
    ],
  },
  {
    label: "Billing",
    items: [
      {
        title: "Folios & Payments",
        url: "/billing",
        icon: Receipt,
        roles: [Role.ADMIN, Role.MANAGER, Role.FRONT_DESK],
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        title: "Staff",
        url: "/staff",
        icon: UserCog,
        roles: [Role.ADMIN],
      },
      {
        title: "Amenities",
        url: "/amenities",
        icon: ConciergeBell,
        roles: [Role.ADMIN],
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        roles: [Role.ADMIN],
      },
    ],
  },
];
