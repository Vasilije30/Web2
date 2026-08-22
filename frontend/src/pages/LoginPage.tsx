import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import AuthLayout from "../components/auth/AuthLayout";
import { Alert } from "../components/common/Feedback";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../utils/apiError";

const loginSchema = z.object({
  email: z.string().min(1, "Email je obavezan").email("Email nije validan"),
  password: z.string().min(1, "Lozinka je obavezna"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      await login(values.email, values.password);
      navigate("/");
    } catch (error) {
      setServerError(extractErrorMessage(error, "Prijava nije uspela. Proveri email i lozinku."));
    }
  }

  return (
    <AuthLayout
      title="Prijava"
      subtitle="Dobrodošao nazad — nastavi tamo gde si stao."
      footer={
        <>
          Nemaš nalog? <Link to="/register">Registruj se</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-field">
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="form-input"
            type="email"
            autoComplete="email"
            placeholder="ime@primer.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && <p className="form-error" role="alert">{errors.email.message}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="password">
            Lozinka
          </label>
          <input
            id="password"
            className="form-input"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password && <p className="form-error" role="alert">{errors.password.message}</p>}
        </div>

        {serverError && <Alert>{serverError}</Alert>}

        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={isSubmitting}>
          {isSubmitting && <span className="spinner spinner-sm" />}
          {isSubmitting ? "Prijavljivanje..." : "Prijavi se"}
        </button>
      </form>
    </AuthLayout>
  );
}
