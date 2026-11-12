"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { loginAction } from "./actions";

const input =
  "mt-1.5 block h-11 w-full rounded-[var(--radius-input)] border border-border bg-background px-3 text-base";

export function LoginForm() {
  const [error, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className={input} />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} className={input} />
      </div>
      {error && <p role="alert" className="text-sm text-emergency">{error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
