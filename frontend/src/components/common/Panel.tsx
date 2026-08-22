import type { ReactNode } from "react";

interface PanelProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/** Kartica-sekcija sa zaglavljem — osnovni gradivni blok stranice sa detaljima plana. */
export default function Panel({ icon, title, subtitle, actions, children }: PanelProps) {
  return (
    <section className="panel">
      <header className="panel__header">
        <div className="panel__title">
          <span className="panel__icon">{icon}</span>
          <div>
            <h2>{title}</h2>
            {subtitle && <p className="panel__subtitle">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="panel__actions">{actions}</div>}
      </header>
      <div className="panel__body">{children}</div>
    </section>
  );
}
