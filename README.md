# Bluestem Grange

Handmade bar soap from Franktown, Colorado. This repo is an Online Store 2.0 Shopify theme with a static HTML preview for local layout work.

## Local preview

The static pages are served from the folder root:

- http://localhost/bluestem-grange/
- Product example: http://localhost/bluestem-grange/products/ponderosa-pine.html

`index.html`, `about.html`, and the other root HTML files are for localhost only. Shopify will use the Liquid templates instead.

## Theme

Standard Shopify directories: `layout`, `templates`, `sections`, `snippets`, `assets`, `config`, `locales`.

When a development store exists, install [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) and run:

```
shopify theme dev --store=your-store.myshopify.com
```

Create the six soaps (or assign a collection) and point the homepage product grid at that collection. Until then, the grid uses placeholder blocks.

## Brand

- Text, links, buttons: `#0E4433`
- Accent only: `#6DBACA`
- Logos in `brand/` and copied to `assets/`
