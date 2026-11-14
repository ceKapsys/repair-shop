"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Section } from "@/components/admin/editor-shell";
import { FormProvider, TextInput, useEntityForm } from "@/components/admin/form";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";
import { passwordChangeInput } from "@/lib/validation/admin";
import { changePassword, confirmTwoFactor, disableTwoFactor, startTwoFactor } from "./actions";

function PasswordForm() {
  const [key, setKey] = useState(0);
  return <PasswordFormInner key={key} onDone={() => setKey((k) => k + 1)} />;
}

function PasswordFormInner({ onDone }: { onDone: () => void }) {
  const form = useEntityForm({ initial: { current: "", next: "", confirm: "" }, schema: passwordChangeInput, save: changePassword, onSaved: onDone });
  return (
    <FormProvider form={form}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void form.submit();
        }}
        className="space-y-5"
      >
        <TextInput name="current" type="password" label="Current password" />
        <TextInput name="next" type="password" label="New password" hint="At least 12 characters. A short sentence works well." />
        <TextInput name="confirm" type="password" label="Repeat new password" />
        <Button type="submit" disabled={form.saving}>Change password</Button>
      </form>
    </FormProvider>
  );
}

function TwoFactor({ has2fa }: { has2fa: boolean }) {
  const router = useRouter();
  const [setup, setSetup] = useState<{ secret: string; qr: string; sealed: string } | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [pending, start] = useTransition();

  if (has2fa)
    return (
      <div className="space-y-4">
        <p className="flex items-center gap-2 text-success"><ShieldCheck size={18} /> On — you’ll be asked for a code from your app when you sign in.</p>
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const r = await disableTwoFactor(password);
              if (!r.ok) return void toast.error(r.error);
              toast.success(r.message);
              setPassword("");
              router.refresh();
            });
          }}
        >
          <div className="min-w-56 flex-1">
            <label htmlFor="pw-2fa" className="text-sm font-medium">Password to turn it off</label>
            <input id="pw-2fa" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
          </div>
          <Button type="submit" variant="outline" disabled={pending || !password}>Turn off</Button>
        </form>
      </div>
    );

  if (!setup)
    return (
      <Button
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await startTwoFactor();
            if (r.ok && r.data) setSetup(r.data);
            else if (!r.ok) toast.error(r.error);
          })
        }
      >
        Set up two-step sign-in
      </Button>
    );

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await confirmTwoFactor(setup.sealed, code);
          if (!r.ok) return void toast.error(r.error);
          toast.success(r.message);
          setSetup(null);
          setCode("");
          router.refresh();
        });
      }}
    >
      <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-soft">
        <li>Open Google Authenticator, 1Password, Authy or a similar app.</li>
        <li>Scan this code, or enter the key by hand.</li>
        <li>Type the 6-digit code the app shows.</li>
      </ol>
      <div className="flex flex-wrap items-center gap-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={setup.qr} alt="QR code for your authenticator app" width={180} height={180} className="rounded-lg border border-line bg-on-primary p-1" />
        <code className="rounded-lg bg-surface px-3 py-2 text-sm break-all">{setup.secret.match(/.{1,4}/g)?.join(" ")}</code>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label htmlFor="totp-code" className="text-sm font-medium">6-digit code</label>
          <input id="totp-code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} value={code} onChange={(e) => setCode(e.target.value)} className={`${inputClass} w-40 tracking-widest`} />
        </div>
        <Button type="submit" disabled={pending || code.replace(/\s/g, "").length !== 6}>Turn on</Button>
        <Button type="button" variant="ghost" onClick={() => setSetup(null)}>Cancel</Button>
      </div>
    </form>
  );
}

export function AccountPanels({ has2fa }: { has2fa: boolean }) {
  return (
    <div className="space-y-6">
      <Section title="Password">
        <PasswordForm />
      </Section>
      <Section title="Two-step sign-in" description="Protects the admin even if your password leaks.">
        <TwoFactor has2fa={has2fa} />
      </Section>
    </div>
  );
}
