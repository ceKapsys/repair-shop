"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Lock, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { FormProvider, SelectInput, TextInput, useEntityForm } from "@/components/admin/form";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, Modal } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/field";
import { formatDate } from "@/lib/format";
import type { UserT } from "@/lib/types";
import { userInput } from "@/lib/validation/admin";
import { deleteUser, resetUser2fa, saveUser } from "./actions";

type Row = UserT & { locked: boolean };

function UserForm({ user, onDone }: { user: Row | null; onDone: () => void }) {
  const router = useRouter();
  const form = useEntityForm({
    initial: user ? { name: user.name, email: user.email, role: user.role, password: "" } : { name: "", email: "", role: "editor", password: "" },
    isNew: !user,
    schema: userInput,
    save: (v) => saveUser(user?._id ?? null, v),
    onSaved: () => {
      router.refresh();
      onDone();
    },
  });
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
        <TextInput name="name" label="Name" autoFocus />
        <TextInput name="email" label="Email" type="email" />
        <SelectInput
          name="role"
          label="Role"
          options={[
            { value: "editor", label: "Editor — content and bookings" },
            { value: "owner", label: "Owner — everything, incl. settings and users" },
          ]}
        />
        <TextInput
          name="password"
          type="password"
          label={user ? "New password" : "Starting password"}
          hint={user ? "Leave empty to keep the current password. Setting one also unlocks the account." : "At least 12 characters. Share it privately; they can change it under Account."}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
          <Button type="submit" disabled={form.saving}>{user ? "Save" : "Create user"}</Button>
        </div>
      </form>
    </FormProvider>
  );
}

export function UserManager({ users, meId }: { users: Row[]; meId: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Row | null | "new">(null);
  const [confirm, setConfirm] = useState<{ kind: "delete" | "2fa"; user: Row } | null>(null);
  const [, start] = useTransition();

  const run = () => {
    if (!confirm) return;
    const { kind, user } = confirm;
    setConfirm(null);
    start(async () => {
      const r = kind === "delete" ? await deleteUser(user._id) : await resetUser2fa(user._id);
      if (!r.ok) return void toast.error(r.error);
      toast.success(kind === "delete" ? `Deleted ${user.name}` : r.message ?? "Done");
      router.refresh();
    });
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setEditing("new")}>Add user</Button>
      </div>
      <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-bg">
        {users.map((u) => (
          <li key={u._id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {u.name} {u._id === meId && <span className="text-sm font-normal text-ink-soft">(you)</span>}
              </p>
              <p className="truncate text-sm text-ink-soft">
                {u.email} · {u.lastLoginAt ? `last signed in ${formatDate(u.lastLoginAt)}` : "never signed in"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={u.role === "owner" ? "primary" : "neutral"}>{u.role === "owner" ? "Owner" : "Editor"}</Badge>
              {u.has2fa && <Badge tone="success"><ShieldCheck size={12} /> 2FA</Badge>}
              {u.locked && <Badge tone="warning"><Lock size={12} /> Locked</Badge>}
            </div>
            <div className="flex items-center">
              <button type="button" aria-label={`Edit ${u.name}`} onClick={() => setEditing(u)} className="flex size-11 items-center justify-center rounded-lg text-ink-soft hover:bg-surface">
                <Pencil size={18} strokeWidth={1.5} />
              </button>
              {u.has2fa && u._id !== meId && (
                <button type="button" aria-label={`Turn off two-step sign-in for ${u.name}`} title="Turn off 2FA" onClick={() => setConfirm({ kind: "2fa", user: u })} className="flex size-11 items-center justify-center rounded-lg text-ink-soft hover:bg-surface">
                  <KeyRound size={18} strokeWidth={1.5} />
                </button>
              )}
              {u._id !== meId && (
                <button type="button" aria-label={`Delete ${u.name}`} onClick={() => setConfirm({ kind: "delete", user: u })} className="flex size-11 items-center justify-center rounded-lg text-ink-soft hover:bg-emergency/10 hover:text-emergency">
                  <Trash2 size={18} strokeWidth={1.5} />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Add user" : "Edit user"}>
        {editing !== null && <UserForm key={editing === "new" ? "new" : editing._id} user={editing === "new" ? null : editing} onDone={() => setEditing(null)} />}
      </Modal>
      <ConfirmDialog
        open={confirm !== null}
        onCancel={() => setConfirm(null)}
        onConfirm={run}
        title={confirm?.kind === "delete" ? `Delete ${confirm.user.name}?` : `Turn off 2FA for ${confirm?.user.name}?`}
        body={confirm?.kind === "delete" ? "They will no longer be able to sign in. This can’t be undone." : "They will sign in with just their password until they set up 2FA again."}
        confirmLabel={confirm?.kind === "delete" ? "Delete user" : "Turn off 2FA"}
      />
    </>
  );
}
