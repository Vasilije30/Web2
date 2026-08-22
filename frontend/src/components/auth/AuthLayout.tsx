import type { ReactNode } from "react";
import { CalendarIcon, QrIcon, RouteIcon, WalletIcon } from "../common/Icons";

const highlights = [
  {
    icon: <CalendarIcon />,
    title: "Itinerar po danima",
    text: "Aktivnosti u kalendarskom prikazu, sa statusom i procenjenim troškom.",
  },
  {
    icon: <WalletIcon />,
    title: "Budžet pod kontrolom",
    text: "Evidentiraj troškove po kategorijama i prati koliko ti je ostalo.",
  },
  {
    icon: <RouteIcon />,
    title: "Ruta na mapi",
    text: "Redosled obilaska iscrtan na interaktivnoj mapi, dan po dan.",
  },
  {
    icon: <QrIcon />,
    title: "Deljenje QR kodom",
    text: "Pošalji plan na pregled ili izmenu — bez pravljenja naloga.",
  },
];

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <aside className="auth-aside">
        <div>
          <h2>Sve za jedno putovanje, na jednom mestu</h2>
          <p style={{ marginTop: "var(--space-3)" }}>
            Destinacije, dnevne aktivnosti, troškovi i lista za pakovanje — organizovano i spremno za deljenje.
          </p>
        </div>

        <div className="auth-features">
          {highlights.map((item) => (
            <div key={item.title} className="auth-feature">
              <span className="auth-feature__icon">{item.icon}</span>
              <div>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="auth-main">
        <div className="auth-card card card-pad">
          <header className="auth-card__header">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </header>

          {children}

          <div className="auth-footer">{footer}</div>
        </div>
      </div>
    </div>
  );
}
