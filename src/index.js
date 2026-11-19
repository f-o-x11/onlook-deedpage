/**
 * onlook-deedpage: publish an HTML file exported from Onlook (or any folder) to
 * https://<slug>.deed.page/. Onlook has no plugin API; this works on the
 * self-contained HTML file its Export > HTML writes.
 * deed.page is operated by Avatar 8 LLC (ops@avatar33.com). MIT license.
 */
import { readFile, stat } from "node:fs/promises";
import { deploy } from "deed-page-deploy";

export const VERSION = "0.1.0";

/** Remote or file: references that will not load once the page is hosted. Returns a list of warnings. */
export async function checkExport(file) {
  const info = await stat(file);
  if (!info.isFile()) return [];
  const html = await readFile(file, "utf8");
  const warnings = [];
  if (!/<html[\s>]/i.test(html)) warnings.push("The file has no <html> element. Is it an Onlook HTML export?");
  const local = [...html.matchAll(/\s(?:src|href)\s*=\s*["'](file:[^"']+|\/(?:Users|home|[A-Za-z]:)[^"']*)["']/gi)].map((m) => m[1]);
  if (local.length) warnings.push(`${local.length} reference(s) point at files on this computer and will not load online, e.g. ${local[0]}`);
  return warnings;
}

/**
 * Publish an Onlook export.
 * @param {{ file: string, slug?: string, token?: string, origin?: string, fetch?: typeof fetch }} opts
 */
export async function publishOnlookExport(opts = {}) {
  if (!opts.file) throw new Error("file is required: the .html file (or folder) Onlook exported.");
  return deploy({
    dir: opts.file,
    slug: opts.slug,
    token: opts.token,
    origin: opts.origin,
    fetch: opts.fetch,
    ref: opts.ref || "partner_onlook",
    client: opts.client || `onlook-deedpage/${VERSION}`,
  });
}
