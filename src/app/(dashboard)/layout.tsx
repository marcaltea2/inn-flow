import { redirect } from "next/navigation";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/dahboard-layout/app-sidebar";
import { auth } from "~/server/auth";
import { Topbar } from "~/components/dahboard-layout/app-topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) redirect("/login");

  if (session.user.isTempPassword) {
    redirect("/change-password");
  }

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          name: session.user.firstName + " " + session.user.lastName,
          email: session.user.email ?? "",
          role: session.user.role,
          image: session.user.image,
        }}
      />
      <SidebarInset>
        <Topbar />
        <main className="flex flex-1 flex-col gap-4 p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}