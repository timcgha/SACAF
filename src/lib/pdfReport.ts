import { jsPDF } from "jspdf";
import type { Answers, SacafData } from "../types";
import {
  TIERS,
  categoriesInOrder,
  categoryAverage,
  formatScore,
  matureItems,
  maturityFor,
  overallAverage,
  recommendationsNeedingAttention,
  tierAverage,
  tierDescription,
} from "./scoring";

function wrap(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight = 5): number {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function ensureSpace(doc: jsPDF, y: number, needed: number, margin = 16): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed <= pageHeight - margin) return y;
  doc.addPage();
  return margin;
}

export function downloadSacafReport(data: SacafData, answers: Answers): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const overall = overallAverage(data.questions, answers);
  const maturity = maturityFor(overall, data);
  const gaps = recommendationsNeedingAttention(data.questions, answers);
  const mature = matureItems(data.questions, answers);
  const categories = categoriesInOrder(data.questions);
  const date = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  doc.setFillColor(11, 63, 58);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(244, 251, 249);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("SACAF Assessment Report", margin, 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Beta ${data.version}  ·  ${date}`, margin, 20);

  y = 38;
  doc.setTextColor(19, 32, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Executive summary", margin, y);
  y += 8;

  doc.setFillColor(243, 247, 246);
  doc.roundedRect(margin, y, contentWidth, 28, 3, 3, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(92, 113, 124);
  doc.text("Overall maturity score", margin + 4, y + 8);
  doc.setTextColor(11, 63, 58);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(formatScore(overall), margin + 4, y + 18);
  doc.setFontSize(11);
  doc.text(maturity ? `${maturity.label} stage` : "", margin + 42, y + 17);
  y += 36;

  if (maturity) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(58, 77, 87);
    y = wrap(doc, maturity.description.replace(/\n+/g, " "), margin, y, contentWidth, 5);
    y += 6;
  }

  y = ensureSpace(doc, y, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(19, 32, 40);
  doc.text("Tier breakdown", margin, y);
  y += 7;

  for (const tier of TIERS) {
    const score = tierAverage(tier, data.questions, answers);
    const desc = tierDescription(tier, score, data);
    y = ensureSpace(doc, y, 22);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`${tier}: ${formatScore(score)} / 3`, margin, y);
    y += 5;
    if (desc) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(58, 77, 87);
      y = wrap(doc, desc.replace(/\n+/g, " "), margin, y, contentWidth, 4.5);
      doc.setTextColor(19, 32, 40);
    }
    y += 4;
  }

  y = ensureSpace(doc, y, 24);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Category averages", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  for (const category of categories) {
    const score = categoryAverage(category, data.questions, answers);
    const tier = data.questions.find((q) => q.category === category)?.tier ?? "";
    y = ensureSpace(doc, y, 6);
    doc.text(`${category} (${tier}) — ${formatScore(score)}`, margin, y);
    y += 5;
  }

  y += 4;
  y = ensureSpace(doc, y, 16);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Recommendations (score below 3)", margin, y);
  y += 7;

  if (gaps.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    y = wrap(doc, "Every control scored a 3.", margin, y, contentWidth);
  } else {
    for (const { question, score, notes } of gaps) {
      y = ensureSpace(doc, y, 28);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(19, 32, 40);
      y = wrap(doc, `Q${question.id}. ${question.question}`, margin, y, contentWidth, 4.8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(92, 113, 124);
      doc.text(`${question.tier} · ${question.category} · Score ${score}`, margin, y);
      y += 5;
      doc.setTextColor(19, 32, 40);
      doc.setFont("helvetica", "bold");
      doc.text("Recommendation", margin, y);
      y += 4;
      doc.setFont("helvetica", "normal");
      y = wrap(doc, question.recommendation.replace(/\n+/g, " "), margin, y, contentWidth, 4.4);
      y += 2;
      doc.setFont("helvetica", "bold");
      doc.text("Impact if not done", margin, y);
      y += 4;
      doc.setFont("helvetica", "normal");
      y = wrap(doc, question.impact, margin, y, contentWidth, 4.4);
      if (notes.trim()) {
        y += 2;
        doc.setFont("helvetica", "bold");
        doc.text("Notes", margin, y);
        y += 4;
        doc.setFont("helvetica", "normal");
        y = wrap(doc, notes, margin, y, contentWidth, 4.4);
      }
      y += 5;
    }
  }

  if (mature.length > 0) {
    y = ensureSpace(doc, y, 16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(19, 32, 40);
    doc.text("Reported as mature (score 3)", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    for (const q of mature) {
      y = ensureSpace(doc, y, 8);
      y = wrap(doc, `Q${q.id}. ${q.question}`, margin, y, contentWidth, 4.4);
      y += 1;
    }
  }

  y = ensureSpace(doc, y, 18);
  doc.setFontSize(8);
  doc.setTextColor(92, 113, 124);
  wrap(
    doc,
    "This tool provides a high-level self-assessment and is not a substitute for professional audits, penetration tests, or expert advice. Informational use only.",
    margin,
    y,
    contentWidth,
    3.8,
  );

  doc.save(`SACAF-Report-Beta-${data.version}.pdf`);
}
