import { useEffect, useState, type ReactNode } from "react";
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AdminRoute from "./components/auth/AdminRoute";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { ConfirmProvider } from "./components/common/ConfirmProvider";
import { LogOutIcon, MapIcon, MenuIcon, PlaneIcon, ShieldIcon, XIcon } from "./components/common/Icons";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";
import SharedTripPage from "./pages/SharedTripPage";
import TripDetailPage from "./pages/TripDetailPage";
import TripsListPage from "./pages/TripsListPage";
import { initials } from "./utils/format";

/** Rute na kojima se stranica sama brine o razmaku (split layout preko cele širine). */
const FLUSH_ROUTES = ["/login", "/register"];

function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth();
  if (isInitializing) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Mobilni meni ostaje otvoren preko navigacije ako ga ne zatvorimo ručno.
  useEffect(() => setIsMenuOpen(false), [location.pathname]);

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link to="/" className="brand">
          <span className="brand__mark">
            <PlaneIcon />
          </span>
          <span className="brand__text">
            Travel Planner
            <small>Planiraj. Podeli. Putuj.</small>
          </span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Zatvori meni" : "Otvori meni"}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <XIcon /> : <MenuIcon />}
        </button>

        <nav className={`app-nav ${isMenuOpen ? "is-open" : ""}`}>
          {isAuthenticated ? (
            <>
              <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}>
                <MapIcon />
                Moji planovi
              </NavLink>

              {user?.role === "Admin" && (
                <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}>
                  <ShieldIcon />
                  Administracija
                </NavLink>
              )}

              <span className="nav-divider" />

              <span className="user-chip">
                <span className="avatar">{initials(user?.name ?? "?")}</span>
                {user?.name}
              </span>

              <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
                <LogOutIcon />
                Odjava
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}>
                Prijava
              </NavLink>
              <Link to="/register" className="btn btn-primary btn-sm">
                Registracija
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isFlush = FLUSH_ROUTES.includes(location.pathname);

  return (
    <div className="app-shell">
      <Header />
      <main className={isFlush ? "" : "app-main"}>{isFlush ? children : <div className="container">{children}</div>}</main>
      <footer className="app-footer">
        <div className="app-footer__inner">
          <span>Travel Planner — projekat iz predmeta Primena veb programiranja u infrastrukturnim sistemima</span>
          <span>React · .NET · Service Fabric · SQL Server</span>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ConfirmProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <TripsListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/:tripId"
                element={
                  <ProtectedRoute>
                    <TripDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <GuestOnlyRoute>
                    <LoginPage />
                  </GuestOnlyRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <GuestOnlyRoute>
                    <RegisterPage />
                  </GuestOnlyRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                }
              />
              <Route path="/shared/:token" element={<SharedTripPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ConfirmProvider>
    </AuthProvider>
  );
}

export default App;
