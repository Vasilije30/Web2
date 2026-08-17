# Travel Planner

Web aplikacija za planiranje putovanja — predmetni projekat (Primena veb programiranja u
infrastrukturnim sistemima). Arhitektura i fazni plan implementacije: `docs/architecture.md`.

**Status:** Faze 1-4 završene i **end-to-end testirane na pravoj SQL Server bazi** — repo/skeleton,
Identity.Service (register/login/JWT), TripPlanning.Service (Trips, Destinations, Activities,
Checklist, Expenses/Budget — CRUD, cascade delete, validacija). Servisi trenutno rade kao
samostalni ASP.NET Core Web API projekti (bez Service Fabric-a) radi bržeg razvoja; SF hosting sloj
se dodaje u Fazi 5 (Sharing.Service).

## Preduslovi

| Alat | Status na ovoj mašini | Napomena |
|---|---|---|
| .NET 8 SDK | ✅ instaliran | `dotnet --list-sdks` |
| Node.js / npm | ✅ instaliran | |
| Docker Desktop | ✅ instaliran i radi | SQL Server kontejner testiran |
| Service Fabric SDK | ✅ instaliran (runtime + SDK + VS ekstenzija) | lokalni cluster još nije podignut — sledeći korak u Fazi 5 |
| SQL Server | preko Docker-a (docker-compose), testirano | |

### Instalacija Docker Desktop-a (Windows)

1. Preuzmi sa https://www.docker.com/products/docker-desktop/
2. Pokreni installer (zahteva administratorska prava, uključuje WSL2 backend — installer će
   ponuditi da instalira WSL2 ako nedostaje).
3. Restartuj mašinu ako installer to zatraži.
4. Proveri: `docker --version` i `docker compose version` u terminalu.
5. Pokreni bazu: iz `docker/` foldera → `docker compose up -d`.

### Instalacija Service Fabric SDK-a (Windows, za lokalni razvoj)

1. Preuzmi **Microsoft Service Fabric SDK and Tools** installer sa zvanične Microsoft stranice
   (pretraga: "Service Fabric SDK download") — instalira i runtime i alate za Visual Studio.
2. Pokreni installer kao administrator. Instalacija će:
   - postaviti PowerShell execution policy na `RemoteSigned` (potrebno za SF skripte),
   - instalirati Service Fabric runtime kao Windows servise,
   - registrovati SF projektne template-e (ako je Visual Studio 2022 instaliran, sa Azure
     development workload-om).
3. Nakon instalacije, pokreni lokalni **1-node** dev cluster (ne 5-node — previše resursa za
   laptop): u Start meniju potraži "Service Fabric Local Cluster Manager" → "Setup Local Cluster
   (1 Node)".
4. Proveri da cluster radi: otvori http://localhost:19080 (Service Fabric Explorer).
5. Kada je SDK instaliran, javi da nastavimo sa integracijom SF hosting sloja (Faza 5).

## Pokretanje (trenutno stanje — bez Service Fabric-a)

### Backend

Svaki servis se pokreće nezavisno, svaki na svom portu:

```bash
cd backend/src/Identity.Service && dotnet run --urls http://localhost:5101
cd backend/src/TripPlanning.Service && dotnet run --urls http://localhost:5102
cd backend/src/Sharing.Service && dotnet run --urls http://localhost:5103
```

Ili ceo solution odjednom: `dotnet build backend/TravelPlanner.sln`.

Health-check: `GET http://localhost:5101/api/health` (i analogno za druge portove).

### Frontend

```bash
cd frontend
cp .env.example .env   # ako .env ne postoji
npm install
npm run dev
```

Otvara se na http://localhost:5173 — početna stranica prikazuje status sva tri backend servisa.

### Baza podataka

```bash
cd docker
docker compose up -d
```

## Struktura repozitorijuma

```
travel-planner/
  frontend/            React (Vite + TS) aplikacija
  backend/
    src/
      Identity.Service/       auth, korisnici, JWT
      TripPlanning.Service/   putovanja, destinacije, aktivnosti, checklist, budžet/troškovi
      Sharing.Service/        deljenje plana (QR kod, VIEW/EDIT) — stateful servis
      Shared/                 zajednički kod (JWT, DTO tipovi)
  docs/                architecture.md, use case dijagram
  docker/              docker-compose.yml (SQL Server)
```

## Dalje faze

Detaljan fazni plan: `docs/architecture.md`.
