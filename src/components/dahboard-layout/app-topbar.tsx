// src/components/shared/topbar.tsx
"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { SidebarTrigger } from "~/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ThemeToggle } from "~/components/dahboard-layout/theme-toggle";
import { Separator } from "~/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export function Topbar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      {/* Sidebar toggle + separator */}
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />

      <div className="ml-auto flex items-center gap-2">
        {/* Search */}
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input placeholder="Search..." className="pl-8 text-sm" />
        </div>
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="bg-primary absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuItem>Task assigned to you</DropdownMenuItem>
            <DropdownMenuItem>Project deadline tomorrow</DropdownMenuItem>
            <DropdownMenuItem>New comment on your task</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />

        {/* Avatar */}
        <Avatar className="h-8 w-8">
          <AvatarImage src="" />
          <AvatarFallback className="text-xs">CH</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
