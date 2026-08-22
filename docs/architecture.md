# Arhitektura — Travel Planner

## Backend — 3 Service Fabric servisa (2 stateless + 1 stateful)

1. **Identity.Service** (stateless) — registracija, login, heširanje lozinki (ASP.NET Core
   `PasswordHasher`), izdavanje JWT-a, uloge (User/Admin). Sopstvena SQL baza (`IdentityDb`).
2. **TripPlanning.Service** (stateless) — Trips, Destinations, Activities (uklj. lat/lng za mapu),
   Checklist, i Expenses/Budget (spojeno sa Trip agregatom radi cascade delete i izbegavanja
   veštačkog cross-service razdvajanja 1—* relacije). Sopstvena SQL baza (`TripPlanningDb`).
3. **Sharing.Service** (STATEFUL, Reliable Dictionary) — generiše share-tokene (opaque GUID),
   čuva `{tripId, accessType(VIEW/EDIT), expiry, revoked}` u Reliable Dictionary. Single partition
   (`TargetReplicaSetSize=1` lokalno).

Bez custom Gateway servisa — koristi se ugrađeni Service Fabric Reverse Proxy (port 19081,
path-based rutiranje preko Naming Service-a):

```
http://localhost:19081/TravelPlannerApp/<ServiceName>/...
```

Frontend `.env` (kada SF cluster radi) sadrži URL-ove servisa preko ovog proxy-ja — vidi
`frontend/.env.example`.

## Autentifikacija i deljenje

- Jedna JWT šema: korisnički JWT izdat od Identity.Service, nezavisno validiran u
  TripPlanning.Service i Sharing.Service preko deljenog simetričnog ključa (Application Parameter
  u `ApplicationManifest.xml` kada SF bude uveden).
- Share-link je opaque token (ne JWT) — Sharing.Service je jedini izvor istine (Reliable
  Dictionary). Ostali servisi validiraju pristup pozivom
  `GET /internal/shares/validate?token=...&tripId=...` na Sharing.Service.
- Cross-service integritet (Sharing → TripPlanning), sinhroni HTTP:
  - Kreiranje share-linka: Sharing.Service → `GET /internal/trips/{id}` (TripPlanning.Service).
  - Brisanje trip-a: TripPlanning.Service → `DELETE /internal/trips/{id}/shares` (best-effort).

## Domenski model

- **User**: Id, Name, Email, PasswordHash, Role(User/Admin), CreatedAt
- **Trip**: Id, UserId, Name, Description, StartDate, EndDate, Budget, Notes, CreatedAt
- **Destination**: Id, TripId, Name, Location, ArrivalDate, DepartureDate, Description
- **Activity**: Id, TripId, DestinationId?, Name, Date, Time, Location, Latitude, Longitude,
  Description, EstimatedCost, Status(Planned/Reserved/Completed/Cancelled)
- **Expense**: Id, TripId, Name, Category, Amount, Date, Description
- **ChecklistItem**: Id, TripId, Text, IsCompleted

Cascade delete: sve gore navedeno vezano za Trip koristi `OnDelete(DeleteBehavior.Cascade)`.
Validacija: `EndDate >= StartDate`, `Budget >= 0`, `EstimatedCost >= 0`, `Amount >= 0`.
DTO-jevi odvojeni od EF entiteta, mapiranje preko ručnih extension metoda (`ToDto()`/`ApplyTo()`)
po servisu — bez dodatne AutoMapper zavisnosti.

## Frontend

React + TypeScript (Vite). Context API za auth/globalno stanje. HTTP pozivi isključivo kroz
per-domain servisne module (`src/services/`) koji čitaju base URL iz `.env`. Eksplicitni TS
modeli (`src/models/`). Forme: React Hook Form + Zod. Kalendar: `react-big-calendar`. Mapa/ruta:
`react-leaflet` + OpenStreetMap + `Polyline`. QR kod: `qrcode.react` (frontend-side generisanje).

## Fazni plan implementacije

1. ✅ **Setup** — repo, backend/frontend skeleton, docker-compose.
2. ✅ **Identity.Service** — User model/migracija, register/login, JWT, role middleware.
3. ✅ **TripPlanning.Service — Trips + Destinations** — CRUD, cascade delete, validacija.
4. ✅ **TripPlanning.Service — Activities + Checklist + Expenses/Budget** — CRUD, kalkulacije.
5. ✅ **Sharing.Service** — Reliable Dictionary, generisanje/validacija/opoziv tokena.
6. ✅ **Frontend — Auth + skeleton** — routing, AuthContext, forme, zaštićene rute.
7. ✅ **Frontend — Trips/Destinations/Activities + kalendar**.
8. ✅ **Frontend — Budžet/Troškovi + Checklist**.
9. ✅ **Frontend — Mapa (bonus feature)**.
10. ✅ **Frontend — Deljenje** — QR kod, VIEW/EDIT UX.
11. ✅ **Admin panel**.
12. 🔶 **Dokumentacija i predaja** — use case dijagram, finalni README, provera svih napomena iz
    specifikacije.

## Use Case dijagram

Vidi [`use-case-diagram.svg`](use-case-diagram.svg) — akteri Gost / Korisnik / Administrator
(generalizacija: Administrator nasleđuje sve use case-ove Korisnika, Korisnik nasleđuje Gosta),
use case-ovi grupisani po funkcionalnim celinama, uz `<<extend>>` relaciju za bonus mapu.

## Provera napomena iz specifikacije

Vidi [`napomene-checklist.md`](napomene-checklist.md) — REST konvencije, DTO/model separacija,
`.env` disciplina, heširane lozinke, JWT validacija, validacione granice, cascade delete, sa
referencama na konkretan kod.
