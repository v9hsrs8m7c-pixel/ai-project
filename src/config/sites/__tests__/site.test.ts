import test from "node:test";
import assert from "node:assert/strict";
import { getSiteConfig, listSites } from "../index.ts";

test("resolves the default site by its configured domain", () => {
  const site = getSiteConfig("darlynmae.com");
  assert.equal(site.siteId, "default");
  assert.equal(site.siteName, "Darlynmae");
});

test("falls back to the default site for an unknown domain", () => {
  const site = getSiteConfig("some-other-site.example.com");
  assert.equal(site.siteId, "default");
});

test("falls back to the default site for localhost (dev)", () => {
  const site = getSiteConfig("localhost");
  assert.equal(site.siteId, "default");
  assert.equal(site.domain, "darlynmae.com");
});

test("domain matching is case-insensitive and ignores ports", () => {
  assert.equal(getSiteConfig("DARLYNMAE.COM:3000").siteId, "default");
});

test("registry contains exactly one site in this phase", () => {
  assert.equal(listSites().length, 1);
});
