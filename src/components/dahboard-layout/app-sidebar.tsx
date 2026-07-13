import Link from "next/link";
import { BedDouble } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "~/components/ui/sidebar";
import { dashboardNav } from "~/config/dashboard-nav";
import { AppUser } from "~/components/dahboard-layout/app-user";
import type { Role } from "@prisma/client";

type AppSidebarProps = {
  user: {
    name: string;
    email: string;
    role: Role;
    image?: string | null;
  };
};

export function AppSidebar({ user }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
            <BedDouble className="h-4 w-4" />
          </div>
          <span className="truncate font-semibold group-data-[collapsible=icon]:hidden">
            InnFlow
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {dashboardNav.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.roles || item.roles.includes(user.role),
          );

          if (visibleItems.length === 0) return null;

          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        render={
                          <Link href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        }
                      />
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <AppUser user={user} />
      <SidebarRail />
    </Sidebar>
  );
}
