import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { publishOnlookExport, checkExport } from "../src/index.js";

const dir = mkdtempSync(path.join(tmpdir(), "onlook-"));
const file = path.join(dir, "Landing page.html");
writeFileSync(file, '<!doctype html><html><head><style>h1{color:teal}</style></head><body><h1>Onlook export</h1><img src="data:image/png;base64,iVBORw0KGgo="></body></html>');

test("checkExport passes a self-contained export and flags local paths", async () => {
  assert.deepEqual(await checkExport(file), []);
  const bad = path.join(dir, "bad.html");
  writeFileSync(bad, '<html><img src="file:///Users/me/a.png"></html>');
  assert.match((await checkExport(bad))[0], /on this computer/);
});

test("publishes the file as index.html with ref=partner_onlook", async () => {
  const calls = [];
  const fetch = async (url, init) => {
    const u = new URL(url);
    calls.push({ path: u.pathname + u.search, init });
    if (u.pathname === "/v1/uploads") {
      const m = JSON.parse(init.body);
      return new Response(JSON.stringify({ ok: true, missing: m.files.map((f) => ({ sha256: f.sha256, upload: { url: "https://blob.test/x" } })), finalize_url: "https://deed.test/v1/uploads/s/finalize" }));
    }
    if (u.host === "blob.test") return new Response("");
    return new Response(JSON.stringify({ ok: true, url: "https://onlook-x.deed.page/", slug: "onlook-x", version: "v1", token: "deed_tok_X" }));
  };
  const res = await publishOnlookExport({ file, slug: "onlook-x", origin: "https://deed.test", fetch });
  assert.equal(res.url, "https://onlook-x.deed.page/");
  assert.equal(calls[0].path, "/v1/uploads?ref=partner_onlook");
  assert.deepEqual(JSON.parse(calls[0].init.body).files.map((f) => f.path), ["index.html"]);
  assert.match(calls[0].init.headers["x-client"], /^onlook-deedpage\//);
});
