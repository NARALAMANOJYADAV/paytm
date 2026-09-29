# Prompt to Production: UI system guide (for restyling agents)

Direction: "Rietveld sliding planes, professional". The whole site is ONE LIGHT world built from flat rectangles (planes) separated by 2px near-black frame lines. Zero border radius everywhere. No gradients, no glass, no blur, no glow, no coloured shadows, no emoji-as-icons, no gradient text, no pill badges, no rounded-2xl cards, no `dark` slate backgrounds. It should feel like a confident Swiss/De Stijl institutional identity: official, crisp and modern.

## Tokens (Tailwind v4 theme in src/app/globals.css; use them as Tailwind classes)
- Colours: `ink` #0d1117 (text, frame lines), `ink-2` (secondary text), `ink-3` (tertiary/labels), `paper` #fff (planes), `field` #eef0f2 (page ground, quiet planes), `field-2`, `rule` #c9ced5 (hairline dividers inside a plane), `navy` #002e6e (THE one committed colour plane: Paytm navy), `navy-2`, `sky` #00baf2 (Paytm sky: primary action + active edge ONLY), `sky-soft`, `sun` #ffc629 (selected/highlight, sparingly), `sun-soft`, `ok` / `ok-soft` (success), `alert` / `alert-soft` (errors/destructive only).
  e.g. `bg-paper text-ink`, `text-ink-3`, `bg-navy text-white`, `border-rule`, `bg-sky-soft`.
- Fonts: `font-sans` = Archivo (variable width). `font-mono` = JetBrains Mono, ONLY for IDs, codes, ticket numbers, invite codes, timestamps in tables. Never mono as decoration.
- Default Tailwind neutrals (slate/gray/zinc) and cyan/blue/indigo/purple/emerald/amber/rose must be REMOVED and mapped to the tokens above.

## Component classes (defined in globals.css @layer components)
- `.planes`: a CSS grid whose 2px gap shows the ink frame lines; children get a white background automatically. Add grid-cols etc. with Tailwind. Use it for stat rows, fact grids, and dashboard tiles instead of separate floating cards: `<div className="planes grid-cols-2 lg:grid-cols-4"> <div className="p-5">…</div> … </div>`.
- `.plane-navy`, `.plane-sky`, `.plane-sun`, `.plane-field`, `.plane-ink`: coloured planes (work inside .planes or standalone). At most ONE navy plane and ONE sky plane per view; they must mean something (navy = identity/primary context, sky = the action).
- `.frame` (2px ink border), `.rule-b`, `.rule-t` (2px ink rule).
- `.cell-label`: tiny uppercase caption for a VALUE inside a cell (e.g. "DATE" over "30 Sep 2026"). NEVER put an eyebrow/kicker label above a section or page heading; headings stand alone.
- `.display`: wide (font-stretch 125%) 800 weight, tight; for the landing hero and big numbers only. `.wide`: slightly wide. `.page-title`: the H1 for every app page (dashboard/admin/coordinator). `.num`: tabular numerals for any numbers/stats/prices/times.
- Buttons: `.btn` (white, 2px ink border), `.btn-primary` (sky, the main action), `.btn-navy`, `.btn-ink`, `.btn-danger`, `.btn-quiet` (borderless), sizes `.btn-sm` / `.btn-lg`. Primary action per view = `.btn btn-primary`. No rounded, no gradient, no shadow.
- Forms: `.field` on input/select/textarea, `.field-label`, `.field-hint`. Errors: `aria-invalid="true"` plus a message in `text-alert`.
- Status: `.tag` plus one of `.tag-ok` (confirmed, checked-in, paid, resolved), `.tag-pending` (dashed: pending, reserved, open, draft, under review), `.tag-alert` (failed, duplicate, urgent), `.tag-info` (neutral info, role), `.tag-off` (cancelled/struck).
- Tabs / sub-nav: `.rail-item` with `data-active="true"` or `aria-current="page"`; the active one gets a 4px sky bottom edge. Put rails in a white bar with `rule-b`.
- Tables: `<table className="table-planes">` inside a `frame bg-paper overflow-x-auto` wrapper.
- Motion: `.slide-in` (clip-path wipe) for at most one hero element per page; `.edge-in` for a sky bar. Otherwise just quick colour transitions. Respect reduced motion (already handled in CSS).

## Layout rules
- Page ground is `bg-field`; content lives on white planes framed with 2px ink. App pages: a white header plane holding the `.page-title` h1, one line of `text-ink-2` description and the page actions on the right, then content planes.
- Spacing: tight inside groups, generous between groups (gap-6/8 between sections, p-5/p-6 in planes). More space above headings than below.
- Section headings (h2) are `text-xl font-extrabold wide` or `page-title`; no eyebrow above them, no decorative icons in circles, and no "01/02" numbering unless it is a real sequence (e.g. registration steps).
- Icons: lucide-react only, stroke icons at 16–20px, `text-ink-2` or inherit; never inside coloured gradient tiles; never emoji.
- Text contrast: body text `text-ink` or `text-ink-2` on paper/field; on navy use `text-white` and `text-[#a9c3e6]` for secondary. Never grey-on-colour and never faded low-opacity text.
- Mobile first: everything must work at 375px wide, tap targets ≥44px, and tables scroll horizontally inside their frame.
- Modals: a white `frame` plane on an `bg-ink/60` overlay with no blur; the header uses `rule-b`.
- Brand: "Paytm" as text in navy, a "Paytm ♥ AI" mention is allowed with a lucide Heart icon in `text-alert`. Keep the NBKRIST, Department of IT & AI&DS and ISTE names exactly.

## Hard constraints
- Preserve ALL logic, state, handlers, hooks, imports that are used, routes, data, copy and facts. This is a visual restyle; do not change behaviour. Only remove imports that become unused.
- Do not touch src/lib/**, src/app/api/**, globals.css, or layout.tsx (unless your task names them).
- This is Next.js 16 + React 19 + Tailwind v4. Keep "use client" directives.
- After editing, run `npx tsc --noEmit -p .` from the project root and fix any errors in YOUR files. Do not run `next build` and do not start or stop any dev server (one is already running on :3400; other servers on 3000/3100/3200/3300/5173 must not be touched). You may curl http://localhost:3400/<route> to confirm HTTP 200.
- Search your files at the end for leftover `slate-`, `cyan-`, `blue-`, `indigo-`, `purple-`, `emerald-`, `amber-`, `rose-`, `gradient`, `rounded-`, `backdrop-blur`, `shadow-` and remove them (a `shadow` is allowed only on a modal plane: `shadow-[0_12px_40px_rgba(13,17,23,0.18)]`).

## UPDATE (supersedes the colour notes above): DARK poster palette, technical-event vibe
The user asked for a technical event feel with colours matching the official poster (deep navy-black ground, electric blue, Paytm sky, gold). The structure (planes, 2px frame lines, zero radius, rationed accents) is unchanged, but the world is now DARK. Token NAMES stay the same while their VALUES changed:
- `field` = the darkest ground (#060b18, with a faint blueprint grid on body). `field-2` = input wells. `paper` = the dark plane surface (#0d172e); `paper-2` = hover/raised plane.
- `ink` = primary LIGHT text (#eef3fb), `ink-2` secondary, `ink-3` tertiary. So `bg-paper text-ink` is still correct.
- `line` = the 2px frame-line colour (#2e4270). Use `border-line` for any 2px frame (NOT `border-ink`). `rule` = 1px hairline divider inside a plane (`border-rule`, `divide-rule`).
- `navy` (#123a8c royal) = the one committed identity plane, with white text. `sky` = Paytm sky (primary action / active edge). `sun` = poster gold (highlight / selected / countdown). `ok`, `alert` = success/error. The `*-soft` variants are dark tinted backgrounds.
- `on-accent` (#050b16) = the text colour ON sky/sun/ok/alert fills. NEVER put `text-white` or `text-ink` on a sky/sun/ok/alert background. Prefer the classes `.plane-sky`, `.plane-sun`, `.plane-ok`, `.plane-alert` (they set the correct text colour), or `bg-sky text-on-accent`.
- DO NOT use `bg-ink` as a dark surface any more (ink is now near-white). For the darkest surface use `.plane-ink` (near-black) or `bg-field`.
- `text-white` is only for text on `navy`.
- QR codes must stay on a pure white square (`bg-white p-3`) for scannability; that is the one white thing.
- Technical-event cues that are welcome: font-mono for IDs, timestamps, codes and times in schedules; `.cell-label`s like instrument readouts; thin sky "active" edges. Not welcome: neon glows, gradients, glassmorphism, rounded pills.

## FINAL UPDATE (supersedes both notes above): SIGNAL palette, black + gold on white
The user rejected the dark navy/neon look as AI slop and chose "Signal: black + gold": a white page, black frame lines, big solid black and gold blocks, like conference and engineering signage, technical and collegiate. The token NAMES are unchanged, only the VALUES:
- `field` = light grey page ground (#f1f1ef, faint drafting grid on body). `paper` = white planes. `ink` = near-black text. `line` = black frame lines (2px). `rule` = light hairline.
- `navy` now = BLACK (#0b0b0c): the one committed identity plane, with `text-white`. `.plane-navy` / `.plane-ink` are both black with white text.
- `sky` AND `sun` now = poster GOLD (#ffc21a): the primary action and the highlight, with `text-on-accent` (black). `.btn-primary` = gold with a black frame.
- `paytm` (#002e6e) and `paytm-sky` (#00baf2) exist ONLY for the Paytm wordmark ("Pay" navy + "tm" sky) where Paytm is named as the conducting partner; use them nowhere else.
- `ok` / `alert` are deep green / red; `.plane-ok` / `.plane-alert` put white text on them.
- Keep the flat planes, 2px black frames and zero radius. The drama comes from scale contrast (huge wide black type against white), full black bands, and gold used boldly in a few big blocks (Register, countdown, first place), never in scattered small accents.
