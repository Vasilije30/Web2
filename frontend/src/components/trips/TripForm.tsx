import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { TripInput } from "../../models/TripInput";
import { extractErrorMessage } from "../../utils/apiError";
import { Alert } from "../common/Feedback";

const tripSchema = z
  .object({
    name: z.string().min(1, "Naziv je obavezan").max(200),
    description: z.string().max(2000).default(""),
    startDate: z.string().min(1, "Početni datum je obavezan"),
    endDate: z.string().min(1, "Krajnji datum je obavezan"),
    budget: z.coerce.number().min(0, "Budžet ne može biti negativan"),
    notes: z.string().max(2000).default(""),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "Krajnji datum ne može biti pre početnog datuma",
    path: ["endDate"],
  });

// z.coerce/.default() prave razliku između onoga što forma drži (input) i onoga što
// validacija vrati (output), pa RHF-u prosleđujemo oba tipa.
type TripFormInput = z.input<typeof tripSchema>;
type TripFormValues = z.output<typeof tripSchema>;

interface TripFormProps {
  initialValues?: TripInput;
  submitLabel: string;
  onSubmit: (input: TripInput) => Promise<void>;
  onCancel?: () => void;
}

export default function TripForm({ initialValues, submitLabel, onSubmit, onCancel }: TripFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TripFormInput, unknown, TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: initialValues ?? {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      budget: 0,
      notes: "",
    },
  });

  async function handleFormSubmit(values: TripFormValues) {
    setServerError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      setServerError(extractErrorMessage(error, "Čuvanje plana nije uspelo."));
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <div className="form-grid">
        <div className="form-field form-field--wide">
          <label className="form-label" htmlFor="trip-name">
            Naziv plana
          </label>
          <input
            id="trip-name"
            className="form-input"
            type="text"
            placeholder="npr. Leto u Grčkoj"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && <p className="form-error" role="alert">{errors.name.message}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="trip-start">
            Početni datum
          </label>
          <input
            id="trip-start"
            className="form-input"
            type="date"
            aria-invalid={!!errors.startDate}
            {...register("startDate")}
          />
          {errors.startDate && <p className="form-error" role="alert">{errors.startDate.message}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="trip-end">
            Krajnji datum
          </label>
          <input
            id="trip-end"
            className="form-input"
            type="date"
            aria-invalid={!!errors.endDate}
            {...register("endDate")}
          />
          {errors.endDate && <p className="form-error" role="alert">{errors.endDate.message}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="trip-budget">
            Budžet (RSD)
          </label>
          <input
            id="trip-budget"
            className="form-input"
            type="number"
            step="0.01"
            min="0"
            aria-invalid={!!errors.budget}
            {...register("budget")}
          />
          {errors.budget && <p className="form-error" role="alert">{errors.budget.message}</p>}
        </div>

        <div className="form-field form-field--wide">
          <label className="form-label" htmlFor="trip-description">
            Opis <span className="optional">(opciono)</span>
          </label>
          <textarea
            id="trip-description"
            className="form-textarea"
            placeholder="Kratak opis putovanja..."
            {...register("description")}
          />
        </div>

        <div className="form-field form-field--wide">
          <label className="form-label" htmlFor="trip-notes">
            Napomene <span className="optional">(opciono)</span>
          </label>
          <textarea
            id="trip-notes"
            className="form-textarea"
            placeholder="Podsetnici, rezervacije, kontakti..."
            {...register("notes")}
          />
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
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Otkaži
          </button>
        )}
      </div>
    </form>
  );
}
