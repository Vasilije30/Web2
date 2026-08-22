import type { ReactNode } from "react";
import { AlertIcon, CheckCircleIcon, InboxIcon, InfoIcon } from "./Icons";

type AlertTone = "error" | "success" | "info" | "warning";

const alertIcons: Record<AlertTone, typeof AlertIcon> = {
  error: AlertIcon,
  success: CheckCircleIcon,
  info: InfoIcon,
  warning: AlertIcon,
};

/** Poruka o grešci/uspehu. Greške dobijaju role="alert" da ih čitači ekrana odmah pročitaju. */
export function Alert({ tone = "error", children }: { tone?: AlertTone; children: ReactNode }) {
  const Icon = alertIcons[tone];
  return (
    <div className={`alert alert-${tone}`} role={tone === "error" ? "alert" : undefined}>
      <Icon />
      <div>{children}</div>
    </div>
  );
}

export function Loading({ label = "Učitavanje..." }: { label?: string }) {
  return (
    <div className="loading" role="status">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  text?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, text, icon, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon ?? <InboxIcon />}</div>
      <p className="empty-state__title">{title}</p>
      {text && <p className="empty-state__text">{text}</p>}
      {action}
    </div>
  );
}
