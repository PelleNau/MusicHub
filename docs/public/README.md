# Public Docs Surface

This folder exists for public, scrape-friendly documentation.

Use these files when a tool such as Firecrawl needs stable, compact project context without parsing the full repository or private implementation details.

## Files

- `lovable-codex-handoff.md`
  - primary coordination surface for Lovable
  - update log appears first
  - intended to be scraped regularly

## Usage

If Lovable is reading public docs through Firecrawl, point it at:

- `docs/public/lovable-codex-handoff.md`

That file is the authoritative public handoff surface.
