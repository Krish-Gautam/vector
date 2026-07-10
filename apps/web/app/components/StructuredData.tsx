import { organizationJsonLd, websiteJsonLd } from "@/app/lib/seo";

function JsonLdScript({ data, id }: { data: object; id: string }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function StructuredData() {
  return (
    <>
      <JsonLdScript id="organization-json-ld" data={organizationJsonLd} />
      <JsonLdScript id="website-json-ld" data={websiteJsonLd} />
    </>
  );
}
