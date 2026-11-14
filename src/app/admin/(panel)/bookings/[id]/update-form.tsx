"use client";

import { useRouter } from "next/navigation";
import { FormProvider, NumberInput, SelectInput, TextArea, Toggle, useEntityForm } from "@/components/admin/form";
import { Button } from "@/components/ui/button";
import type { BookingStatus } from "@/lib/types";
import { bookingAdminInput } from "@/lib/validation/admin";
import { updateBooking } from "../actions";
import { STATUS_TEXT } from "../status-badge";

export function BookingUpdateForm({ id, status, quotedPrice, currency, canEmail }: { id: string; status: BookingStatus; quotedPrice?: number; currency: string; canEmail: boolean }) {
  const router = useRouter();
  const form = useEntityForm({
    initial: { status, quotedPrice, note: "", notifyCustomer: canEmail },
    schema: bookingAdminInput,
    save: (v) => updateBooking(id, v),
    onSaved: () => {
      form.set("note", "");
      router.refresh();
    },
  });
  const changed = form.values.status !== status;
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
        <SelectInput name="status" label="Status" options={(Object.keys(STATUS_TEXT) as BookingStatus[]).map((s) => ({ value: s, label: STATUS_TEXT[s] }))} />
        {canEmail && changed && <Toggle name="notifyCustomer" label="Email the customer" hint="Sends a short status update." />}
        <NumberInput name="quotedPrice" label="Quoted price" prefix={currency} hint="What you agreed with the customer." />
        <TextArea name="note" label="Add a note" rows={3} placeholder="Only visible to the team" />
        <Button type="submit" disabled={form.saving} className="w-full">Save</Button>
      </form>
    </FormProvider>
  );
}
