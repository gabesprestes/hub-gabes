import { ANALYSTS } from "@/lib/types";
import { AnalystView } from "./view";

export function generateStaticParams() {
  return ANALYSTS.map((person) => ({ slug: person.slug }));
}

export default async function AnalystPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <AnalystView slug={slug} />;
}
