"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";
import { loginAction } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);
  const params = useSearchParams();
  // Controlled so values survive React’s form reset when the 2FA step appears.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const callbackUrl = (() => {
    try {
      const raw = params.get("callbackUrl") ?? "";
      return raw.startsWith("/") ? raw : new URL(raw).pathname;
    } catch {
      return "";
    }
  })();
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className={state?.need2fa ? "hidden" : undefined}>
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className={state?.need2fa ? "hidden" : undefined}>
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {state?.need2fa && (
        <div>
          <label htmlFor="totp" className="text-sm font-medium">Authenticator code</label>
          <input id="totp" name="totp" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} required autoFocus className={inputClass} />
          <p className="mt-1.5 text-sm text-muted">Open your authenticator app and enter the 6-digit code.</p>
        </div>
      )}
      {state?.error && <p role="alert" className="text-sm text-emergency">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : state?.need2fa ? "Verify" : "Sign in"}
      </Button>
    </form>
  );
}
