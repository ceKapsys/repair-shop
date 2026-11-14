import Image from "next/image";
import Link from "next/link";
import { copy, fill } from "@/content/copy";
import type { BrandT } from "@/lib/types";

export function BrandTile({ brand, count }: { brand: BrandT; count?: number }) {
  return (
    <Link href={`/devices/${brand.slug}`} className="pressable flex min-h-20 items-center gap-4 rounded-card border border-line bg-bg p-4 hover:border-steel">
      {brand.logo ? (
        <Image src={brand.logo} alt="" width={40} height={40} className="size-10 object-contain" />
      ) : (
        <span className="flex size-10 items-center justify-center rounded-full bg-surface font-semibold text-steel" aria-hidden>{brand.name.slice(0, 1)}</span>
      )}
      <span>
        <span className="block font-medium">{brand.name}</span>
        {count != null && count > 0 && <span className="text-sm leading-5 text-ink-soft">{count === 1 ? copy.misc.oneModel : fill(copy.misc.models, { count })}</span>}
      </span>
    </Link>
  );
}
