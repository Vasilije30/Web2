# Travel Planner — kontekst za Claude

Predmetni projekat: "Primena veb programiranja u infrastrukturnim sistemima". Detaljna arhitektura
i fazni plan su u `docs/architecture.md`. Ovaj fajl je operativni sažetak za nastavak rada.

## Ko je korisnik

Student koji pravi ovaj projekat kao predaju za fakultet. Ne piše kod sam (Claude radi
implementaciju), ali sam vodi Git — vidi odeljak "Git workflow" ispod, to je STROGO pravilo.

## Stanje projekta (ažurirati posle svake veće izmene)

**Sve faze iz `docs/architecture.md` su implementirane i verifikovane na živom Service Fabric
klasteru:**
- Faze 1–5 (backend): Identity.Service (stateless), TripPlanning.Service (stateless),
  Sharing.Service (stateful, Reliable Dictionary) — sve tri deployovane i testirane
- Faze 6–10 (frontend): auth, trips/destinations/activities+kalendar, budžet/checklist,
  mapa (react-leaflet), deljenje (QR kod)
- Faza 11 (admin panel): gotova i verifikovana — upravljanje korisnicima/rolama i pregled svih
  planova
- **Kompletan redizajn frontenda** (avgust 2026): dizajn sistem u `frontend/src/styles/`
  (tokens/base/layout/components/pages/vendor), sve stranice i komponente prerađene, `npm run
  build` i `npm run lint` čisti

**Faza 12 (dokumentacija i predaja) — u toku:**
- ✅ Use case dijagram: `docs/use-case-diagram.svg` (ručno crtan SVG, akteri Gost/Korisnik/Admin +
  generalizacija + `<<extend>>` za bonus mapu)
- ✅ Finalizovan README.md (opis, funkcionalnosti, arhitektura, preduslovi, uputstvo za pokretanje
  korak-po-korak, test nalog, struktura repoa)
- ✅ Provera "Napomene" stavki iz specifikacije dokumentovana u `docs/napomene-checklist.md` (REST
  konvencije, DTO/model separacija, `.env` disciplina, heširane lozinke, JWT validacija,
  validacione granice, cascade delete — sve sa referencama na konkretan kod)
- `docs/architecture.md` ažuriran: fazni plan (1–11 ✅), linkovi ka use case dijagramu i
  napomene-checklist.md

**Preostalo pre predaje:** korisnik treba da pregleda novi README/dijagram/checklist, i da se
odluči da li je potrebno još nešto za predaju (npr. export SVG-a u PNG za pisani rad, ako se traži
slika a ne vektorski fajl). Ništa od ovoga nije komitovano — vidi "Git workflow".

## Git workflow — OBAVEZNO PROČITATI PRE BILO KAKVOG git KOMANDE

**Nikad ne pokretati `git add` / `git commit` / `git push` samostalno, ni kad izgleda kao logičan
sledeći korak.** Korisnik komituje sam, svojim tempom (otprilike jednom dnevno), piše sopstvene
poruke na srpskom, pod GitHub identitetom Vasilije30 — bez `Co-Authored-By` linije.

Kad se završi neka celina rada: opisati šta je promenjeno, predložiti logično grupisanje u
komit(e), i stati. Korisnik sam bira naslove i pokreće komitovanje.

Trenutno stanje repoa (proveriti `git log --oneline` i `git status` za tačno stanje — ovo se brzo
menja): postoje samo 3 rana komita (skelet, README, Shared/JWT infrastruktura); SVE ostalo
(oba puna backend servisa, Sharing servis, ceo frontend, redizajn) je nekomitovano. Ranije je
predložen redosled od 5 komita grupisanih po servisu/oblasti (Identity → TripPlanning → Sharing+SF
deploy → frontend modeli/servisi → frontend stranice/komponente/stilovi) — pitati korisnika da li
je to i dalje plan pre nego što se predlaže novo grupisanje.

## Kako pokrenuti projekat lokalno (za verifikaciju u browseru)

Redosled je bitan — sve mora da radi pre nego što se testira UI:

1. **SQL Server**: `docker compose -f docker/docker-compose.yml up -d` (Docker Desktop mora biti
   pokrenut)
2. **Service Fabric lokalni klaster**: mora biti ručno pokrenut (NE diže se sam pri restartu
   mašine) — Service Fabric Local Cluster Manager (tray ikonica) → Start Local Cluster, ili
   `Start-Service FabricHostSvc` u PowerShell-u KAO ADMINISTRATOR. Provera: http://localhost:19080
3. **Backend deploy** (samo ako je backend kod menjan otkad je klaster poslednji put deployovan —
   SF pamti deployment kroz gašenje/paljenje klastera, redeploy NIJE potreban svaki put):
   PowerShell KAO ADMINISTRATOR, `cd backend/deploy; .\Deploy-Local.ps1`
4. **Frontend**: `cd frontend; npm run dev` — http://localhost:5173

Health provera bez UI-ja: `curl http://localhost:19081/TravelPlannerApp/IdentityService/api/health`
— ako ne odgovara, klaster nije pokrenut (najčešći uzrok "ne radi ništa").

Test admin nalog za brzu proveru admin panela: `admin_verify_67644251@example.com` /
`AdminPass123!` (kreiran ručno tokom razvoja, postoji u bazi).

## Ključne arhitekturne odluke (detalji u docs/architecture.md)

- 3 Service Fabric servisa: Identity (stateless), TripPlanning (stateless, uključuje i
  Destinations/Activities/Expenses/Checklist — namerno spojeno, ne razdvojeno u još servisa),
  Sharing (stateful, Reliable Dictionary — bez sopstvene SQL baze)
- Nema custom API Gateway — koristi se ugrađeni SF Reverse Proxy (port 19081)
- Share-linkovi su opaque token-i (ne JWT), validacija ide cross-service HTTP pozivom ka
  Sharing.Service
- Frontend: React + TS + Vite, HTTP pozivi isključivo kroz `services/*.ts` module (nikad direktno
  u komponentama), `.env` za sve backend URL-ove
- Bonus feature: mapa sa rutom (react-leaflet) — koordinate se unose na nivou **Aktivnosti**, ne
  Destinacije ili Plana (Destination/Trip modeli namerno nemaju lat/lng, jer mapa prikazuje rutu
  aktivnosti po danima, ne same destinacije)

## Poznati zamke (da se ne ponavljaju)

- SQL Server "multiple cascade paths" — Activity→Destination FK mora biti `DeleteBehavior.NoAction`
  + eksplicitna `ExecuteUpdateAsync` nulifikacija pri brisanju destinacije
- Enum-i se MORAJU serijalizovati kao string (`JsonStringEnumConverter`) u SVA TRI servisa — lako
  se zaboravi dodati u novom servisu/kontroleru, izazove 400 grešku koja izgleda kao nepovezan bug
- `HttpClient` BaseAddress sa putanjom (SF reverse proxy URL-ovi) + relativni URI koji počinje sa
  `/` = gubi se ceo base path. Nikad ne stavljati vodeću kosu crtu u cross-service pozivima.
- `<input type="time">` šalje "HH:mm", backend `TimeOnly` očekuje "HH:mm:ss" — konvertovati u
  frontend-u pre slanja
- Service Fabric lokalni klaster se NE pokreće automatski pri restartu Windows-a — ovo je
  najčešći uzrok "ne radi ništa" prijava korisnika, prvo proveriti pre traženja bug-a u kodu
