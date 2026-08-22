import { useEffect, useState } from "react";
import { useConfirm } from "../components/common/ConfirmProvider";
import { Alert, EmptyState, Loading } from "../components/common/Feedback";
import { MapIcon, ShieldIcon, TrashIcon, UsersIcon } from "../components/common/Icons";
import Panel from "../components/common/Panel";
import { useAuth } from "../context/AuthContext";
import type { AdminTripSummary } from "../models/AdminTripSummary";
import type { AdminUserSummary } from "../models/AdminUserSummary";
import type { UserRole } from "../models/User";
import * as adminService from "../services/adminService";
import { extractErrorMessage } from "../utils/apiError";
import { formatCurrency, formatDate, formatDateRange, initials } from "../utils/format";

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const confirm = useConfirm();

  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [trips, setTrips] = useState<AdminTripSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [usersData, tripsData] = await Promise.all([adminService.getAllUsers(), adminService.getAllTrips()]);
      setUsers(usersData);
      setTrips(tripsData);
    } catch (error) {
      setLoadError(extractErrorMessage(error, "Podaci nisu učitani."));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRoleChange(userId: string, role: UserRole) {
    setActionError(null);
    try {
      const updated = await adminService.updateUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (error) {
      setActionError(extractErrorMessage(error, "Uloga nije promenjena."));
    }
  }

  async function handleDelete(user: AdminUserSummary) {
    const confirmed = await confirm({
      title: "Obrisati korisnički nalog?",
      message: `Nalog „${user.name}” (${user.email}) biće trajno obrisan. Ova akcija je nepovratna.`,
      confirmLabel: "Obriši nalog",
    });
    if (!confirmed) return;

    setActionError(null);
    try {
      await adminService.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (error) {
      setActionError(extractErrorMessage(error, "Nalog nije obrisan."));
    }
  }

  function tripCountFor(userId: string): number {
    return trips.filter((t) => t.userId === userId).length;
  }

  if (isLoading) return <Loading label="Učitavanje administracije..." />;
  if (loadError) return <Alert>{loadError}</Alert>;

  const adminCount = users.filter((u) => u.role === "Admin").length;

  return (
    <>
      <div className="page-header">
        <div className="page-header__text">
          <span className="page-header__eyebrow">
            <ShieldIcon /> Administracija
          </span>
          <h1>Upravljanje sistemom</h1>
          <p className="page-header__subtitle">
            Pregled svih korisničkih naloga i planova putovanja u sistemu, uz izmenu uloga i brisanje naloga.
          </p>
        </div>
      </div>

      <div className="stack">
        <div className="grid grid-stats">
          <div className="stat">
            <p className="stat__label">Korisnika</p>
            <p className="stat__value">{users.length}</p>
          </div>
          <div className="stat stat--accent">
            <p className="stat__label">Administratora</p>
            <p className="stat__value">{adminCount}</p>
          </div>
          <div className="stat">
            <p className="stat__label">Planova putovanja</p>
            <p className="stat__value">{trips.length}</p>
          </div>
        </div>

        {actionError && <Alert>{actionError}</Alert>}

        <Panel icon={<UsersIcon />} title="Korisnici" subtitle="Uloga se menja odmah; sopstveni nalog nije moguće menjati">
          {users.length === 0 ? (
            <EmptyState icon={<UsersIcon />} title="Nema registrovanih korisnika" />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Korisnik</th>
                    <th>Uloga</th>
                    <th>Planova</th>
                    <th>Registrovan</th>
                    <th className="cell-actions">Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    return (
                      <tr key={u.id}>
                        <td>
                          <div className="table-user">
                            <span className="avatar">{initials(u.name)}</span>
                            <div>
                              <div className="cell-strong">
                                {u.name}
                                {isSelf && (
                                  <span className="badge badge-primary" style={{ marginInlineStart: "var(--space-2)" }}>
                                    ti
                                  </span>
                                )}
                              </div>
                              <div className="cell-muted">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <select
                            className="form-select"
                            value={u.role}
                            disabled={isSelf}
                            aria-label={`Uloga korisnika ${u.name}`}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          >
                            <option value="User">Korisnik</option>
                            <option value="Admin">Administrator</option>
                          </select>
                        </td>
                        <td>{tripCountFor(u.id)}</td>
                        <td className="cell-muted">{formatDate(u.createdAt.slice(0, 10))}</td>
                        <td className="cell-actions">
                          <button
                            type="button"
                            className="btn btn-danger-soft btn-sm"
                            disabled={isSelf}
                            aria-label={`Obriši nalog ${u.name}`}
                            onClick={() => handleDelete(u)}
                          >
                            <TrashIcon />
                            Obriši
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel icon={<MapIcon />} title="Svi planovi putovanja" subtitle="Pregled planova svih korisnika u sistemu">
          {trips.length === 0 ? (
            <EmptyState icon={<MapIcon />} title="Nema kreiranih planova putovanja" />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Naziv plana</th>
                    <th>Vlasnik</th>
                    <th>Period</th>
                    <th>Budžet</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((t) => {
                    const owner = users.find((u) => u.id === t.userId);
                    return (
                      <tr key={t.id}>
                        <td className="cell-strong">{t.name}</td>
                        <td>
                          {owner ? (
                            <>
                              <div>{owner.name}</div>
                              <div className="cell-muted">{owner.email}</div>
                            </>
                          ) : (
                            <span className="cell-muted mono">{t.userId}</span>
                          )}
                        </td>
                        <td className="cell-muted">{formatDateRange(t.startDate, t.endDate)}</td>
                        <td>{formatCurrency(t.budget)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
