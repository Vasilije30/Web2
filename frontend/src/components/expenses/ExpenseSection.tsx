import { useEffect, useState } from "react";
import type { BudgetSummary } from "../../models/BudgetSummary";
import type { Expense } from "../../models/Expense";
import type { ExpenseInput } from "../../models/ExpenseInput";
import * as expenseService from "../../services/expenseService";
import { extractErrorMessage } from "../../utils/apiError";
import { formatCurrency, formatDate } from "../../utils/format";
import { expenseCategoryLabels, type ExpenseCategoryKey } from "../../utils/labels";
import { useConfirm } from "../common/ConfirmProvider";
import { Alert, EmptyState, Loading } from "../common/Feedback";
import { CalendarIcon, PencilIcon, PlusIcon, TrashIcon, WalletIcon } from "../common/Icons";
import Panel from "../common/Panel";
import ExpenseForm from "./ExpenseForm";

interface ExpenseSectionProps {
  tripId: string;
  shareToken?: string;
  readOnly?: boolean;
}

export default function ExpenseSection({ tripId, shareToken, readOnly = false }: ExpenseSectionProps) {
  const confirm = useConfirm();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  async function loadAll() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [expenseData, summaryData] = await Promise.all([
        expenseService.getExpenses(tripId, shareToken),
        expenseService.getBudgetSummary(tripId, shareToken),
      ]);
      setExpenses(expenseData);
      setSummary(summaryData);
    } catch (error) {
      setLoadError(extractErrorMessage(error, "Troškovi nisu učitani."));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(input: ExpenseInput) {
    await expenseService.createExpense(tripId, input, shareToken);
    setIsCreating(false);
    await loadAll();
  }

  async function handleUpdate(expenseId: string, input: ExpenseInput) {
    await expenseService.updateExpense(tripId, expenseId, input, shareToken);
    setEditingId(null);
    await loadAll();
  }

  async function handleDelete(expense: Expense) {
    const confirmed = await confirm({
      title: "Obrisati trošak?",
      message: `Trošak „${expense.name}” (${formatCurrency(expense.amount)}) biće uklonjen iz obračuna budžeta.`,
      confirmLabel: "Obriši",
    });
    if (!confirmed) return;
    await expenseService.deleteExpense(tripId, expense.id, shareToken);
    await loadAll();
  }

  const editingExpense = !readOnly ? (expenses.find((e) => e.id === editingId) ?? null) : null;
  const spentPercent = summary && summary.budget > 0 ? Math.min((summary.totalSpent / summary.budget) * 100, 100) : 0;
  const isOverBudget = !!summary && summary.remainingBudget < 0;

  return (
    <Panel
      icon={<WalletIcon />}
      title="Budžet i troškovi"
      subtitle={expenses.length > 0 ? `${expenses.length} evidentiranih stavki` : "Praćenje potrošnje"}
      actions={
        !readOnly &&
        !isCreating && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsCreating(true)}>
            <PlusIcon />
            Dodaj trošak
          </button>
        )
      }
    >
      {summary && (
        <>
          <div className="grid grid-stats">
            <div className="stat">
              <p className="stat__label">Budžet</p>
              <p className="stat__value">{formatCurrency(summary.budget)}</p>
            </div>
            <div className="stat">
              <p className="stat__label">Potrošeno</p>
              <p className="stat__value">{formatCurrency(summary.totalSpent)}</p>
              <p className="stat__hint">{Math.round(spentPercent)}% budžeta</p>
            </div>
            <div className={`stat ${isOverBudget ? "stat--negative" : "stat--positive"}`}>
              <p className="stat__label">{isOverBudget ? "Prekoračenje" : "Preostalo"}</p>
              <p className="stat__value">{formatCurrency(Math.abs(summary.remainingBudget))}</p>
            </div>
          </div>

          <div
            className="progress"
            role="progressbar"
            aria-valuenow={Math.round(spentPercent)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Iskorišćenost budžeta"
          >
            <div className={`progress__bar ${isOverBudget ? "is-over" : ""}`} style={{ width: `${spentPercent}%` }} />
          </div>

          {isOverBudget && <Alert tone="warning">Troškovi su premašili planirani budžet.</Alert>}
        </>
      )}

      {!readOnly && isCreating && (
        <div className="card card-pad">
          <ExpenseForm submitLabel="Dodaj" onSubmit={handleCreate} onCancel={() => setIsCreating(false)} />
        </div>
      )}

      {isLoading && <Loading />}
      {loadError && <Alert>{loadError}</Alert>}

      {!isLoading && !loadError && expenses.length === 0 && !isCreating && (
        <EmptyState
          icon={<WalletIcon />}
          title="Nema evidentiranih troškova"
          text={readOnly ? "Vlasnik plana još nije uneo troškove." : "Dodaj troškove da bi pratio potrošnju budžeta."}
        />
      )}

      {expenses.length > 0 && (
        <ul className="item-list">
          {expenses.map((expense) =>
            editingExpense?.id === expense.id ? (
              <li key={expense.id} className="card card-pad">
                <ExpenseForm
                  initialValues={expense}
                  submitLabel="Sačuvaj"
                  onSubmit={(input) => handleUpdate(expense.id, input)}
                  onCancel={() => setEditingId(null)}
                />
              </li>
            ) : (
              <li key={expense.id} className="item">
                <div className="item__main">
                  <div className="item__title">
                    {expense.name}
                    <span className="badge badge-primary">
                      {expenseCategoryLabels[expense.category as ExpenseCategoryKey]}
                    </span>
                  </div>
                  <div className="item__meta">
                    <span>
                      <CalendarIcon />
                      {formatDate(expense.date)}
                    </span>
                  </div>
                  {expense.description && <p className="item__desc">{expense.description}</p>}
                </div>

                <span className="item__amount">{formatCurrency(expense.amount)}</span>

                {!readOnly && (
                  <div className="item__actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      aria-label={`Izmeni trošak ${expense.name}`}
                      onClick={() => setEditingId(expense.id)}
                    >
                      <PencilIcon />
                      Izmeni
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger-soft btn-sm"
                      aria-label={`Obriši trošak ${expense.name}`}
                      onClick={() => handleDelete(expense)}
                    >
                      <TrashIcon />
                      Obriši
                    </button>
                  </div>
                )}
              </li>
            ),
          )}
        </ul>
      )}
    </Panel>
  );
}
