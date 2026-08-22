import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { DestinationInput } from "../../models/DestinationInput";
import { extractErrorMessage } from "../../utils/apiError";
import { Alert } from "../common/Feedback";

const destinationSchema = z
  .object({
    name: z.string().min(1, "Naziv je obavezan").max(200),
    location: z.string().min(1, "Lokacija je obavezna").max(300),
    arrivalDate: z.string().min(1, "Datum dolaska je obavezan"),
    departureDate: z.string().min(1, "Datum odlaska je obavezan"),
    description: z.string().max(2000).default(""),
  })
  .refine((data) => data.departureDate >= data.arrivalDate, {
    message: "Datum odlaska ne može biti pre datuma dolaska",
    path: ["departureDate"],
  });

type DestinationFormInput = z.input<typeof destinationSchema>;
type DestinationFormValues = z.output<typeof destinationSchema>;

interface DestinationFormProps {
  initialValues?: DestinationInput;
  submitLabel: string;
  onSubmit: (input: DestinationInput) => Promise<void>;
  onCancel: () => void;
}

export default function DestinationForm({ initialValues, submitLabel, onSubmit, onCancel }: DestinationFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DestinationFormInput, unknown, DestinationFormValues>({
    resolver: zodResolver(destinationSchema),
    defaultValues: initialValues ?? {
      name: "",
      location: "",
      arrivalDate: "",
      departureDate: "",
      description: "",
    },
  });

  async function handleFormSubmit(values: DestinationFormValues) {
    setServerError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      setServerError(extractErrorMessage(error, "Čuvanje destinacije nije uspelo."));
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <div className="form-grid">
        <div className="form-field">
          <label className="form-label" htmlFor="dest-name">
            Naziv
          </label>
          <input
            id="dest-name"
            className="form-input"
            type="text"
            placeholder="npr. Atina"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && <p className="form-error" role="alert">{errors.name.message}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="dest-location">
            Lokacija
          </label>
          <input
            id="dest-location"
            className="form-input"
            type="text"
            placeholder="npr. Grčka"
            aria-invalid={!!errors.location}
            {...register("location")}
          />
          {errors.location && <p className="form-error" role="alert">{errors.location.message}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="dest-arrival">
            Datum dolaska
          </label>
          <input
            id="dest-arrival"
            className="form-input"
            type="date"
            aria-invalid={!!errors.arrivalDate}
            {...register("arrivalDate")}
          />
          {errors.arrivalDate && <p className="form-error" role="alert">{errors.arrivalDate.message}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="dest-departure">
            Datum odlaska
          </label>
          <input
            id="dest-departure"
            className="form-input"
            type="date"
            aria-invalid={!!errors.departureDate}
            {...register("departureDate")}
          />
          {errors.departureDate && <p className="form-error" role="alert">{errors.departureDate.message}</p>}
        </div>

        <div className="form-field form-field--wide">
          <label className="form-label" htmlFor="dest-description">
            Opis / napomena <span className="optional">(opciono)</span>
          </label>
          <textarea id="dest-description" className="form-textarea" {...register("description")} />
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
