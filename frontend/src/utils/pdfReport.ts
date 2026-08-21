import { jsPDF } from "jspdf";
import type { Activity } from "../models/Activity";
import type { BudgetSummary } from "../models/BudgetSummary";
import type { ChecklistItem } from "../models/ChecklistItem";
import type { Destination } from "../models/Destination";
import type { Expense } from "../models/Expense";
import type { Trip } from "../models/Trip";
import { activityStatusLabels, expenseCategoryLabels } from "./labels";

/**
 * jsPDF's built-in core fonts (Helvetica) only reliably cover WinAnsi/Latin-1 glyphs - they don't
 * include č/ć/đ (Latin Extended-A), so those would render as missing glyphs/boxes. Embedding a
 * custom TTF just for four letters isn't worth the bundle size, so PDF text is transliterated to
 * plain ASCII. The on-screen app UI is unaffected - this only applies to the exported file.
 */
const DIACRITICS: Record<string, string> = {
  č: "c",
  ć: "c",
  ž: "z",
  š: "s",
  đ: "dj",
  Č: "C",
  Ć: "C",
  Ž: "Z",
  Š: "S",
  Đ: "Dj",
};

function pdfText(input: string): string {
  return input.replace(/[čćžšđČĆŽŠĐ]/g, (ch) => DIACRITICS[ch] ?? ch);
}

function pdfDate(isoDate: string): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}.`;
}

function pdfMoney(amount: number): string {
  return `${Math.round(amount).toLocaleString("en-US").replace(/,/g, ".")} RSD`;
}

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_X = 18;
const MARGIN_BOTTOM = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

const INK = { strong: [15, 23, 42] as const, base: [51, 65, 85] as const, muted: [100, 116, 139] as const };
const BRAND: readonly [number, number, number] = [13, 148, 136];
const RULE: readonly [number, number, number] = [226, 232, 240];

class ReportCursor {
  doc: jsPDF;
  y = 20;

  constructor(doc: jsPDF) {
    this.doc = doc;
  }

  private ensureSpace(needed: number) {
    if (this.y + needed > PAGE_HEIGHT - MARGIN_BOTTOM) {
      this.doc.addPage();
      this.y = 20;
    }
  }

  gap(amount: number) {
    this.y += amount;
  }

  rule() {
    this.ensureSpace(4);
    this.doc.setDrawColor(...RULE);
    this.doc.line(MARGIN_X, this.y, PAGE_WIDTH - MARGIN_X, this.y);
    this.y += 6;
  }

  sectionHeading(text: string) {
    this.ensureSpace(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(13);
    this.doc.setTextColor(...INK.strong);
    this.doc.text(pdfText(text), MARGIN_X, this.y);
    this.y += 2;
    this.doc.setDrawColor(...BRAND);
    this.doc.setLineWidth(0.6);
    this.doc.line(MARGIN_X, this.y, MARGIN_X + 26, this.y);
    this.doc.setLineWidth(0.2);
    this.y += 8;
  }

  subheading(text: string) {
    this.ensureSpace(8);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(10.5);
    this.doc.setTextColor(...INK.strong);
    this.doc.text(pdfText(text), MARGIN_X, this.y);
    this.y += 6;
  }

  row(label: string, value: string, opts?: { indent?: number; boldValue?: boolean }) {
    if (!value) return;
    this.ensureSpace(6);
    const indent = opts?.indent ?? 0;
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(...INK.muted);
    this.doc.text(pdfText(label), MARGIN_X + indent, this.y);
    this.doc.setFont("helvetica", opts?.boldValue ? "bold" : "normal");
    this.doc.setTextColor(...INK.strong);
    this.doc.text(pdfText(value), MARGIN_X + indent + 38, this.y);
    this.y += 5.5;
  }

  paragraph(text: string, opts?: { indent?: number; italic?: boolean }) {
    if (!text) return;
    const indent = opts?.indent ?? 0;
    this.doc.setFont("helvetica", opts?.italic ? "italic" : "normal");
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(...INK.base);
    const lines: string[] = this.doc.splitTextToSize(pdfText(text), CONTENT_WIDTH - indent);
    for (const line of lines) {
      this.ensureSpace(5.5);
      this.doc.text(line, MARGIN_X + indent, this.y);
      this.y += 5;
    }
  }

  emptyNote(text: string) {
    this.ensureSpace(6);
    this.doc.setFont("helvetica", "italic");
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(...INK.muted);
    this.doc.text(pdfText(text), MARGIN_X, this.y);
    this.y += 7;
  }
}

interface TripReportData {
  trip: Trip;
  destinations: Destination[];
  activities: Activity[];
  expenses: Expense[];
  budgetSummary: BudgetSummary;
  checklistItems: ChecklistItem[];
}

export function downloadTripReportPdf(data: TripReportData): void {
  const { trip, destinations, activities, expenses, budgetSummary, checklistItems } = data;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const c = new ReportCursor(doc);

  // --- Zaglavlje ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND);
  doc.text("TRAVEL PLANNER", MARGIN_X, c.y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...INK.muted);
  doc.text(`Generisano: ${pdfDate(new Date().toISOString().slice(0, 10))}`, PAGE_WIDTH - MARGIN_X, c.y, {
    align: "right",
  });
  c.y += 9;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(...INK.strong);
  doc.text(pdfText(trip.name), MARGIN_X, c.y);
  c.y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...INK.muted);
  doc.text(`Izvestaj o planu putovanja  |  ${pdfDate(trip.startDate)} - ${pdfDate(trip.endDate)}`, MARGIN_X, c.y);
  c.y += 8;
  c.rule();

  // --- Pregled ---
  c.sectionHeading("Pregled");
  c.row("Period:", `${pdfDate(trip.startDate)} - ${pdfDate(trip.endDate)}`);
  c.row("Budzet:", pdfMoney(trip.budget), { boldValue: true });
  if (trip.description) {
    c.gap(2);
    c.paragraph(trip.description);
  }
  if (trip.notes) {
    c.gap(2);
    c.subheading("Napomene");
    c.paragraph(trip.notes, { italic: true });
  }
  c.gap(4);

  // --- Destinacije ---
  c.sectionHeading(`Destinacije (${destinations.length})`);
  if (destinations.length === 0) {
    c.emptyNote("Nema unetih destinacija.");
  } else {
    for (const d of destinations) {
      c.subheading(`${d.name} - ${d.location}`);
      c.row("Period:", `${pdfDate(d.arrivalDate)} - ${pdfDate(d.departureDate)}`, { indent: 4 });
      if (d.description) c.paragraph(d.description, { indent: 4 });
      c.gap(3);
    }
  }
  c.gap(2);

  // --- Itinerar ---
  c.sectionHeading(`Itinerar (${activities.length} aktivnosti)`);
  if (activities.length === 0) {
    c.emptyNote("Nema unetih aktivnosti.");
  } else {
    const byDay = new Map<string, Activity[]>();
    for (const a of activities) {
      const list = byDay.get(a.date) ?? [];
      list.push(a);
      byDay.set(a.date, list);
    }
    const days = Array.from(byDay.keys()).sort();
    for (const day of days) {
      c.subheading(pdfDate(day));
      const dayActivities = byDay.get(day)!.sort((a, b) => a.time.localeCompare(b.time));
      for (const a of dayActivities) {
        const costPart = a.estimatedCost > 0 ? `  |  ~${pdfMoney(a.estimatedCost)}` : "";
        const locationPart = a.location ? `  |  ${a.location}` : "";
        c.row(
          `${a.time.slice(0, 5)}`,
          `${a.name}  [${activityStatusLabels[a.status]}]${locationPart}${costPart}`,
          { indent: 4 },
        );
      }
      c.gap(2);
    }
  }
  c.gap(2);

  // --- Budzet i troskovi ---
  c.sectionHeading("Budzet i troskovi");
  c.row("Budzet:", pdfMoney(budgetSummary.budget));
  c.row("Potroseno:", pdfMoney(budgetSummary.totalSpent));
  c.row(budgetSummary.remainingBudget < 0 ? "Prekoracenje:" : "Preostalo:", pdfMoney(Math.abs(budgetSummary.remainingBudget)), {
    boldValue: true,
  });
  c.gap(3);
  if (expenses.length === 0) {
    c.emptyNote("Nema evidentiranih troskova.");
  } else {
    for (const e of expenses) {
      c.row(pdfDate(e.date), `${e.name} (${expenseCategoryLabels[e.category]})  -  ${pdfMoney(e.amount)}`, {
        indent: 4,
      });
    }
  }
  c.gap(4);

  // --- Checklist ---
  const doneCount = checklistItems.filter((i) => i.isCompleted).length;
  c.sectionHeading(`Lista za pakovanje (${doneCount}/${checklistItems.length} spremno)`);
  if (checklistItems.length === 0) {
    c.emptyNote("Checklist je prazna.");
  } else {
    for (const item of checklistItems) {
      c.row(item.isCompleted ? "[x]" : "[ ]", item.text, { indent: 2 });
    }
  }

  // --- Podnožje: broj strane na svakoj strani ---
  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...INK.muted);
    doc.text(`Strana ${page} / ${totalPages}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 10, { align: "center" });
  }

  const safeName = pdfText(trip.name).replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "plan-putovanja";
  doc.save(`${safeName}.pdf`);
}
