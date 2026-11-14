"use client";

import { toast } from "sonner";
import { Section } from "@/components/admin/editor-shell";
import { FormProvider, TextArea, TextInput, useEntityForm } from "@/components/admin/form";
import { ImageUrlInput } from "@/components/admin/image-input";
import { Button } from "@/components/ui/button";
import { copy } from "@/content/copy";
import { seoSettingsInput } from "@/lib/validation/admin";
import { saveSeoDefaults } from "./actions";

export function SeoDefaultsForm({ initial }: { initial: { titleTemplate: string; description: string; ogImage: string } }) {
  const form = useEntityForm({ initial, schema: seoSettingsInput, save: saveSeoDefaults, onSaved: () => toast.success(copy.admin.saved) });
  return (
    <FormProvider form={form}>
      <form className="max-w-2xl" onSubmit={(e) => { e.preventDefault(); void form.submit(); }}>
        <Section title="Site-wide defaults" description="Used by any page that doesn't set its own.">
          <TextInput name="titleTemplate" label="Title template" hint="%s is replaced by the page title, e.g. “%s | Your shop”." />
          <TextArea name="description" label="Default description" counter={{ min: 140, max: 160 }} />
          <ImageUrlInput name="ogImage" label="Default social image" folder="branding" hint="1200 × 630. Without one, an image with the page title is generated." />
          <Button type="submit" disabled={form.saving}>{form.saving ? "Saving…" : "Save"}</Button>
        </Section>
      </form>
    </FormProvider>
  );
}
