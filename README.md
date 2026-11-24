# SACAF

**Simple AI Cybersecurity Assessment Framework** — a free checklist to gauge AI security maturity in about 20–30 minutes.

## Web app

This repository includes a browser version of the Beta 0.6 assessment spreadsheet.

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

- Answer all 30 questions on a **0–3** scale
- Optional org notes per question
- Progress is saved in your browser (`localStorage`)
- Generate a report with overall / tier / category scores and recommendations for anything scored below 3
- Print or save as PDF from the report view

```bash
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Scoring

| Score | Meaning |
|------:|---------|
| 0 | Not implemented or unknown |
| 1 | Planned or in early discussion |
| 2 | Partially implemented, not consistent or org-wide |
| 3 | Fully implemented and verified org-wide |

Maturity bands (overall and per tier):

- **Initial** — under 1.5
- **Developing** — 1.5 to under 2.5
- **Optimized** — 2.5 to 3.0

Overall score is the average of the three tier averages (Foundational, Operational, Advanced).

## Spreadsheet

`SACAF_Assessment_Beta_0.6.xlsx` remains the original workbook source for questions, recommendations, and rubric text.

## Disclaimers

This tool is a high-level self-assessment, not a substitute for professional audits, penetration tests, or expert advice. Results depend on honest answers. Informational use only.

## Feedback

- bulrush.harp.2t@icloud.com
- https://www.linkedin.com/in/logansimpson-cybersecurity

Created by Logan Simpson, July 2025. Free to use under the MIT License / Creative Commons intent described in the original materials.
