import { defineField, defineType } from "sanity";

export const artwork = defineType({
  name: "artwork", title: "Artwork", type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true }, validation: (rule) => rule.required() }),
    defineField({ name: "alt", title: "Alternative text", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "project", title: "Project", type: "reference", to: [{ type: "project" }] }),
    defineField({ name: "layout", title: "Layout preset", type: "string", options: { list: ["portrait", "landscape", "square"] }, initialValue: "portrait" }),
    defineField({ name: "status", title: "Status", type: "string", options: { list: ["draft", "published", "archive"] }, initialValue: "draft" }),
    defineField({ name: "order", title: "Order", type: "number" }),
  ],
});

export const project = defineType({
  name: "project", title: "Project", type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (rule) => rule.required() }),
    defineField({ name: "year", title: "Year", type: "number" }),
    defineField({ name: "category", title: "Category", type: "string" }),
    defineField({ name: "descriptionPt", title: "Description (Português)", type: "text" }),
    defineField({ name: "descriptionEn", title: "Description (English)", type: "text" }),
    defineField({ name: "cover", title: "Cover", type: "image", options: { hotspot: true }, validation: (rule) => rule.required() }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false }),
    defineField({ name: "status", title: "Status", type: "string", options: { list: ["draft", "published", "archive"] }, initialValue: "draft" }),
    defineField({ name: "order", title: "Order", type: "number" }),
    defineField({ name: "externalLinks", title: "External links", type: "array", of: [{ type: "object", fields: [defineField({ name: "label", type: "string" }), defineField({ name: "url", type: "url" })] }] }),
  ],
});

export const shopItem = defineType({
  name: "shopItem", title: "Shop item", type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" } }),
    defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "descriptionPt", title: "Description (Português)", type: "text" }),
    defineField({ name: "descriptionEn", title: "Description (English)", type: "text" }),
    defineField({ name: "price", title: "Price", type: "number" }),
    defineField({ name: "currency", title: "Currency", type: "string", initialValue: "BRL" }),
    defineField({ name: "externalUrl", title: "External purchase URL", type: "url" }),
    defineField({ name: "status", title: "Status", type: "string", options: { list: ["draft", "available", "soldOut", "archive"] }, initialValue: "draft" }),
    defineField({ name: "order", title: "Order", type: "number" }),
  ],
});

export const siteSettings = defineType({
  name: "siteSettings", title: "Site settings", type: "document",
  fields: [
    defineField({ name: "siteName", title: "Site name", type: "string" }),
    defineField({ name: "descriptionPt", title: "Description (Português)", type: "text" }),
    defineField({ name: "descriptionEn", title: "Description (English)", type: "text" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "instagram", title: "Instagram URL", type: "url" }),
    defineField({ name: "behance", title: "Behance URL", type: "url" }),
    defineField({ name: "linkedin", title: "LinkedIn URL", type: "url" }),
    defineField({ name: "homeArtworks", title: "Home artworks", type: "array", of: [{ type: "reference", to: [{ type: "artwork" }] }] }),
  ],
});

export const schemaTypes = [artwork, project, shopItem, siteSettings];
