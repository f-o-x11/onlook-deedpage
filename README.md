# onlook-deedpage

Publish an [Onlook](https://github.com/onlook-dev/onlook) HTML export to a permanent `https://<slug>.deed.page/` URL with one command.

Onlook does not have a plugin system, so this is not an in-app button. Onlook's **Export → HTML** writes one self-contained HTML file; this small CLI uploads that file (as `index.html`) to deed.page and prints the URL. It works the same for any HTML file or static folder.

[deed.page](https://deed.page/?ref=partner_onlook) is static hosting operated by Avatar 8 LLC.

## Install

```sh
npx onlook-deedpage "Landing page.html" --slug my-landing
```

Node.js 18 or later.

## Example

1. In Onlook, export the artifact as HTML and save it, for example to `~/Desktop/Landing page.html`.
2. Publish it:

   ```sh
   npx onlook-deedpage ~/Desktop/"Landing page.html" --slug my-landing
   # New owner token saved to ~/.config/deed-page/token (mode 600). Keep it: ...
   # https://my-landing.deed.page/
   ```

3. After more edits, export again and run the same command to publish a new version.

Before uploading, it warns if the file still points at paths on your computer (`file://` or `/Users/...`), which would not load online.

## Token

Read from `DEED_PAGE_TOKEN`, then `~/.config/deed-page/token`. The first publish creates a token and saves it there with mode 600; it is never printed. Same file as the `deed-page` and `deed-page-deploy` CLIs.

## Library

```js
import { publishOnlookExport } from "onlook-deedpage";
const { url } = await publishOnlookExport({ file: "Landing page.html", slug: "my-landing", token: process.env.DEED_PAGE_TOKEN });
```

Uploads go through [deed-page-deploy](https://github.com/f-o-x11/deed-page-deploy), tagged `ref=partner_onlook`. API docs: https://deed.page/docs.

## Support

ops@avatar33.com. MIT license, Avatar 8 LLC. Not affiliated with Onlook.
