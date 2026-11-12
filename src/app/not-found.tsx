import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-muted">The page may have moved. You can still book a repair or go home.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className={buttonVariants({ variant: "outline" })}>Home</Link>
        <Link href="/book" className={buttonVariants()}>Book a repair</Link>
      </div>
    </main>
  );
}
