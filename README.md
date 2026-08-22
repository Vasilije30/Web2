# Travel Planner

Web aplikacija za planiranje putovanja — predmetni projekat iz predmeta "Primena veb
programiranja u infrastrukturnim sistemima". Korisnicima omogućava kreiranje planova putovanja,
upravljanje destinacijama i aktivnostima po danima (uz kalendarski prikaz i mapu sa rutom),
praćenje troškova i budžeta, checklistu za pakovanje, kao i deljenje planova sa drugim osobama
putem linka/QR koda. Administratori imaju poseban panel za upravljanje korisnicima i pregled svih
planova u sistemu.

Backend je organizovan kao mikroservisna arhitektura na Microsoft Service Fabric platformi, sa
Microsoft SQL Server bazom podataka. Frontend je razvijen u React-u (TypeScript, Vite).

Detaljna arhitektura: [`docs/architecture.md`](docs/architecture.md) · Use case dijagram:
[`docs/use-case-diagram.svg`](docs/use-case-diagram.svg) · Provera napomena iz specifikacije:
[`docs/napomene-checklist.md`](docs/napomene-checklist.md)

## Funkcionalnosti

- Registracija / prijava, JWT autentifikacija, uloge Korisnik/Administrator
- CRUD nad planovima putovanja, destinacijama i aktivnostima (uklj. kalendarski prikaz aktivnosti)
- Mapa sa rutom putovanja (react-leaflet), na osnovu koordinata aktivnosti — bonus funkcionalnost
- Praćenje budžeta i troškova po planu putovanja
- Checklista za pakovanje
- Deljenje plana putovanja preko linka (VIEW/EDIT pristup) i QR koda, bez potrebe za nalogom na
  strani gledaoca
- Admin panel: upravljanje korisnicima (uloge/status), pregled svih planova u sistemu

## Arhitektura — u kratkim crtama

3 Service Fabric servisa (2 stateless + 1 stateful):

| Servis | Tip | Odgovornost | Baza |
|---|---|---|---|
| **Identity.Service** | stateless | registracija, login, JWT, uloge | `IdentityDb` (SQL Server) |
| **TripPlanning.Service** | stateless | planovi, destinacije, aktivnosti, budžet/troškovi, checklista | `TripPlanningDb` (SQL Server) |
| **Sharing.Service** | stateful | share-tokeni (Reliable Dictionary, bez sopstvene SQL baze) | — |

Nema custom API Gateway-a — koristi se ugrađeni Service Fabric Reverse Proxy (port 19081).
Detalji (autentifikacija, cross-service pozivi, domenski model, frontend arhitektura) su u
[`docs/architecture.md`](docs/architecture.md).

## Tehnologije

- **Backend**: .NET 8, ASP.NET Core Web API, Entity Framework Core, Microsoft Service Fabric SDK,
  SQL Server
- **Frontend**: React 19, TypeScript, Vite, React Router, React Hook Form + Zod, react-leaflet,
  react-big-calendar, qrcode.react

## Preduslovi

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (LTS, 20+) i npm
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (za SQL Server kontejner)
- [Microsoft Service Fabric SDK + runtime](https://learn.microsoft.com/azure/service-fabric/service-fabric-get-started) —
  uključuje lokalni klaster (Windows)

## Pokretanje lokalno

Redosled je bitan — svaki naredni korak zavisi od prethodnog.

### 1. SQL Server

```
docker compose -f docker/docker-compose.yml up -d
```

Podiže SQL Server 2022 kontejner na `localhost:1433` (podrazumevana lozinka je već usklađena sa
connection stringovima u `appsettings.json` fajlovima backend servisa — nije potrebno ništa ručno
podešavati).

### 2. Service Fabric lokalni klaster

Mora biti ručno pokrenut — ne diže se sam pri restartu Windows-a:

- **Service Fabric Local Cluster Manager** (ikonica u system tray-u) → *Start Local Cluster*, ili
- PowerShell **kao Administrator**: `Start-Service FabricHostSvc`

Provera da je klaster gore: [http://localhost:19080](http://localhost:19080) (Service Fabric
Explorer).

### 3. Deploy backend servisa

Potrebno samo prvi put, ili posle izmene backend koda (Service Fabric pamti deployment kroz
gašenje/paljenje klastera — redeploy nije potreban svaki put).

PowerShell **kao Administrator**:

```powershell
cd backend/deploy
.\Deploy-Local.ps1
```

Skripta radi `dotnet publish` za sva tri servisa i deployuje ih na lokalni klaster (nije potreban
Visual Studio/`.sfproj`). Provera da su servisi gore:

```
curl http://localhost:19081/TravelPlannerApp/IdentityService/api/health
```

### 4. Frontend

```powershell
cd frontend
Copy-Item .env.example .env    # podrazumevane vrednosti već odgovaraju SF Reverse Proxy podešavanju
npm install
npm run dev
```

Aplikacija je dostupna na [http://localhost:5173](http://localhost:5173).

### Test nalozi

Test admin nalog za proveru admin panela (kreiran tokom razvoja, postoji u bazi):

- Email: `admin_verify_67644251@example.com`
- Lozinka: `AdminPass123!`

Za obične korisnike — registracija je otvorena na `/register`.

### Ako nešto ne radi

Najčešći uzrok "ne radi ništa" je da Service Fabric lokalni klaster nije pokrenut (korak 2) — prvo
proveriti [http://localhost:19080](http://localhost:19080) pre traženja bug-a u kodu.

## Struktura repozitorijuma

```
backend/
  src/
    Identity.Service/       # registracija, login, JWT, uloge
    TripPlanning.Service/   # planovi, destinacije, aktivnosti, budžet, checklista
    Sharing.Service/        # share-tokeni (Reliable Dictionary)
    Shared/                 # zajednička JWT infrastruktura
  deploy/                   # Deploy-Local.ps1 i pomoćne skripte
  ApplicationPackageRoot/   # Service Fabric application/service manifesti
docker/
  docker-compose.yml        # SQL Server kontejner
frontend/
  src/
    pages/, components/     # UI stranice i komponente
    services/                # HTTP klijenti (jedini sloj koji zove backend)
    models/                  # TypeScript modeli/DTO oblici
    context/                 # AuthContext (globalno auth stanje)
    styles/                  # dizajn sistem (tokens/base/layout/components/pages)
docs/
  architecture.md            # detaljna arhitektura i fazni plan
  use-case-diagram.svg
  napomene-checklist.md      # provera tehničkih zahteva iz specifikacije
```

## Razvoj

```
cd frontend
npm run build   # tsc -b && vite build
npm run lint    # oxlint
```
