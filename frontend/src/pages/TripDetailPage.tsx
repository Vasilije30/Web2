import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ActivitySection from "../components/activities/ActivitySection";
import ChecklistSection from "../components/checklist/ChecklistSection";
import { useConfirm } from "../components/common/ConfirmProvider";
import { Alert, Loading } from "../components/common/Feedback";
import {
  CalendarIcon,
  ClockIcon,
  DownloadIcon,
  PencilIcon,
  PlaneIcon,
  TrashIcon,
  WalletIcon,
} from "../components/common/Icons";
import DestinationSection from "../components/destinations/DestinationSection";
import ExpenseSection from "../components/expenses/ExpenseSection";
import MapSection from "../components/map/MapSection";
import ShareSection from "../components/sharing/ShareSection";
import TripForm from "../components/trips/TripForm";
import type { Trip } from "../models/Trip";
import type { TripInput } from "../models/TripInput";
import * as activityService from "../services/activityService";
import * as checklistService from "../services/checklistService";
import * as destinationService from "../services/destinationService";
import * as expenseService from "../services/expenseService";
import * as tripService from "../services/tripService";
import { extractErrorMessage } from "../utils/apiError";
import { daysBetween, formatCurrency, formatDateRange } from "../utils/format";
import { downloadTripReportPdf } from "../utils/pdfReport";

export default function TripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activitiesVersion, setActivitiesVersion] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    if (tripId) loadTrip(tripId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  async function loadTrip(id: string) {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await tripService.getTrip(id);
      setTrip(data);
    } catch (error) {
      setLoadError(extractErrorMessage(error, "Plan putovanja nije učitan."));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdate(input: TripInput) {
    if (!tripId) return;
    const updated = await tripService.updateTrip(tripId, input);
    setTrip(updated);
    setIsEditing(false);
  }

  async function handleDelete() {
    if (!tripId || !trip) return;
    const confirmed = await confirm({
      title: "Obrisati plan putovanja?",
      message: `Plan „${trip.name}” i svi njegovi podaci (destinacije, aktivnosti, troškovi, checklist, linkovi za deljenje) biće trajno obrisani.`,
      confirmLabel: "Obriši plan",
    });
    if (!confirmed) return;
    await tripService.deleteTrip(tripId);
    navigate("/");
  }

  async function handleDownloadPdf() {
    if (!tripId || !trip) return;
    setIsExporting(true);
    setExportError(null);
    try {
      const [destinations, activities, expenses, budgetSummary, checklistItems] = await Promise.all([
        destinationService.getDestinations(tripId),
        activityService.getActivities(tripId),
        expenseService.getExpenses(tripId),
        expenseService.getBudgetSummary(tripId),
        checklistService.getChecklistItems(tripId),
      ]);
      downloadTripReportPdf({ trip, destinations, activities, expenses, budgetSummary, checklistItems });
    } catch (error) {
      setExportError(extractErrorMessage(error, "PDF izveštaj nije mogao biti generisan."));
    } finally {
      setIsExporting(false);
    }
  }

  if (isLoading) return <Loading label="Učitavanje plana..." />;
  if (loadError) return <Alert>{loadError}</Alert>;
  if (!trip || !tripId) {
    return (
      <Alert tone="warning">
        Plan nije pronađen. <Link to="/">Nazad na listu planova</Link>
      </Alert>
    );
  }

  return (
    <div className="stack">
      {isEditing ? (
        <section className="panel">
          <header className="panel__header">
            <div className="panel__title">
              <span className="panel__icon">
                <PencilIcon />
              </span>
              <div>
                <h2>Izmena plana</h2>
                <p className="panel__subtitle">Ažuriraj osnovne podatke o putovanju.</p>
              </div>
            </div>
          </header>
          <div className="panel__body">
            <TripForm
              initialValues={{
                name: trip.name,
                description: trip.description,
                startDate: trip.startDate,
                endDate: trip.endDate,
                budget: trip.budget,
                notes: trip.notes,
              }}
              submitLabel="Sačuvaj izmene"
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        </section>
      ) : (
        <header className="trip-hero">
          <span className="badge badge-neutral" style={{ background: "rgb(255 255 255 / 0.16)", color: "#fff", borderColor: "rgb(255 255 255 / 0.24)" }}>
            <PlaneIcon />
            Plan putovanja
          </span>

          <h1 style={{ marginTop: "var(--space-3)" }}>{trip.name}</h1>

          {trip.description && <p className="trip-hero__desc">{trip.description}</p>}

          <div className="trip-hero__meta">
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
              Budžet {formatCurrency(trip.budget)}
            </span>
          </div>

          {trip.notes && (
            <p className="trip-hero__notes">
              <strong>Napomene:</strong> {trip.notes}
            </p>
          )}

          <div className="trip-hero__actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(true)}>
              <PencilIcon />
              Izmeni plan
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleDownloadPdf} disabled={isExporting}>
              {isExporting ? <span className="spinner spinner-sm" /> : <DownloadIcon />}
              {isExporting ? "Generisanje..." : "Preuzmi PDF izveštaj"}
            </button>
            <button type="button" className="btn btn-danger-soft" onClick={handleDelete}>
              <TrashIcon />
              Obriši plan
            </button>
          </div>

          {exportError && (
            <p className="trip-hero__notes" role="alert">
              {exportError}
            </p>
          )}
        </header>
      )}

      <DestinationSection tripId={tripId} />
      <ActivitySection tripId={tripId} onActivitiesChanged={() => setActivitiesVersion((v) => v + 1)} />
      <MapSection tripId={tripId} refreshKey={activitiesVersion} />
      <ExpenseSection tripId={tripId} />
      <ChecklistSection tripId={tripId} />
      <ShareSection tripId={tripId} />
    </div>
  );
}
