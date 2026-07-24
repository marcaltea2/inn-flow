import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { hasPermission } from "~/server/api/rbac";
import { GuestsTable } from "./_components/guests-table";


export default async function AmenitiesPage() {
const session = await auth();

  if (!session?.user || !hasPermission(session.user.role, "amenity", "manage")) {
    redirect("/");
  }

  const canManage = hasPermission(session.user.role, "amenity", "manage");

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Guests</h1>
          <p className="text-sm text-muted-foreground">
            Manage guest profiles and registration information.
          </p>
        </div>
      </div>

      <GuestsTable canManage={canManage} />
    </div>
  );
}
