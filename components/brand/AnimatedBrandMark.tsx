import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Keep the supplied geometry and paint order, including the two overlaid
// star silhouettes. Inline on the server, without adding 1 MB to client JS.
const original = readFileSync(join(process.cwd(), "public/brand/current/logo-nova.svg"), "utf8");
const markup = original.slice(original.indexOf("<svg"))
  .replace('id="Layer_1"', 'data-brand-mark="latest" aria-hidden="true" focusable="false"')
  .replaceAll("cls-", "jhow-latest-")
  .replace('class="jhow-latest-4"', 'class="jhow-latest-4" data-brand-star="yellow"')
  .replace('<path d="M1118.97,305.58', '<path data-brand-star="black" d="M1118.97,305.58');

export function AnimatedBrandMark() {
  return <span data-animated-brand dangerouslySetInnerHTML={{ __html: markup }} />;
}
