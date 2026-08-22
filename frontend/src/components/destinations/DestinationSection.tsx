import { useEffect, useState } from "react";
import type { Destination } from "../../models/Destination";
import type { DestinationInput } from "../../models/DestinationInput";
import * as destinationService from "../../services/destinationService";
import { extractErrorMessage } from "../../utils/apiError";
import { formatDateRange } from "../../utils/format";
import { useConfirm } from "../common/ConfirmProvider";
import { Alert, EmptyState, Loading } from "../common/Feedback";
import { CalendarIcon, MapPinIcon, PencilIcon, PlusIcon, TrashIcon } from "../common/Icons";
import Panel from "../common/Panel";
import DestinationForm from "./DestinationForm";

interface DestinationSectionProps {
  tripId: string;
  shareToken?: string;
  readOnly?: boolean;
}

export default function DestinationSection({ tripId, shareToken, readOnly = false }: DestinationSectionProps) {
  const confirm = useConfirm();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadDestinations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  async function loadDestinations() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await destinationService.getDestinations(tripId, shareToken);
      setDestinations(data);
    } catch (error) {
      setLoadError(extractErrorMessage(error, "Destinacije nisu učitane."));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(input: DestinationInput) {
    await destinationService.createDestination(tripId, input, shareToken);
    setIsCreating(false);
    await loadDestinations();
  }

  async function handleUpdate(destinationId: string, input: DestinationInput) {
    await destinationService.updateDestination(tripId, destinationId, input, shareToken);
    setEditingId(null);
    await loadDestinations();
  }

  async function handleDelete(destination: Destination) {
    const confirmed = await confirm({
      title: "Obrisati destinaciju?",
      message: `Destinacija „${destination.name}” biće uklonjena iz plana.`,
      confirmLabel: "Obriši",
    });
    if (!confirmed) return;
    await destinationService.deleteDestination(tripId, destination.id, shareToken);
    await loadDestinations();
  }

  return (
    <Panel
      icon={<MapPinIcon />}
      title="Destinacije"
      subtitle={destinations.length > 0 ? `${destinations.length} u planu` : "Mesta koja obilaziš"}
      actions={
        !readOnly &&
        !isCreating && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsCreating(true)}>
            <PlusIcon />
            Dodaj destinaciju
          </button>
        )
      }
    >
      {!readOnly && isCreating && (
        <div className="card card-pad">
          <DestinationForm submitLabel="Dodaj" onSubmit={handleCreate} onCancel={() => setIsCreating(false)} />
        </div>
      )}

      {isLoading && <Loading />}
      {loadError && <Alert>{loadError}</Alert>}

      {!isLoading && !loadError && destinations.length === 0 && !isCreating && (
        <EmptyState
          icon={<MapPinIcon />}
          title="Nema unetih destinacija"
          text={readOnly ? "Vlasnik plana još nije dodao destinacije." : "Dodaj mesta koja planiraš da posetiš."}
        />
      )}

      {destinations.length > 0 && (
        <ul className="item-list">
          {destinations.map((destination) =>
            !readOnly && editingId === destination.id ? (
              <li key={destination.id} className="card card-pad">
                <DestinationForm
                  initialValues={destination}
                  submitLabel="Sačuvaj"
                  onSubmit={(input) => handleUpdate(destination.id, input)}
                  onCancel={() => setEditingId(null)}
                />
              </li>
            ) : (
              <li key={destination.id} className="item">
                <div className="item__main">
                  <div className="item__title">
                    {destination.name}
                    <span className="badge badge-neutral">{destination.location}</span>
                  </div>
                  <div className="item__meta">
                    <span>
                      <CalendarIcon />
                      {formatDateRange(destination.arrivalDate, destination.departureDate)}
                    </span>
                  </div>
                  {destination.description && <p className="item__desc">{destination.description}</p>}
                </div>

                {!readOnly && (
                  <div className="item__actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      aria-label={`Izmeni destinaciju ${destination.name}`}
                      onClick={() => setEditingId(destination.id)}
                    >
                      <PencilIcon />
                      Izmeni
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger-soft btn-sm"
                      aria-label={`Obriši destinaciju ${destination.name}`}
                      onClick={() => handleDelete(destination)}
                    >
                      <TrashIcon />
                      Obriši
                    </button>
                  </div>
                )}
              </li>
            ),
          )}
        </ul>
      )}
    </Panel>
  );
}
