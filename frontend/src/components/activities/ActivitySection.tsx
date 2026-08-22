import { useEffect, useState } from "react";
import type { Activity } from "../../models/Activity";
import type { ActivityInput } from "../../models/ActivityInput";
import type { Destination } from "../../models/Destination";
import * as activityService from "../../services/activityService";
import * as destinationService from "../../services/destinationService";
import { extractErrorMessage } from "../../utils/apiError";
import { formatCurrency, formatDate, formatTime } from "../../utils/format";
import { activityStatusBadges, activityStatusLabels, type ActivityStatusKey } from "../../utils/labels";
import { useConfirm } from "../common/ConfirmProvider";
import { Alert, EmptyState, Loading } from "../common/Feedback";
import { CalendarIcon, ClockIcon, MapPinIcon, PencilIcon, PlusIcon, TrashIcon } from "../common/Icons";
import Panel from "../common/Panel";
import ActivityCalendar from "./ActivityCalendar";
import ActivityForm from "./ActivityForm";

interface ActivitySectionProps {
  tripId: string;
  shareToken?: string;
  readOnly?: boolean;
  /** Called after any successful create/update/delete, so sibling sections (e.g. the map) can re-fetch. */
  onActivitiesChanged?: () => void;
}

export default function ActivitySection({
  tripId,
  shareToken,
  readOnly = false,
  onActivitiesChanged,
}: ActivitySectionProps) {
  const confirm = useConfirm();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "calendar">("calendar");

  useEffect(() => {
    loadActivities();
    loadDestinations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  async function loadActivities() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await activityService.getActivities(tripId, shareToken);
      setActivities(data);
    } catch (error) {
      setLoadError(extractErrorMessage(error, "Aktivnosti nisu učitane."));
    } finally {
      setIsLoading(false);
    }
  }

  // Destinations can change from the sibling DestinationSection at any time, so re-fetch them
  // whenever the activity form is about to open rather than trusting a stale mount-time snapshot.
  async function loadDestinations() {
    try {
      const data = await destinationService.getDestinations(tripId, shareToken);
      setDestinations(data);
    } catch {
      // Non-fatal: the form still works, just without the destination dropdown populated.
    }
  }

  function openCreateForm() {
    loadDestinations();
    setIsCreating(true);
  }

  function openEditForm(activityId: string) {
    loadDestinations();
    setEditingId(activityId);
  }

  async function handleCreate(input: ActivityInput) {
    await activityService.createActivity(tripId, input, shareToken);
    setIsCreating(false);
    await loadActivities();
    onActivitiesChanged?.();
  }

  async function handleUpdate(activityId: string, input: ActivityInput) {
    await activityService.updateActivity(tripId, activityId, input, shareToken);
    setEditingId(null);
    await loadActivities();
    onActivitiesChanged?.();
  }

  async function handleDelete(activity: Activity) {
    const confirmed = await confirm({
      title: "Obrisati aktivnost?",
      message: `Aktivnost „${activity.name}” biće uklonjena iz itinerara.`,
      confirmLabel: "Obriši",
    });
    if (!confirmed) return;
    await activityService.deleteActivity(tripId, activity.id, shareToken);
    await loadActivities();
    onActivitiesChanged?.();
  }

  const editingActivity = !readOnly ? (activities.find((a) => a.id === editingId) ?? null) : null;
  const isFormOpen = isCreating || !!editingActivity;

  return (
    <Panel
      icon={<CalendarIcon />}
      title="Aktivnosti"
      subtitle={activities.length > 0 ? `${activities.length} u itineraru` : "Dnevni raspored putovanja"}
      actions={
        !isFormOpen && (
          <>
            <div className="segmented" role="group" aria-label="Prikaz aktivnosti">
              <button
                type="button"
                className={view === "calendar" ? "is-active" : ""}
                aria-pressed={view === "calendar"}
                onClick={() => setView("calendar")}
              >
                Kalendar
              </button>
              <button
                type="button"
                className={view === "list" ? "is-active" : ""}
                aria-pressed={view === "list"}
                onClick={() => setView("list")}
              >
                Lista
              </button>
            </div>

            {!readOnly && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={openCreateForm}>
                <PlusIcon />
                Dodaj aktivnost
              </button>
            )}
          </>
        )
      }
    >
      {!readOnly && isCreating && (
        <div className="card card-pad">
          <ActivityForm
            destinations={destinations}
            submitLabel="Dodaj"
            onSubmit={handleCreate}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}

      {editingActivity && (
        <div className="card card-pad">
          <ActivityForm
            destinations={destinations}
            initialValues={editingActivity}
            submitLabel="Sačuvaj"
            onSubmit={(input) => handleUpdate(editingActivity.id, input)}
            onCancel={() => setEditingId(null)}
          />
        </div>
      )}

      {isLoading && <Loading />}
      {loadError && <Alert>{loadError}</Alert>}

      {!isLoading && !loadError && activities.length === 0 && !isFormOpen && (
        <EmptyState
          icon={<CalendarIcon />}
          title="Nema unetih aktivnosti"
          text={
            readOnly
              ? "Vlasnik plana još nije dodao aktivnosti u itinerar."
              : "Dodaj prvu aktivnost i ona će se pojaviti u kalendaru i na mapi."
          }
        />
      )}

      {!isLoading && !loadError && activities.length > 0 && view === "calendar" && (
        <ActivityCalendar
          activities={activities}
          onSelectActivity={(a) => (readOnly ? undefined : openEditForm(a.id))}
        />
      )}

      {!isLoading && !loadError && activities.length > 0 && view === "list" && (
        <ul className="item-list">
          {activities.map((activity) => {
            const status = activity.status as ActivityStatusKey;
            return (
              <li key={activity.id} className="item">
                <div className="item__main">
                  <div className="item__title">
                    {activity.name}
                    <span className={`badge ${activityStatusBadges[status]}`}>{activityStatusLabels[status]}</span>
                  </div>

                  <div className="item__meta">
                    <span>
                      <CalendarIcon />
                      {formatDate(activity.date)}
                    </span>
                    <span>
                      <ClockIcon />
                      {formatTime(activity.time)}
                    </span>
                    {activity.location && (
                      <span>
                        <MapPinIcon />
                        {activity.location}
                      </span>
                    )}
                    {activity.estimatedCost > 0 && <span>≈ {formatCurrency(activity.estimatedCost)}</span>}
                  </div>

                  {activity.description && <p className="item__desc">{activity.description}</p>}
                </div>

                {!readOnly && (
                  <div className="item__actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      aria-label={`Izmeni aktivnost ${activity.name}`}
                      onClick={() => openEditForm(activity.id)}
                    >
                      <PencilIcon />
                      Izmeni
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger-soft btn-sm"
                      aria-label={`Obriši aktivnost ${activity.name}`}
                      onClick={() => handleDelete(activity)}
                    >
                      <TrashIcon />
                      Obriši
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
