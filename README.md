# VORTEXIA v2 — Rebuild

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + React Router + TanStack Query + Zustand + Supabase (same project/DB as v1, no data migration needed).

## Bakit ang stack na ito
- **React + TypeScript** — pinaka-malaking ecosystem, at nahuhuli agad ng TypeScript ang mga bug bago pa mag-runtime (malaking upgrade mula sa vanilla JS ng v1).
- **Vite** — mabilis, simple i-maintain, walang kumplikadong build config.
- **TanStack Query** — awtomatikong nire-refresh ang data pag-focus/foreground ng tab (kasama na dito ang buong bug class ng "Chats tab hindi nagre-refresh" — hindi na ito posibleng mangyari ulit dahil structural na ang fix, hindi lang isang if-branch na pwedeng makalimutan).
- **Zustand** — simpleng state management para sa auth/session, walang boilerplate.
- **Supabase** — pinanatili gaya ng desisyon mo, parehong project (`rgoasqesstmwfuqzhmqp`), lahat ng data/RLS/RPCs mo ay gumagana pa rin nang walang migration.
- **WebView wrapper** — pinanatili rin (com.meetandgreet.app); may built-in foreground session-refresh fix mula sa v1.

## Paano patakbuhin
```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build sa dist/
```

## Kasalukuyang tapos na (working proof-of-concept)
- ✅ Login/Signup (email-only, walang social linking — sundin ang Section 0 ng v1 masterplan)
- ✅ Auth state management + session persistence + WebView foreground refresh
- ✅ Bottom nav layout (Home/Discover/Chats/Notifications/Profile)
- ✅ Dashboard — profile card, reputation badge, highlight badge, meeting counts (live mula sa Supabase)
- ✅ Chats — listahan ng threads (auto-refreshing, hindi na kailangan ng manual fix)
- ✅ Notifications — listahan na may icons (kasama ang job_match mula sa v1)
- ✅ Profile — basic view + sign out
- ✅ ReputationBadge at HighlightBadge components — 1:1 ported mula sa v1 logic

## Roadmap — natitirang i-port mula sa v1 (9,700+ linyang app.js)

### Priority 1 — core na kailangan bago ma-deploy
- [ ] Chat thread detail view (messages, send/receive, real-time subscription via `supabase.channel()`)
- [ ] Sender name/avatar resolution sa loob ng chat (gamitin ang proper relational `select` join sa halip na v1's `allProfilesCache` Map pattern — mas malinis sa React/TypeScript)
- [ ] Edit Profile modal (full_name, bio, skills, contact info, timezone/language)
- [ ] Settings — dark mode toggle, Account, Privacy, Notifications, Blocklist, 2FA
- [ ] Photo/cover upload (isama ang session-refresh-before-upload fix mula sa v1)
- [ ] Onboarding flow (bagong users)

### Priority 2 — marketplace/job-hunting (puso ng app, Section 0)
- [ ] Marketplace listing feed + filters (type, category, work_type)
- [ ] Post a listing (job/gig/general) form
- [ ] "Message seller" → createOrStartChat equivalent
- [ ] Job-match alert notifications (backend trigger na TAPOS NA sa DB — client lang kailangan i-render)

### Priority 3 — community/social
- [ ] Communities list + category filter chips (Party Rooms, Section 6.6 — backend RPCs TAPOS NA: `get_or_create_community_room`)
- [ ] Community detail — online-now grid, join-the-conversation button
- [ ] Badge gallery/showcase modal (VIP) — backend logic TAPOS NA (`highlight_badge` column, `search_profiles` RPC), UI lang kailangan
- [ ] Follow/unfollow, Contacts list
- [ ] Forum threads

### Priority 4 — VIP/monetization
- [ ] VIP upgrade flow + Stripe checkout
- [ ] "Who viewed my profile" (VIP) — backend TAPOS NA (`profile_view_log`, `log_profile_view` RPC)
- [ ] Premium themes, animated avatar frame
- [ ] Vanity MG ID edit

### Priority 5 — polish
- [ ] Real-time meeting/video call UI
- [ ] Recordings, My Recordings tab
- [ ] Reactions, replies, file/voice messages sa chat
- [ ] Admin panel

## Mahalagang paalala
- **Lahat ng backend logic (RLS, triggers, RPCs) na na-build/na-fix natin sa v1 ay GUMAGANA na rin dito nang walang extra work** — parehong Supabase project lang ito. Ang trabaho dito ay puro FRONTEND re-implementation, hindi backend rebuild.
- Sundin ang parehong "walang gimmick" na patakaran (Section 0/6.5 ng v1 masterplan) kapag nagdadagdag ng bagong feature dito.
- I-refer sa v1 `VORTEXIA_MASTERPLAN.md` para sa buong context/history habang nagpo-port.
