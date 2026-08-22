import { useEffect, useState, type FormEvent } from "react";
import type { ChecklistItem } from "../../models/ChecklistItem";
import * as checklistService from "../../services/checklistService";
import { extractErrorMessage } from "../../utils/apiError";
import { useConfirm } from "../common/ConfirmProvider";
import { Alert, EmptyState, Loading } from "../common/Feedback";
import { ChecklistIcon, PlusIcon, TrashIcon } from "../common/Icons";
import Panel from "../common/Panel";

interface ChecklistSectionProps {
  tripId: string;
  shareToken?: string;
  readOnly?: boolean;
}

export default function ChecklistSection({ tripId, shareToken, readOnly = false }: ChecklistSectionProps) {
  const confirm = useConfirm();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [newText, setNewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  async function loadItems() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await checklistService.getChecklistItems(tripId, shareToken);
      setItems(data);
    } catch (error) {
      setLoadError(extractErrorMessage(error, "Checklist nije učitana."));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    if (!newText.trim()) return;
    setIsSubmitting(true);
    try {
      await checklistService.createChecklistItem(tripId, { text: newText.trim(), isCompleted: false }, shareToken);
      setNewText("");
      await loadItems();
    } catch (error) {
      setLoadError(extractErrorMessage(error, "Dodavanje stavke nije uspelo."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggle(item: ChecklistItem) {
    await checklistService.updateChecklistItem(
      tripId,
      item.id,
      { text: item.text, isCompleted: !item.isCompleted },
      shareToken,
    );
    await loadItems();
  }

  async function handleDelete(item: ChecklistItem) {
    const confirmed = await confirm({
      title: "Obrisati stavku?",
      message: `„${item.text}” će biti uklonjena sa liste za pakovanje.`,
      confirmLabel: "Obriši",
    });
    if (!confirmed) return;
    await checklistService.deleteChecklistItem(tripId, item.id, shareToken);
    await loadItems();
  }

  const doneCount = items.filter((item) => item.isCompleted).length;
  const donePercent = items.length > 0 ? (doneCount / items.length) * 100 : 0;

  return (
    <Panel
      icon={<ChecklistIcon />}
      title="Lista za pakovanje"
      subtitle={items.length > 0 ? `${doneCount} od ${items.length} spremno` : "Šta ne smeš da zaboraviš"}
    >
      {items.length > 0 && (
        <div
          className="progress"
          role="progressbar"
          aria-valuenow={Math.round(donePercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Napredak pakovanja"
        >
          <div className="progress__bar" style={{ width: `${donePercent}%` }} />
        </div>
      )}

      {!readOnly && (
        <form className="form-inline" onSubmit={handleAdd}>
          <div className="form-field">
            <label className="form-label" htmlFor="checklist-new-text">
              Nova stavka
            </label>
            <input
              id="checklist-new-text"
              className="form-input"
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="npr. Pasoš"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || !newText.trim()}>
            {isSubmitting ? <span className="spinner spinner-sm" /> : <PlusIcon />}
            Dodaj
          </button>
        </form>
      )}

      {isLoading && <Loading />}
      {loadError && <Alert>{loadError}</Alert>}

      {!isLoading && !loadError && items.length === 0 && (
        <EmptyState
          icon={<ChecklistIcon />}
          title="Lista je prazna"
          text={readOnly ? "Vlasnik plana još nije napravio listu." : "Dodaj stvari koje treba da spakuješ."}
        />
      )}

      {items.length > 0 && (
        <ul className="stack-sm">
          {items.map((item) => (
            <li key={item.id} className={`check-item ${item.isCompleted ? "is-done" : ""}`}>
              <label className="checkbox" style={{ flex: 1 }}>
                <input
                  type="checkbox"
                  checked={item.isCompleted}
                  disabled={readOnly}
                  onChange={() => handleToggle(item)}
                />
                <span className="check-item__text">{item.text}</span>
              </label>

              {!readOnly && (
                <button
                  type="button"
                  className="btn btn-danger-soft btn-sm"
                  aria-label={`Obriši stavku ${item.text}`}
                  onClick={() => handleDelete(item)}
                >
                  <TrashIcon />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
