import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { ActivityInput } from "../../models/ActivityInput";
import type { Destination } from "../../models/Destination";
import { extractErrorMessage } from "../../utils/apiError";
import { activityStatuses, activityStatusLabels } from "../../utils/labels";
import { Alert } from "../common/Feedback";

const activitySchema = z.object({
  destinationId: z.string().nullable(),
  name: z.string().min(1, "Naziv je obavezan").max(200),
  date: z.string().min(1, "Datum je obavezan"),
  time: z.string().min(1, "Vreme je obavezno"),
  location: z.string().max(300).default(""),
  latitude: z.coerce.number().nullable(),
  longitude: z.coerce.number().nullable(),
  description: z.string().max(2000).default(""),
  estimatedCost: z.coerce.number().min(0, "Procenjeni trošak ne može biti negativan"),
  status: z.enum(activityStatuses),
});

type ActivityFormInput = z.input<typeof activitySchema>;
type ActivityFormValues = z.output<typeof activitySchema>;

interface ActivityFormProps {
  destinations: Destination[];
  initialValues?: ActivityInput;
  submitLabel: string;
  onSubmit: (input: ActivityInput) => Promise<void>;
  onCancel: () => void;
}

export default function ActivityForm({
  destinations,
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: ActivityFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormInput, unknown, ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: initialValues ?? {
      destinationId: null,
      name: "",
      date: "",
      time: "",
      location: "",
      latitude: null,
      longitude: null,
      description: "",
      estimatedCost: 0,
      status: "Planned",
    },
  });

  async function handleFormSubmit(values: ActivityFormValues) {
    setServerError(null);
    try {
      // <input type="time"> gives "HH:mm" with no seconds, but the backend's TimeOnly JSON
      // parsing expects "HH:mm:ss".
      const time = values.time.length === 5 ? `${values.time}:00` : values.time;
      await onSubmit({ ...values, time, destinationId: values.destinationId || null });
    } catch (error) {
      setServerError(extractErrorMessage(error, "Čuvanje aktivnosti nije uspelo."));
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <div className="form-grid">
        <div className="form-field form-field--wide">
          <label className="form-label" htmlFor="act-name">
            Naziv aktivnosti
          </label>
          <input
            id="act-name"
            className="form-input"
            type="text"
            placeholder="npr. Obilazak Akropolja"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && <p className="form-error" role="alert">{errors.name.message}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="act-date">
            Datum
          </label>
          <input
            id="act-date"
            className="form-input"
            type="date"
            aria-invalid={!!errors.date}
            {...register("date")}
          />
          {errors.date && <p className="form-error" role="alert">{errors.date.message}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="act-time">
            Vreme
          </label>
          <input
            id="act-time"
            className="form-input"
            type="time"
            aria-invalid={!!errors.time}
            {...register("time")}
          />
          {errors.time && <p className="form-error" role="alert">{errors.time.message}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="act-destination">
            Destinacija <span className="optional">(opciono)</span>
          </label>
          <select id="act-destination" className="form-select" {...register("destinationId")}>
            <option value="">— bez destinacije —</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="act-status">
            Status
          </label>
          <select id="act-status" className="form-select" {...register("status")}>
            {activityStatuses.map((status) => (
              <option key={status} value={status}>
                {activityStatusLabels[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="act-location">
            Lokacija <span className="optional">(opciono)</span>
          </label>
          <input
            id="act-location"
            className="form-input"
            type="text"
            placeholder="npr. Akropolj, Atina"
            {...register("location")}
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="act-cost">
            Procenjeni trošak (RSD)
          </label>
          <input
            id="act-cost"
            className="form-input"
            type="number"
            step="0.01"
            min="0"
            aria-invalid={!!errors.estimatedCost}
            {...register("estimatedCost")}
          />
          {errors.estimatedCost && <p className="form-error" role="alert">{errors.estimatedCost.message}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="act-lat">
            Geo. širina <span className="optional">(za mapu)</span>
          </label>
          <input
            id="act-lat"
            className="form-input"
            type="number"
            step="any"
            placeholder="37.9715"
            aria-invalid={!!errors.latitude}
            {...register("latitude")}
          />
          {errors.latitude && <p className="form-error" role="alert">{errors.latitude.message}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="act-lng">
            Geo. dužina <span className="optional">(za mapu)</span>
          </label>
          <input
            id="act-lng"
            className="form-input"
            type="number"
            step="any"
            placeholder="23.7267"
            aria-invalid={!!errors.longitude}
            {...register("longitude")}
          />
          {errors.longitude && <p className="form-error" role="alert">{errors.longitude.message}</p>}
        </div>

        <div className="form-field form-field--wide">
          <label className="form-label" htmlFor="act-description">
            Opis <span className="optional">(opciono)</span>
          </label>
          <textarea id="act-description" className="form-textarea" {...register("description")} />
        </div>
      </div>

      {serverError && (
        <div style={{ marginTop: "var(--space-4)" }}>
          <Alert>{serverError}</Alert>
        </div>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting && <span className="spinner spinner-sm" />}
          {isSubmitting ? "Čuvanje..." : submitLabel}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Otkaži
        </button>
      </div>
    </form>
  );
}
