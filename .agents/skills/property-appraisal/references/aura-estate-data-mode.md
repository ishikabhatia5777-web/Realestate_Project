# Aura Estate — Database-First Appraisal Mode

This reference governs how the `property-appraisal` skill runs **inside the Aura Estate application**, where the Aura Estate backend supplies the subject property and candidate comparable listings directly, instead of Claude finding them itself.

**This mode changes where evidence comes from. It does not change the valuation methodology** — still route by category to `residential.md`, `farm.md`, `land.md`, or `office.md` as set out in SKILL.md, and still produce a range + most-likely value + confidence + limitations + disclaimer.

## 1. Data flow

```
User selects a property → clicks "Generate Appraisal"
  → Aura Estate backend retrieves the subject property
  → Aura Estate backend retrieves candidate comparable listings
  → Backend sends subject property + candidate listings to Claude
  → Skill selects the best comparables from the supplied candidates
  → Skill performs appraisal analysis, adjustments, calculation, reconciliation
  → Claude generates the appraisal report
  → Backend stores/returns the report; frontend displays/downloads it
```

Claude/the skill is responsible for analysis, comparable selection *from what's supplied*, adjustments, calculation, confidence, and report generation. Claude is **not** responsible for querying the database itself, inventing records, or (by default) searching the web.

## 2. Database-first rule

The Aura Estate database is the **primary and authoritative source** of evidence in this mode.

- Use only the subject property and candidate listings supplied by the backend for this run.
- Do **not** automatically browse the web for additional comparables in this mode.
- Do **not** replace or supplement database comparables with invented properties.
- If the supplied data has too few usable comparables, say so plainly rather than filling the gap:
  > "Only two sufficiently comparable Aura Estate listings were available. Comparable evidence is limited and confidence has been reduced accordingly."

### No automatic web fallback
If the supplied Aura Estate database does not contain enough comparable listings:
- Do NOT search the web.
- Do NOT invent comparables.
- Do NOT silently use external properties.
- State plainly that comparable evidence in the Aura Estate database is insufficient.
- Reduce confidence appropriately (see §9).
- Explain what information is missing.

This applies even when the shortfall is severe (e.g. zero or one usable comparable) — the correct response is a clearly-flagged low-confidence report, never a web search to fill the gap.

### External web research — off unless explicitly enabled
External research stays disabled unless the request explicitly includes a flag such as `allow_external_market_research = true`. When it's enabled:
- Keep Aura Estate database listings and external evidence in clearly separate sections/rows — never blend them into one undifferentiated comparables table.
- Label each external source; never invent a URL or source name.
- Never present an external asking price as a sold price.

When the flag is false or absent, do not introduce external comparables at all, even if the database evidence looks thin — report the limitation instead (see §3).

## 3. Subject property input

The backend may supply any of: `listing_id`, `property_id`, `address`, `suburb`, `city`, `state`, `country`, `postcode`, `latitude`, `longitude`, `property_type`, `bedrooms`, `bathrooms`, `parking`, `land_size`, `building_size`, `year_built`, `condition`, `listing_status`, `listing_price`, `sale_price`, `listing_date`, `sale_date`, `description`, `amenities`, `features`.

Don't assume every field exists. For anything absent, write exactly: **"Not available in the Aura Estate database."** Never invent a value to fill the gap.

## 4. Comparable listing input & selection

Each candidate listing may carry the same field set (with `listing_id` in place of the subject's own IDs). The skill must **actively select** the strongest ~3–5 comparables from the supplied candidates — never just take the first ones in the list.

Rank candidates using (in rough order of importance, adapted per category per the existing reference files): property type match → suburb/location match → geographic proximity → land-size similarity → building-size similarity → bedroom similarity → bathroom similarity → parking similarity → age similarity → condition similarity → feature/amenity similarity → transaction/listing recency.

Classify each selected comparable **Strong / Moderate / Weak** and explain why in one line. Never rate a comparable Strong when a field critical to that rating (e.g. price, size, or type) is unavailable — cap it at Moderate or Weak instead.

## 5. Sold vs. listing price

Prefer confirmed transactions (`sale_price` + `sale_date`) over active listings (`listing_price`) wherever both exist in the candidate pool. If only an asking/listing price is available for a given comparable, label it explicitly as **"Current Asking Price"** or **"Listing Price"** in every table and sentence that uses it — never let it read as an achieved sale.

## 6. Comparable table

```
| Comparable | Aura Estate Listing ID | Status | Date | Price | Property Type | Beds | Baths | Parking | Land | Building Size | Similarity |
```
Populate only with fields actually supplied by the database; use "Not available in the Aura Estate database" for gaps rather than leaving a cell ambiguously blank.

Every comparable must retain its database/listing ID when the backend supplied one, both in this table and wherever that comparable is discussed in prose, e.g.:
> **Comparable 1**
> Aura Estate Listing ID: AE-1024

### Database source label
Every report generated in this mode must state, near the comparable evidence (e.g. at the top of §6 Comparable Listings), exactly:
> **Comparable Evidence Source: Aura Estate Database**

If external research was explicitly authorized and used (see §2), add a second, clearly separate line identifying that evidence as external rather than folding it into this label.

## 7. Adjustments

Compare every selected comparable to the subject on whatever of these are relevant to its category (see the category reference files for which factors matter most): location, land size, building size, bedrooms, bathrooms, parking, age, condition, renovation, pool, garden, view, privacy, outdoor space, amenities, luxury finishes, development quality, and other category-specific factors from `residential.md` / `farm.md` / `land.md` / `office.md`.

**Do not invent precise numerical adjustment percentages presented as market fact.** If a number isn't directly supported by the supplied evidence, label it explicitly as an **"Analytical assumption"** rather than stating it as established.

## 8. Transparent valuation calculation

Never jump straight to a headline number. For each selected comparable show: the relevant price/unit measure, how it compares to the subject, the material differences, the adjustment(s) applied, the adjusted indication, its weight, and its contribution to the final weighted figure:

```
| Comparable | Price | Unit Rate | Key Adjustments | Adjusted Indication | Weight | Weighted Contribution |
```

The final weighted indication must be arithmetically reproducible from this table — a reader should be able to check the math.

## 9. Valuation range & confidence

State the **basis** for the range explicitly (e.g. spread of adjusted comparables, weighted-indication spread, quality of evidence, market uncertainty) — never present an arbitrary +/- band around the point estimate without saying why that band was chosen.

Confidence is **High / Medium / Low**, justified by: number of Strong comparables, quality/completeness of the database information, recency, similarity, missing fields, market uncertainty, and any unusual characteristics of the subject. Do not default to High — it must be earned by the evidence actually supplied.

## 10. Database facts vs. analysis — keep these visibly separate

- **Verified Database Facts** — supplied directly by Aura Estate.
- **Derived Calculations** — arithmetic performed on database data.
- **Analytical Adjustments** — reasoned adjustments made during comparison (see §7).
- **Assumptions** — anything that can't be directly established from the supplied data.
- **Limitations** — missing or uncertain information that affects reliability.

Never let an assumption read as if it were a database fact.

## 11. Report structure (this mode)

```
# Aura Estate Property Appraisal Report
## 1. Executive Summary        (property, location, type, range, most-likely value, confidence)
## 2. Subject Property          (as supplied by Aura Estate)
## 3. Data Source                — state plainly: "Property and comparable evidence were
                                    sourced from the Aura Estate database." Separate out
                                    any explicitly-authorized external research.
## 4. Valuation Approach
## 5. Market Context             (only from supplied data or authorized external research)
## 6. Comparable Listings        (3–5 strongest, per §6 table)
## 7. Comparable Selection Reasoning
## 8. Comparable Adjustments
## 9. Valuation Calculation      (per §8 table)
## 10. Final Valuation           (range + most-likely value)
## 11. Confidence
## 12. Key Value Drivers
## 13. Risks and Limitations
## 14. Disclaimer
```

Disclaimer text (use verbatim, category-appropriate details aside):
> "This is an automated/desktop appraisal generated for Aura Estate decision-support and listing purposes. It is not a certified valuation or a substitute for a valuation performed by a qualified/licensed/registered valuer where such a valuation is legally or professionally required."

## 12. Anti-hallucination rules (this mode)

Never invent: listings, listing IDs, sale prices, sale dates, addresses, property sizes, bedroom/bathroom/parking counts, database records, or sources. Never assume a missing field's value. Never treat an asking price as a sold price. Never use external comparables without the explicit authorization flag.

- Missing field → **"Not available in the Aura Estate database."**
- Insufficient comparables → **"Insufficient comparable evidence is available in the Aura Estate database."**

## 13. Testing this mode

Before relying on this mode in production, run it against a controlled dataset: 1 subject property + ~10 candidate listings spanning different property types, locations, sizes, and prices, with some strong comparables, some weak ones, some missing fields, and a mix of active/sold status. Instruct explicitly: *"Use ONLY the supplied Aura Estate database listings. Do not browse the web."* Then confirm: the subject came from the supplied data; comparables came only from the supplied candidates; no external properties appear; the strongest comparables were actually selected (not just the first ones); sold vs. asking is distinguished throughout; missing fields read as "not available" rather than being invented; adjustments are explained and unsupported ones are labeled "Analytical assumption"; the calculation table is reproducible; the range states its basis; confidence reflects the actual evidence quality; and the report states the evidence came from the Aura Estate database.
