"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { completeGuestRegistrationCardSchema } from "~/server/validations/guest-validation";
import { api, type RouterOutputs } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ID_TYPES } from "./id-types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type Guest = RouterOutputs["guest"]["getById"];

export function RegistrationCardForm({ guest }: { guest: Guest }) {
  const router = useRouter();

  const [month, setMonth] = useState(
    guest.dateOfBirth ? String(guest.dateOfBirth.getMonth() + 1) : "",
  );
  const [day, setDay] = useState(
    guest.dateOfBirth ? String(guest.dateOfBirth.getDate()) : "",
  );
  const [year, setYear] = useState(
    guest.dateOfBirth ? String(guest.dateOfBirth.getFullYear()) : "",
  );

  const form = useForm({
    resolver: zodResolver(completeGuestRegistrationCardSchema),
    defaultValues: {
      guestId: guest.id,
      dateOfBirth: guest.dateOfBirth ?? undefined,
      nationality: guest.nationality ?? "",
      idType: guest.idType ?? "",
      idNumber: guest.idNumber ?? "",
    },
  });

  useEffect(() => {
    if (month && day && year?.length === 4) {
      const iso = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      const parsed = new Date(iso);
      if (!isNaN(parsed.getTime())) {
        form.setValue("dateOfBirth", parsed, { shouldValidate: true });
      }
    }
  }, [month, day, year, form]);

  const mutation = api.guest.completeRegistration.useMutation({
    onSuccess: () => {
      toast.success("Registration card saved");
      router.push("/guests");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Card>
      <CardHeader>
        <p className="text-sm font-medium">Identity details</p>
        <p className="text-muted-foreground text-xs">
          Used for legal and check-in verification purposes only.
        </p>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1.5">
            <Label>Date of birth</Label>
            <div className="flex gap-2">
              <Select value={month} onValueChange={(v) => setMonth(v ?? "")}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={m} value={String(i + 1)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Day"
                className="w-20"
                inputMode="numeric"
                maxLength={2}
                value={day}
                onChange={(e) => setDay(e.target.value.replace(/\D/g, ""))}
              />
              <Input
                placeholder="Year"
                className="w-24"
                inputMode="numeric"
                maxLength={4}
                value={year}
                onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            {form.formState.errors.dateOfBirth && (
              <p className="text-destructive text-sm">
                {form.formState.errors.dateOfBirth.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nationality">Nationality</Label>
            <Input
              id="nationality"
              placeholder="e.g. Filipino"
              {...form.register("nationality")}
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="idType">ID type</Label>
              <Select
                value={form.watch("idType")}
                onValueChange={(v) =>
                  form.setValue("idType", v ?? "", { shouldValidate: true })
                }
              >
                <SelectTrigger id="idType">
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  {ID_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="idNumber">ID number</Label>
              <Input
                id="idNumber"
                placeholder="Enter ID number"
                {...form.register("idNumber")}
                autoComplete="off"
              />
            </div>
          </div>

          <Button type="submit" disabled={mutation.isPending} className="mt-2">
            {mutation.isPending ? "Saving…" : "Save registration card"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}