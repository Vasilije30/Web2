import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ActivitySection from "../components/activities/ActivitySection";
import ChecklistSection from "../components/checklist/ChecklistSection";
import { Alert, Loading } from "../components/common/Feedback";
import { CalendarIcon, ClockIcon, DownloadIcon, EyeIcon, PencilIcon, WalletIcon } from "../components/common/Icons";
import DestinationSection from "../components/destinations/DestinationSection";
import ExpenseSection from "../components/expenses/ExpenseSection";
import MapSection from "../components/map/MapSection";
import type { ShareAccessType } from "../models/ShareLink";
import type { Trip } from "../models/Trip";
import * as activityService from "../services/activityService";
import * as checklistService from "../services/checklistService";
import * as destinationService from "../services/destinationService";
import * as expenseService from "../services/expenseService";
import * as sharingService from "../services/sharingService";
import * as tripService from "../services/tripService";
import { extractErrorMessage } from "../utils/apiError";
import { daysBetween, formatCurrency, formatDateRange } from "../utils/format";
import { downloadTripReportPdf } from "../utils/pdfReport";

export default function SharedTripPage() {
  const { token } = useParams<{ token: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [accessType, setAccessType] = useState<ShareAccessType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activitiesVersion, setActivitiesVersion] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    if (token) loadSharedTrip(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function loadSharedTrip(shareToken: string) {
    setIsLoading(true);
    setError(null);
    try {
      const validation = await sharingService.validateShareToken(shareToken);
      if (!validation.valid || !validation.tripId || !validation.accessType) {
        setError("Ovaj link za deljenje nije validan, opozvan je, ili je istekao.");
        return;
      }
      setAccessType(validation.accessType);
      const tripData = await tripService.getTrip(validation.tripId, shareToken);
      setTrip(tripData);
    } catch (err) {
      setError(extractErrorMessage(err, "Plan putovanja nije mogao biti učitan."));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDownloadPdf() {
    if (!trip || !token) return;
    setIsExporting(true);
    setExportError(null);
    try {
      const [destinations, activities, expenses, budgetSummary, checklistItems] = await Promise.all([
        destinationService.getDestinations(trip.id, token),
        activityService.getActivities(trip.id, token),
        expenseService.getExpenses(trip.id, token),
        expenseService.getBudgetSummary(trip.id, token),
        checklistService.getChecklistItems(trip.id, token),
      ]);
      downloadTripReportPdf({ trip, destinations, activities, expenses, budgetSummary, checklistItems });
    } catch (err) {
      setExportError(extractErrorMessage(err, "PDF izveštaj nije mogao biti generisan."));
    } finally {
      setIsExporting(false);
    }
  }

  if (isLoading) return <Loading label="Učitavanje deljenog plana..." />;
  if (error) return <Alert>{error}</Alert>;
  if (!trip || !token || !accessType) return <Alert tone="warning">Plan nije pronađen.</Alert>;

  const readOnly = accessType === "View";

  return (
    <div className="stack">
      <div className="share-banner">
        {readOnly ? <EyeIcon /> : <PencilIcon />}
        <div>
          <strong>{readOnly ? "Pristup: samo pregled" : "Pristup: pregled i izmena"}</strong>
          <span>
            Gledaš plan podeljen putem linka — nalog nije potreban.
            {readOnly ? " Izmene nisu dozvoljene." : " Izmene koje napraviš vide se vlasniku plana."}
          </span>
        </div>
      </div>

      <header className="trip-hero">
        <h1>{trip.name}</h1>

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
          <button type="button" className="btn btn-secondary" onClick={handleDownloadPdf} disabled={isExporting}>
            {isExporting ? <span className="spinner spinner-sm" /> : <DownloadIcon />}
            {isExporting ? "Generisanje..." : "Preuzmi PDF izveštaj"}
          </button>
        </div>

        {exportError && (
          <p className="trip-hero__notes" role="alert">
            {exportError}
          </p>
        )}
      </header>

      <DestinationSection tripId={trip.id} shareToken={token} readOnly={readOnly} />
      <ActivitySection
        tripId={trip.id}
        shareToken={token}
        readOnly={readOnly}
        onActivitiesChanged={() => setActivitiesVersion((v) => v + 1)}
      />
      <MapSection tripId={trip.id} shareToken={token} refreshKey={activitiesVersion} />
      <ExpenseSection tripId={trip.id} shareToken={token} readOnly={readOnly} />
      <ChecklistSection tripId={trip.id} shareToken={token} readOnly={readOnly} />
    </div>
  );
}
