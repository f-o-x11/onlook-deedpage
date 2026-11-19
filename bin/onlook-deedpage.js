#!/usr/bin/env node
import { loadToken, saveToken, tokenFile, redact } from "deed-page-deploy";
import { publishOnlookExport, checkExport, VERSION } from "../src/index.js";

const HELP = `onlook-deedpage ${VERSION}: publish an Onlook HTML export to https://<slug>.deed.page/

Usage:
  onlook-deedpage <exported.html | folder> [--slug <slug>] [--json]

In Onlook, export the artifact as HTML (one self-contained file), then run this
on that file. Run it again with the same --slug to update the site.

Token: DEED_PAGE_TOKEN, else ${tokenFile()}. The first publish creates one and saves it there (mode 600).`;

const args = process.argv.slice(2);
const flags = {};
const rest = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "-h" || a === "--help") flags.help = true;
  else if (a === "-v" || a === "--version") flags.version = true;
  else if (a === "--json") flags.json = true;
  else if (a === "--slug" || a === "--origin") flags[a.slice(2)] = args[++i];
  else rest.push(a);
}

async function main() {
  if (flags.version) return console.log(VERSION);
  if (flags.help || !rest[0]) {
    console.log(HELP);
    if (!flags.help) process.exitCode = 1;
    return;
  }
  for (const w of await checkExport(rest[0])) console.error(`warning: ${w}`);
  const res = await publishOnlookExport({ file: rest[0], slug: flags.slug, token: loadToken(), origin: flags.origin || process.env.DEED_PAGE_URL });
  const saved = res.minted ? saveToken(res.token) : null;
  if (flags.json) {
    const { token: _t, ...out } = res;
    return console.log(JSON.stringify({ ...out, token_saved_to: saved }, null, 2));
  }
  if (saved) console.error(`New owner token saved to ${saved} (mode 600). Keep it: it is the only key to update or delete this site.`);
  console.error(`${res.version}. Update later with: onlook-deedpage ${rest[0]} --slug ${res.slug}`);
  console.log(res.url);
}

main().catch((e) => {
  console.error(redact(e && e.message ? e.message : String(e)));
  process.exitCode = 1;
});
