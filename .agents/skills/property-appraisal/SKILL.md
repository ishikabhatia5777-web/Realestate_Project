---
name: property-appraisal
description: Produces a defensible property valuation estimate with reasoning for Aura Estate listings — residential, villa, apartment, townhouse, farm, land, and office. Use this skill whenever the user asks Claude to appraise, value, estimate the worth of, or assess the asking/listing price of an Aura Estate property — including requests like "what's this listing worth", "value this villa", "is this asking price fair", "estimate the price for this plot", or when given a property's details and asked for an opinion of value. Also use this skill when the Aura Estate application/backend sends a subject property record plus candidate comparable listings and requests an appraisal report to be generated from that supplied data (database-first mode) — trigger on that data shape even without an explicit natural-language request. Trigger even if the user doesn't say "appraisal" explicitly, as long as they're asking for a property value estimate, a listing price recommendation, or a comparison against similar properties.
---

# Aura Estate — Property Appraisal Skill

Produces a property valuation estimate with clear, defensible reasoning, tailored to Aura Estate's listing categories: **residential, villa, apartment, townhouse, farm, land, office**. Since Aura Estate positions itself as a luxury marketplace, appraisals should account for premium/luxury factors (finishes, exclusivity, brand of development, views, privacy) in addition to standard valuation drivers — don't default to mass-market assumptions unless the listing clearly is one.

## Workflow

0. **Check which mode this run is in.** If the request comes with Aura Estate backend-supplied data (a subject property record and/or a set of candidate comparable listings, e.g. with fields like `listing_id`, `sale_price`, `listing_price`, etc.) — this is **Aura Estate database mode**. Read `references/aura-estate-data-mode.md` in full before doing anything else, and follow it: the database supplied by the backend is the primary and authoritative evidence source, external web search for comparables is **off by default** in this mode (only used if the request explicitly sets `allow_external_market_research = true`), and the report follows the structure defined in that reference file. Steps 1–6 below still describe the underlying valuation methodology (category routing, adjustments, reconciliation, limitations) — database mode changes *where the evidence comes from*, not how it's analyzed.

   If instead the user is chatting directly with Claude and pasting/describing a property with no backend-supplied dataset, proceed with steps 1–6 as normal (web search allowed for comparables, as described in step 3).

1. **Gather the subject property's details.** At minimum: category (one of the seven above), location, size (built-up/carpet/plot/farm acreage as relevant), age/condition, and any standout features. If the user hasn't given these — or is pasting in a listing — pull what's available and ask only for what's genuinely missing.

2. **Route to the right method** by category — read the matching reference file before producing the valuation, since each has the specific approach, adjustment factors, and a worked example:
   - Residential, villa, apartment, townhouse → `references/residential.md`
   - Farm → `references/farm.md`
   - Land (plots, undeveloped) → `references/land.md`
   - Office → `references/office.md`

   Villas, apartments, and townhouses share the sales-comparison logic in `residential.md` but note category-specific adjustment factors called out there (e.g. private land/pool for villas, HOA/complex amenities for apartments, shared-wall/end-unit for townhouses).

3. **Find comparables.**

   **When running inside Aura Estate (database mode):** follow the Aura Estate Comparable Data Workflow below. Web search is NOT used to find comparables in this mode.

   ### Aura Estate Comparable Data Workflow
   1. The Aura Estate backend provides the subject property.
   2. The Aura Estate backend provides candidate listings from the Aura Estate database.
   3. The skill analyzes only those supplied database listings.
   4. The skill selects the strongest 3–5 comparable listings.
   5. The skill performs the appropriate category-specific appraisal analysis.
   6. The skill generates the final appraisal report.

   The skill must NOT independently query the Aura Estate database, and must NOT use web_search to find comparables in this mode — the backend is solely responsible for retrieving database records and passing them to Claude. Full detail (no-web-fallback behavior, external-research opt-in, source labeling, anti-hallucination rules) is in `references/aura-estate-data-mode.md`.

   **When chatting directly with Claude outside Aura Estate (no backend-supplied dataset):** if the user hasn't supplied comparable sales/listings, use web_search (or a connected real-estate/MCP tool) to find 3–5 recent, similar properties in the same area and category. Prefer the last 6–12 months. Note the source and date of each — for a luxury marketplace, stale comparables in a fast-moving segment are especially misleading.

4. **Apply adjustments.** Adjust each comparable for differences from the subject (size, condition, location, age, amenities, and — where relevant — luxury/exclusivity factors like views, privacy, finishes, brand). State each adjustment and *why*.

5. **Reconcile to a final estimate.** Weight comparables by similarity to the subject, not a flat average. Present the result as a range with a most-likely point estimate — never a falsely-precise single figure.

6. **Always disclose limitations.** This is an informal/desktop appraisal for listing or decision-support purposes, not a certified/legal valuation. For financing, legal, tax, or dispute purposes, a licensed appraiser/registered valuer is required — say so plainly.

## Output format

*(Non-database mode. In Aura Estate database mode, use the 14-section report structure in `references/aura-estate-data-mode.md` §11 instead.)*

- **Subject property summary** (category, location, key facts)
- **Approach used**
- **Comparables table** (address/area, size, price, date, key adjustments)
- **Reasoning** (weighting, what drove the estimate up or down, luxury factors if relevant)
- **Estimated value range** + most-likely point estimate
- **Limitations / disclaimer**

Keep it readable — table for comparables, prose for reasoning. No boilerplate padding.

## Principles

- Never invent comparable sales data — only use real data supplied by the user, found via search/tools, or pulled from Aura Estate's own listings. If good comparables can't be found, say so and explain the effect on confidence.
- Be explicit about uncertainty. A range with reasoning beats a single confident-sounding number.
- For luxury/high-end listings, note that thin comparable pools are normal — say so rather than forcing false precision from 1–2 comparables.
- Flag anything unusual about the local market (fast-appreciating micro-market, oversupply, seasonal demand swings) that could make comparables less reliable than usual.
- Never invent a database record, listing ID, price, date, address, or size in Aura Estate database mode — see `references/aura-estate-data-mode.md` §12 for the full anti-hallucination rules for that mode.
