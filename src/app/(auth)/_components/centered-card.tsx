
import { Card, CardContent } from "~/components/ui/card";

export function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardContent className="flex flex-col gap-6 pt-10 pb-8">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}