import { PageStub } from "@/components/ui/page-stub";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const p = await params;
  return <PageStub title={Object.values(p).join(" / ")} week="week 3" />;
}
