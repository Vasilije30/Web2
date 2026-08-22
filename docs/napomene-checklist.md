# Provera "Napomena" iz specifikacije

Ovaj dokument eksplicitno potvrđuje da su tehnički zahtevi ("napomene") iz specifikacije predmeta
ispoštovani u implementaciji, sa referencama na konkretan kod. Sve stavke su bile ispoštovane već
tokom razvoja (Faze 2–11) — ovo je verifikacija/dokumentacija za Fazu 12, ne dodatna izmena koda.

## 1. REST konvencije

Svaki resurs ima sopstveni kontroler sa `[Route("api/<resurs>")]` i standardnim HTTP glagolima
(`GET` kolekcija/pojedinačno, `POST` kreiranje, `PUT` izmena, `DELETE` brisanje), guid rute
tipizirane (`{id:guid}`):

- [TripsController.cs](../backend/src/TripPlanning.Service/Controllers/TripsController.cs) —
  `api/trips`
- [DestinationsController.cs](../backend/src/TripPlanning.Service/Controllers/DestinationsController.cs),
  [ActivitiesController.cs](../backend/src/TripPlanning.Service/Controllers/ActivitiesController.cs),
  [ExpensesController.cs](../backend/src/TripPlanning.Service/Controllers/ExpensesController.cs),
  [BudgetController.cs](../backend/src/TripPlanning.Service/Controllers/BudgetController.cs),
  [ChecklistItemsController.cs](../backend/src/TripPlanning.Service/Controllers/ChecklistItemsController.cs)
- [AuthController.cs](../backend/src/Identity.Service/Controllers/AuthController.cs),
  [AdminUsersController.cs](../backend/src/Identity.Service/Controllers/AdminUsersController.cs)
- [SharesController.cs](../backend/src/Sharing.Service/Controllers/SharesController.cs)

Odgovarajući HTTP status kodovi (200/201/204/400/401/403/404) se koriste dosledno preko
`ActionResult<T>` (`Ok`, `CreatedAtAction`, `NoContent`, `NotFound`, `BadRequest`, `Forbid`).

## 2. DTO / model separacija

EF Core entiteti (`Models/`) se nikad ne serijalizuju direktno — svaki servis ima poseban
`Dtos/` folder sa Request/Response tipovima i ručnim mapiranjem (`ToDto()` / `ApplyTo()` extension
metodama), bez AutoMapper zavisnosti:

- `backend/src/Identity.Service/Dtos/`
- `backend/src/TripPlanning.Service/Dtos/`
- `backend/src/Sharing.Service/Dtos/`

Frontend ima paralelnu podelu: `src/models/` (TS interfejsi za domenske entitete) odvojeno od
`*Input` modela (npr. `TripInput.ts`, `ActivityInput.ts`) koji odgovaraju request DTO oblicima.

## 3. `.env` disciplina

- `frontend/.env.example` postoji i sadrži samo placeholder/lokalne URL-ove (bez tajni), stvarni
  `.env`/`.env.local` su u [.gitignore](../.gitignore) (`!.env.example` izuzetak eksplicitno
  zadržava primer u repou).
- Svi HTTP pozivi ka backend servisima idu isključivo kroz `src/services/*.ts` module koji čitaju
  base URL-ove iz `import.meta.env.VITE_*` — nijedna komponenta ne poziva `fetch`/`axios` direktno
  ([apiClients.ts](../frontend/src/services/apiClients.ts)).
- Backend ne koristi `.env` (ASP.NET Core konvencija) već `appsettings.json` /
  `appsettings.Development.json` po servisu — connection string i JWT signing key su odvojeni po
  okruženju kroz standardni ASP.NET Core configuration provider lanac.

## 4. Heširane lozinke

Lozinke se nikad ne čuvaju u plain tekstu — koristi se ugrađeni ASP.NET Core
`PasswordHasher<User>` (PBKDF2, salted, industrijski standard) u
[AuthService.cs](../backend/src/Identity.Service/Services/AuthService.cs), i za hash pri
registraciji i za verifikaciju pri loginu. `User` model čuva samo `PasswordHash`, nikad plain
lozinku.

## 5. JWT validacija

Zajednička JWT infrastruktura je izdvojena u
[Shared/Security/JwtAuthenticationExtensions.cs](../backend/src/Shared/Security/JwtAuthenticationExtensions.cs)
i registrovana u sva tri servisa (`AddAuthentication().AddJwtBearer(...)`), tako da
TripPlanning.Service i Sharing.Service nezavisno validiraju token izdat od Identity.Service preko
istog deljenog simetričnog ključa (`Jwt:Secret` u `appsettings.json`) — bez međuservisnog poziva za
svaku validaciju. Role-based autorizacija (`[Authorize(Roles = "Admin")]`) se koristi na admin
endpointima ([AdminUsersController.cs](../backend/src/Identity.Service/Controllers/AdminUsersController.cs),
[AdminTripsController.cs](../backend/src/TripPlanning.Service/Controllers/AdminTripsController.cs)).

## 6. Validacione granice

Data Annotations na DTO nivou (`[Required]`, `[Range]`, `[EmailAddress]`, `[MinLength]`/`[MaxLength]`)
+ `ModelState.IsValid` provera (automatska preko `[ApiController]`), primeri:

- `[Range(0, double.MaxValue)]` na `Budget`, `EstimatedCost`, `Amount` (ne mogu biti negativni) —
  [TripRequest.cs](../backend/src/TripPlanning.Service/Dtos/TripRequest.cs),
  [ActivityRequest.cs](../backend/src/TripPlanning.Service/Dtos/ActivityRequest.cs),
  [ExpenseRequest.cs](../backend/src/TripPlanning.Service/Dtos/ExpenseRequest.cs)
- `[Range(-90, 90)]` / `[Range(-180, 180)]` za geografske koordinate aktivnosti.
- Dodatna poslovna validacija koja se ne može izraziti kroz proste atribute ide preko
  `IValidatableObject` na samom DTO-u (npr. `EndDate >= StartDate` u
  [TripRequest.cs](../backend/src/TripPlanning.Service/Dtos/TripRequest.cs)).
- Frontend dupliran sloj validacije: React Hook Form + Zod šeme, tako da se greška vidi pre slanja
  zahteva (backend ostaje izvor istine).

## 7. Cascade delete

`TripPlanningDbContext`
([TripPlanningDbContext.cs](../backend/src/TripPlanning.Service/Data/TripPlanningDbContext.cs)):
Destination, Expense i ChecklistItem imaju `OnDelete(DeleteBehavior.Cascade)` u odnosu na Trip —
brisanje plana putovanja briše sve povezane podatke. Izuzetak je `Activity → Destination`
(`DeleteBehavior.NoAction`), jer bi SQL Server prijavio grešku "multiple cascade paths" (Activity
je već u cascade lancu preko Trip-a); umesto toga, brisanje destinacije eksplicitno nulifikuje
`DestinationId` na povezanim aktivnostima pre brisanja (`ExecuteUpdateAsync`), a same aktivnosti i
dalje nestaju kad se obriše ceo Trip. Sharing.Service dodatno čisti share-linkove za obrisan plan
preko cross-service poziva (`DELETE /internal/trips/{id}/shares`), pošto živi u posebnoj
(Reliable Dictionary) storage.

## 8. Enum serijalizacija (dodatna, projektno-specifična zamka)

Nije formalna "napomena" iz specifikacije, ali dokumentovano ovde jer je ponavljajući izvor bugova:
`JsonStringEnumConverter` je registrovan u sva tri servisa (`IdentityServiceHost.cs`,
`TripPlanningServiceHost.cs`, `SharingServiceHost.cs`), tako da se enum-i (npr.
`Activity.Status`, `User.Role`, `ShareLink.AccessType`) serijalizuju kao čitljivi stringovi, a ne
brojevi — konzistentno između sva tri servisa i frontenda.
