import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { ExpenseInput } from "../../models/ExpenseInput";
import { extractErrorMessage } from "../../utils/apiError";
import { expenseCategories, expenseCategoryLabels } from "../../utils/labels";
import { Alert } from "../common/Feedback";

const expenseSchema = z.object({
  name: z.string().min(1, "Naziv je obavezan").max(200),
  category: z.enum(expenseCategories),
  amount: z.coerce.number().min(0, "Iznos ne može biti negativan"),
  date: z.string().min(1, "Datum je obavezan"),
  description: z.string().max(2000).default(""),
});

type ExpenseFormInput = z.input<typeof expenseSchema>;
type ExpenseFormValues = z.output<typeof expenseSchema>;

interface ExpenseFormProps {
  initialValues?: ExpenseInput;
  submitLabel: string;
  onSubmit: (input: ExpenseInput) => Promise<void>;
  onCancel: () => void;
}

export default function ExpenseForm({ initialValues, submitLabel, onSubmit, onCancel }: ExpenseFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormInput, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: initialValues ?? {
      name: "",
      category: "Other",
      amount: 0,
      date: "",
      description: "",
    },
  });

  async function handleFormSubmit(values: ExpenseFormValues) {
    setServerError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      setServerError(extractErrorMessage(error, "Čuvanje troška nije uspelo."));
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <div className="form-grid">
        <div className="form-field">
          <label className="form-label" htmlFor="exp-name">
            Naziv
          </label>
          <input
            id="exp-name"
            className="form-input"
            type="text"
            placeholder="npr. Avio karte"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && <p className="form-error" role="alert">{errors.name.message}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="exp-category">
            Kategorija
          </label>
          <select id="exp-category" className="form-select" {...register("category")}>
            {expenseCategories.map((category) => (
              <option key={category} value={category}>
                {expenseCategoryLabels[category]}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="exp-amount">
            Iznos (RSD)
          </label>
          <input
            id="exp-amount"
            className="form-input"
            type="number"
            step="0.01"
            min="0"
            aria-invalid={!!errors.amount}
            {...register("amount")}
          />
          {errors.amount && <p className="form-error" role="alert">{errors.amount.message}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="exp-date">
            Datum
          </label>
          <input
            id="exp-date"
            className="form-input"
            type="date"
            aria-invalid={!!errors.date}
            {...register("date")}
          />
          {errors.date && <p className="form-error" role="alert">{errors.date.message}</p>}
        </div>

        <div className="form-field form-field--wide">
          <label className="form-label" htmlFor="exp-description">
            Opis <span className="optional">(opciono)</span>
          </label>
          <textarea id="exp-description" className="form-textarea" {...register("description")} />
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
