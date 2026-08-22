import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import AuthLayout from "../components/auth/AuthLayout";
import { Alert } from "../components/common/Feedback";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../utils/apiError";

const registerSchema = z.object({
  name: z.string().min(2, "Ime mora imati bar 2 karaktera"),
  email: z.string().min(1, "Email je obavezan").email("Email nije validan"),
  password: z.string().min(8, "Lozinka mora imati bar 8 karaktera"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null);
    try {
      await registerUser(values.name, values.email, values.password);
      navigate("/");
    } catch (error) {
      setServerError(extractErrorMessage(error, "Registracija nije uspela."));
    }
  }

  return (
    <AuthLayout
      title="Napravi nalog"
      subtitle="Registracija traje manje od minuta i odmah možeš da planiraš."
      footer={
        <>
          Već imaš nalog? <Link to="/login">Prijavi se</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-field">
          <label className="form-label" htmlFor="name">
            Ime
          </label>
          <input
            id="name"
            className="form-input"
            type="text"
            autoComplete="name"
            placeholder="Petar Petrović"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && <p className="form-error" role="alert">{errors.name.message}</p>}
        </div>

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
            autoComplete="new-password"
            placeholder="Najmanje 8 karaktera"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password ? (
            <p className="form-error" role="alert">{errors.password.message}</p>
          ) : (
            <p className="form-hint">Lozinka se čuva heširana — nikada u čitljivom obliku.</p>
          )}
        </div>

        {serverError && <Alert>{serverError}</Alert>}

        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={isSubmitting}>
          {isSubmitting && <span className="spinner spinner-sm" />}
          {isSubmitting ? "Registracija..." : "Registruj se"}
        </button>
      </form>
    </AuthLayout>
  );
}
