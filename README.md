# Travel Planner

Web aplikacija za planiranje putovanja — predmetni projekat iz predmeta "Primena veb
programiranja u infrastrukturnim sistemima". Omogućava kreiranje planova putovanja, upravljanje
destinacijama i aktivnostima (kalendar, mapa sa rutom), praćenje budžeta i troškova, checklistu za
pakovanje i deljenje plana putem linka/QR koda. Backend je mikroservisna arhitektura na Microsoft
Service Fabric-u (Identity, TripPlanning, Sharing) sa SQL Server bazom; frontend je u React-u.

## Preduslovi

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (LTS) i npm
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Microsoft Service Fabric SDK](https://learn.microsoft.com/azure/service-fabric/service-fabric-get-started) (uključuje lokalni klaster, Windows)

## Pokretanje

### 1. SQL Server

```
docker compose -f docker/docker-compose.yml up -d
```

### 2. Service Fabric lokalni klaster

Mora se ručno pokrenuti (ne diže se sam pri restartu Windows-a): **Service Fabric Local Cluster
Manager** (ikonica u tray-u) → *Start Local Cluster*, ili u PowerShell-u kao Administrator:

```
Start-Service FabricHostSvc
```

Provera: [http://localhost:19080](http://localhost:19080)

### 3. Backend

Potrebno samo prvi put, ili posle izmene backend koda. PowerShell kao Administrator:

```
cd backend/deploy
.\Deploy-Local.ps1
```

Provera: `curl http://localhost:19081/TravelPlannerApp/IdentityService/api/health`

### 4. Frontend

```
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Aplikacija je dostupna na [http://localhost:5173](http://localhost:5173).

Ako nešto ne radi, prvo proveri da li je Service Fabric klaster pokrenut (korak 2) — to je
najčešći uzrok.
