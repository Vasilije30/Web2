import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { AlertIcon } from "./Icons";

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | undefined>(undefined);

interface PendingConfirm {
  options: ConfirmOptions;
  resolve: (confirmed: boolean) => void;
}

/**
 * Zamena za nativni window.confirm() — isto ponašanje (Promise<boolean>), ali dijalog
 * je deo aplikacije pa prati temu i može se stilizovati.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback<ConfirmFn>(
    (options) => new Promise<boolean>((resolve) => setPending({ options, resolve })),
    [],
  );

  function settle(confirmed: boolean) {
    pending?.resolve(confirmed);
    setPending(null);
  }

  useEffect(() => {
    if (!pending) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") settle(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  const options = pending?.options;
  const tone = options?.tone ?? "danger";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {options && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) settle(false);
          }}
        >
          <div className="modal" role="alertdialog" aria-modal="true" aria-label={options.title}>
            <div className="modal__title">
              <span className="modal__icon">
                <AlertIcon />
              </span>
              <span>{options.title}</span>
            </div>

            {options.message && <p className="modal__text">{options.message}</p>}

            <div className="modal__actions">
              <button type="button" className="btn btn-secondary" onClick={() => settle(false)}>
                {options.cancelLabel ?? "Otkaži"}
              </button>
              <button
                type="button"
                className={`btn ${tone === "danger" ? "btn-danger" : "btn-primary"}`}
                autoFocus
                onClick={() => settle(true)}
              >
                {options.confirmLabel ?? "Potvrdi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}
