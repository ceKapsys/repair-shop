"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/field";

/** Tiptap is client-only and heavy; load it on demand. */
export const RichTextInput = dynamic(() => import("./rich-text"), { ssr: false, loading: () => <Skeleton className="h-80" /> });
