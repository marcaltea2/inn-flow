import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { hasPermission } from "~/server/api/rbac";
import { getGuestById } from "~/server/services/guest-service";
import { RegistrationCardForm } from "./_components/registration-card-form";
import { Button } from "~/components/ui/button";

export default async function RegistrationCardPage({
  params,
}: {
  params: Promise<{ guestId: string }>;
}) {
  const { guestId } = await params;
  const session = await auth();

  if (!session?.user || !hasPermission(session.user.role, "guest", "manage")) {
    redirect("/");
  }

  const guest = await getGuestById(guestId);

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="w-full max-w-lg">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          className="mb-4 -ml-2"
          render={
            <Link href="/guests">
              <ArrowLeft className="h-4 w-4" />
              Back to guests
            </Link>
          }
        />

        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            {guest.firstName} {guest.lastName}
          </h1>
          <p className="text-muted-foreground text-sm">
            Complete this guest&apos;s registration card.
          </p>
        </div>

        <RegistrationCardForm guest={guest} />
      </div>
    </div>
  );
}
