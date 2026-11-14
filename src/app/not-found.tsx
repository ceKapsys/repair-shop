import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { copy } from "@/content/copy";

export default function NotFound() {
  return (
    <main className="container-page py-24 text-center">
      <h1>{copy.errors.notFoundTitle}</h1>
      <p className="mx-auto mt-4 max-w-[52ch] text-ink-soft">{copy.errors.notFound}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/book" className={buttonVariants({ size: "lg" })}>{copy.nav.book}</Link>
        <Link href="/services" className={buttonVariants({ variant: "outline", size: "lg" })}>{copy.service.listTitle}</Link>
      </div>
    </main>
  );
}
