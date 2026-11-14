"use client";

import { useActionState, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldAlert, ShieldCheck, Wrench, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";
import { devLoginAction, loginAction } from "./actions";

export function LoginForm({ isDev = false }: { isDev?: boolean }) {
  const [state, action, pending] = useActionState(loginAction, null);
  const [isDevPending, startDevTransition] = useTransition();
  const [devError, setDevError] = useState<string | null>(null);

  const params = useSearchParams();
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

  const handleDevLogin = (role: "owner" | "editor") => {
    setDevError(null);
    startDevTransition(async () => {
      const res = await devLoginAction(role, callbackUrl);
      if (res?.error) setDevError(res.error);
    });
  };

  const handlePrefill = (role: "owner" | "editor") => {
    if (role === "owner") {
      setEmail("admin@911repair.com");
      setPassword("AdminPass123!@#");
    } else {
      setEmail("tech@911repair.com");
      setPassword("TechPass123!@#");
    }
  };

  return (
    <div className="space-y-6">
      {/* Dev Server One-Click Login Panel */}
      {isDev && (
        <div className="rounded-2xl border border-line bg-surface p-4 ">
          <div className="flex items-center justify-between text-xs font-semibold text-warning">
            <span className="flex items-center gap-1.5 font-semibold">
              <Zap size={14} className="fill-warning text-warning" /> Dev Server Quick Login
            </span>
            <span className="rounded-full bg-mist text-ink px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              Local Dev Only
            </span>
          </div>

          <p className="mt-1 text-xs text-ink-soft">
            Instant 1-click authentication without entering credentials:
          </p>

          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              disabled={isDevPending || pending}
              onClick={() => handleDevLogin("owner")}
              className="pressable group flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-night px-4 text-xs font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <ShieldCheck size={15} />
              <span>
                {isDevPending ? "Authenticating Admin…" : "One-Click Admin Login (Owner)"}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isDevPending || pending}
                onClick={() => handleDevLogin("editor")}
                className="pressable flex h-9 items-center justify-center gap-1.5 rounded-xl border border-line bg-bg px-3 text-xs font-semibold text-ink transition-colors hover:bg-surface disabled:opacity-50"
              >
                <Wrench size={13} className="text-ink-soft" />
                <span>Tech Staff</span>
              </button>

              <button
                type="button"
                onClick={() => handlePrefill("owner")}
                className="flex h-9 items-center justify-center gap-1 rounded-xl border border-line/80 bg-surface/60 px-2 text-[11px] font-medium text-ink-soft transition-colors hover:text-ink"
                title="Autofill credentials into the form below"
              >
                Autofill Form
              </button>
            </div>
          </div>

          {devError && (
            <p role="alert" className="mt-2 text-xs text-emergency">
              {devError}
            </p>
          )}
        </div>
      )}

      {isDev && (
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-line" />
          </div>
          <span className="relative bg-bg px-3 text-[11px] uppercase tracking-wider text-ink-soft font-medium">
            Or Standard Login
          </span>
        </div>
      )}

      {/* Standard Form */}
      <form action={action} className="space-y-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        <div className={state?.need2fa ? "hidden" : undefined}>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@911repair.com"
          />
        </div>

        <div className={state?.need2fa ? "hidden" : undefined}>
          <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
          />
        </div>

        {state?.need2fa && (
          <div>
            <label htmlFor="totp" className="text-sm font-medium">
              Authenticator code
            </label>
            <input
              id="totp"
              name="totp"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              required
              autoFocus
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-ink-soft">
              Open your authenticator app and enter the 6-digit code.
            </p>
          </div>
        )}

        {state?.error && (
          <div className="flex items-center gap-2 rounded-xl border border-emergency/30 bg-emergency/5 p-3 text-xs text-emergency">
            <ShieldAlert size={15} className="shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <Button
          type="submit"
          className="w-full font-semibold"
          disabled={pending || isDevPending}
        >
          {pending ? "Signing in…" : state?.need2fa ? "Verify Code" : "Sign In with Credentials"}
        </Button>
      </form>
    </div>
  );
}
