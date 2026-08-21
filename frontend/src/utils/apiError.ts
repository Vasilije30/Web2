import { isAxiosError } from "axios";

/**
 * Backend errors come in two shapes: our own `{ message }` (Shared.Web.ExceptionHandlingMiddleware,
 * Identity.Service's auth exceptions) and ASP.NET Core's built-in validation problem details
 * (`{ errors: { FieldName: ["msg", ...] } }` from [ApiController] model validation).
 */
export function extractErrorMessage(error: unknown, fallback = "Došlo je do greške. Pokušaj ponovo."): string {
  if (isAxiosError(error)) {
    const data = error.response?.data;

    if (data?.errors && typeof data.errors === "object") {
      const messages = Object.values(data.errors).flat();
      if (messages.length > 0) return messages.join(" ");
    }

    if (typeof data?.message === "string") return data.message;
    if (typeof data?.title === "string") return data.title;
  }

  return fallback;
}
