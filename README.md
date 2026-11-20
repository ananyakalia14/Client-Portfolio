# Raj Mane · Work Sruthi layout

Local content adaptation of the Work Sruthi snapshot supplied for this preview. Original design and motion by Sruthi Ramisetty. The personalized copy, project screenshots, certificates, and résumé are Raj Mane's portfolio content.

Run with Node.js 20 or newer.

```
npm ci
npm run dev
```

Open http://127.0.0.1:4175/. Add ?preloader=1 to replay the homepage intro.

The original frontend bundles power the interactions. Editable portfolio content lives in snapshot/assets/raj/content.mjs. The companion adapt.mjs maps copy to the captured layouts, and asset-map.mjs maps the original media slots to local Raj Mane assets. Some snapshot route identifiers retain their original names for navigation compatibility.

The preview is local and marked noindex. The footer credits the original design.

