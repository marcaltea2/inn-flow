"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent } from "~/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  registerGuestFormSchema,
  type RegisterGuestFormInput,
} from "~/server/validations/guest-validation";

export function SignupForm() {
  const router = useRouter();

  const form = useForm<RegisterGuestFormInput>({
    resolver: zodResolver(registerGuestFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const mutation = api.guest.register.useMutation({
    onSuccess: () => {
      toast.success("Account created — check your email to verify it");
      form.reset();
      router.push("/");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <form
          onSubmit={form.handleSubmit((values) => {
            mutation.mutate({
              email: values.email,
              password: values.password,
              firstName: values.firstName,
              lastName: values.lastName,
            });
          })}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Enter your first name"
                disabled={mutation.isPending}
                {...form.register("firstName")}
              />
              {form.formState.errors.firstName && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Enter your last name"
                disabled={mutation.isPending}
                {...form.register("lastName")}
              />
              {form.formState.errors.lastName && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              disabled={mutation.isPending}
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-destructive text-sm">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Enter your password"
              disabled={mutation.isPending}
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-destructive text-sm">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              disabled={mutation.isPending}
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-destructive text-sm">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Create account
          </Button>

          <div className="mt-2 flex items-center justify-center">
            <span className="text-muted-foreground text-xs">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-foreground font-bold hover:underline"
              >
                Log in
              </a>
            </span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
