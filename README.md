# Travel Planner

Web aplikacija za planiranje putovanja — predmetni projekat iz predmeta "Primena veb
programiranja u infrastrukturnim sistemima". Omogućava kreiranje planova putovanja, upravljanje
destinacijama i aktivnostima (kalendar, mapa sa rutom), praćenje budžeta i troškova, checklistu za
pakovanje i deljenje plana putem linka/QR koda. Backend je mikroservisna arhitektura na Microsoft
Service Fabric-u (Identity, TripPlanning, Sharing) sa SQL Server bazom; frontend je u React-u.



## Pokretanje

### 1. SQL Server

```
docker compose -f docker/docker-compose.yml up -d
```

### 2. Service Fabric lokalni klaster

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
