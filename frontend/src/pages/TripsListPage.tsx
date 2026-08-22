import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useConfirm } from "../components/common/ConfirmProvider";
import { Alert, EmptyState } from "../components/common/Feedback";
import {
  CalendarIcon,
  ClockIcon,
  MapIcon,
  PlaneIcon,
  PlusIcon,
  TrashIcon,
  WalletIcon,
} from "../components/common/Icons";
import TripForm from "../components/trips/TripForm";
import type { Trip } from "../models/Trip";
import type { TripInput } from "../models/TripInput";
import * as tripService from "../services/tripService";
import { extractErrorMessage } from "../utils/apiError";
import { daysBetween, formatCurrency, formatDateRange } from "../utils/format";

type TripStatus = { label: string; tone: "success" | "info" | "neutral" };

function statusOf(trip: Trip): TripStatus {
  const today = new Date().toISOString().slice(0, 10);
  if (trip.endDate < today) return { label: "Završeno", tone: "neutral" };
  if (trip.startDate <= today) return { label: "U toku", tone: "success" };
  return { label: "Predstoji", tone: "info" };
}

export default function TripsListPage() {
  const confirm = useConfirm();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await tripService.getTrips();
      setTrips(data);
    } catch (error) {
      setLoadError(extractErrorMessage(error, "Planovi putovanja nisu učitani."));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(input: TripInput) {
    await tripService.createTrip(input);
    setIsCreating(false);
    await loadTrips();
  }

  async function handleDelete(trip: Trip) {
    const confirmed = await confirm({
      title: "Obrisati plan putovanja?",
      message: `Plan „${trip.name}” i svi njegovi podaci (destinacije, aktivnosti, troškovi, checklist) biće trajno obrisani.`,
      confirmLabel: "Obriši plan",
    });
    if (!confirmed) return;
    await tripService.deleteTrip(trip.id);
    await loadTrips();
  }

  const upcoming = trips.filter((t) => statusOf(t).label !== "Završeno").length;
  const totalBudget = trips.reduce((sum, t) => sum + t.budget, 0);

  return (
    <>
      <div className="page-header">
        <div className="page-header__text">
          <span className="page-header__eyebrow">
            <MapIcon /> Moja putovanja
          </span>
          <h1>Planovi putovanja</h1>
          <p className="page-header__subtitle">
            Organizuj destinacije, dnevne aktivnosti, budžet i listu za pakovanje — sve na jednom mestu.
          </p>
        </div>

        {!isCreating && (
          <div className="page-header__actions">
            <button type="button" className="btn btn-primary" onClick={() => setIsCreating(true)}>
              <PlusIcon />
              Novi plan
            </button>
          </div>
        )}
      </div>

      <div className="stack">
        {trips.length > 0 && (
          <div className="grid grid-stats">
            <div className="stat">
              <p className="stat__label">Ukupno planova</p>
              <p className="stat__value">{trips.length}</p>
            </div>
            <div className="stat stat--accent">
              <p className="stat__label">Aktuelna / predstojeća</p>
              <p className="stat__value">{upcoming}</p>
            </div>
            <div className="stat">
              <p className="stat__label">Zbirni budžet</p>
              <p className="stat__value">{formatCurrency(totalBudget)}</p>
            </div>
          </div>
        )}

        {isCreating && (
          <section className="panel">
            <header className="panel__header">
              <div className="panel__title">
                <span className="panel__icon">
                  <PlaneIcon />
                </span>
                <div>
                  <h2>Novi plan putovanja</h2>
                  <p className="panel__subtitle">Osnovni podaci — detalje dodaješ kasnije.</p>
                </div>
              </div>
            </header>
            <div className="panel__body">
              <TripForm submitLabel="Kreiraj plan" onSubmit={handleCreate} onCancel={() => setIsCreating(false)} />
            </div>
          </section>
        )}

        {isLoading && (
          <div className="grid grid-cards">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        )}

        {loadError && <Alert>{loadError}</Alert>}

        {!isLoading && !loadError && trips.length === 0 && !isCreating && (
          <EmptyState
            icon={<PlaneIcon />}
            title="Još nemaš nijedan plan putovanja"
            text="Napravi prvi plan i počni da dodaješ destinacije, aktivnosti i troškove."
            action={
              <button type="button" className="btn btn-primary" onClick={() => setIsCreating(true)}>
                <PlusIcon />
                Napravi prvi plan
              </button>
            }
          />
        )}

        {!isLoading && !loadError && trips.length > 0 && (
          <div className="grid grid-cards">
            {trips.map((trip) => {
              const status = statusOf(trip);
              return (
                <article key={trip.id} className="card card-hover trip-card">
                  <div className="trip-card__banner">
                    <span className="trip-card__banner-icon">
                      <PlaneIcon />
                    </span>
                  </div>

                  <div className="trip-card__body">
                    <div className="row-between">
                      <Link to={`/trips/${trip.id}`} className="trip-card__title">
                        {trip.name}
                      </Link>
                      <span className={`badge badge-${status.tone} badge-dot`}>{status.label}</span>
                    </div>

                    {trip.description && <p className="trip-card__desc">{trip.description}</p>}

                    <div className="trip-card__meta">
                      <span>
                        <CalendarIcon />
                        {formatDateRange(trip.startDate, trip.endDate)}
                      </span>
                      <span>
                        <ClockIcon />
                        {daysBetween(trip.startDate, trip.endDate)} dana
                      </span>
                      <span>
                        <WalletIcon />
                        {formatCurrency(trip.budget)}
                      </span>
                    </div>

                    <div className="trip-card__footer">
                      <Link to={`/trips/${trip.id}`} className="btn btn-secondary btn-sm">
                        Otvori plan
                      </Link>
                      <button
                        type="button"
                        className="btn btn-danger-soft btn-sm"
                        aria-label={`Obriši plan ${trip.name}`}
                        onClick={() => handleDelete(trip)}
                      >
                        <TrashIcon />
                        Obriši
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
