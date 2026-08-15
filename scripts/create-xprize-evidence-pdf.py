from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Image, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "got2get2work-xprize-production-evidence.pdf"
ICON = ROOT / "assets" / "branding" / "g2w-app-icon.png"

NAVY = colors.HexColor("#0B1837")
BLUE = colors.HexColor("#1456D9")
PURPLE = colors.HexColor("#6D3EF2")
INK = colors.HexColor("#172033")
MUTED = colors.HexColor("#566179")
PALE = colors.HexColor("#F2F5FB")
GREEN = colors.HexColor("#147D64")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="TitleWhite", parent=styles["Title"], textColor=colors.white, fontSize=28, leading=33, alignment=TA_CENTER, spaceAfter=10))
styles.add(ParagraphStyle(name="SubtitleWhite", parent=styles["BodyText"], textColor=colors.HexColor("#DBE6FF"), fontSize=12, leading=18, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="H1x", parent=styles["Heading1"], textColor=NAVY, fontSize=21, leading=25, spaceBefore=4, spaceAfter=12))
styles.add(ParagraphStyle(name="H2x", parent=styles["Heading2"], textColor=BLUE, fontSize=14, leading=18, spaceBefore=9, spaceAfter=5))
styles.add(ParagraphStyle(name="Bodyx", parent=styles["BodyText"], textColor=INK, fontSize=9.6, leading=14, spaceAfter=7))
styles.add(ParagraphStyle(name="Smallx", parent=styles["BodyText"], textColor=MUTED, fontSize=8, leading=11))
styles.add(ParagraphStyle(name="Callout", parent=styles["BodyText"], textColor=NAVY, backColor=PALE, borderColor=colors.HexColor("#CAD7F2"), borderWidth=0.7, borderPadding=9, fontSize=9.5, leading=14, spaceBefore=6, spaceAfter=10))


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#D8DFEC"))
    canvas.line(0.65 * inch, 0.55 * inch, 7.85 * inch, 0.55 * inch)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(0.65 * inch, 0.35 * inch, "Got2Get2Work - Build with Gemini XPRIZE production evidence")
    canvas.drawRightString(7.85 * inch, 0.35 * inch, f"Page {doc.page}")
    canvas.restoreState()


def bullet(text):
    return Paragraph(f"<font color='#1456D9'>&#8226;</font> {text}", styles["Bodyx"])


def status_table(rows):
    table = Table([[Paragraph("Evidence", styles["Smallx"]), Paragraph("Verified status", styles["Smallx"])]] + [[Paragraph(a, styles["Bodyx"]), Paragraph(b, styles["Bodyx"])] for a, b in rows], colWidths=[2.2 * inch, 4.65 * inch], repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#CCD6E8")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PALE]),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return table


OUTPUT.parent.mkdir(parents=True, exist_ok=True)
doc = SimpleDocTemplate(str(OUTPUT), pagesize=letter, rightMargin=0.65 * inch, leftMargin=0.65 * inch, topMargin=0.65 * inch, bottomMargin=0.72 * inch, title="Got2Get2Work XPRIZE Production Evidence", author="Got2Get2Work")
story = []

cover = Table([[Image(str(ICON), 1.3 * inch, 1.3 * inch)], [Paragraph("Got2Get2Work", styles["TitleWhite"])], [Paragraph("Build with Gemini XPRIZE - Production Evidence Pack", styles["SubtitleWhite"])], [Spacer(1, 0.12 * inch)], [Paragraph("Prepared August 15, 2026", styles["SubtitleWhite"])]], colWidths=[7.2 * inch], rowHeights=[1.6 * inch, 0.55 * inch, 0.48 * inch, 0.18 * inch, 0.3 * inch])
cover.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), NAVY), ("ALIGN", (0, 0), (-1, -1), "CENTER"), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("BOX", (0, 0), (-1, -1), 0, NAVY)]))
story += [cover, Spacer(1, 0.25 * inch), Paragraph("Purpose and evidence boundary", styles["H1x"]), Paragraph("This pack summarizes verified implementation, deployment, testing, and governance evidence for the Got2Get2Work submission. It does not replace the separately required Google Cloud invoices, Gemini observability screenshots, profit-and-loss file, customer evidence, or public demonstration video.", styles["Callout"]), Paragraph("Public surfaces", styles["H2x"]), bullet("Marketing site: https://got2get2work.com/"), bullet("Isolated fictional demonstration: https://destr0yering.github.io/got2get2work/"), bullet("Submission branch: https://github.com/Destr0yering/got2get2work/tree/codex/openrouter-employer-console"), Paragraph("Truth standard", styles["H2x"]), Paragraph("Fictional demo identities and metrics are not users, customers, revenue, or measured outcomes. Financial and traction values must be supplied from verifiable records in the official form.", styles["Bodyx"]), PageBreak()]

story += [Paragraph("1. Production architecture", styles["H1x"]), Paragraph("Got2Get2Work uses a decoupled, typed application architecture designed for an Android-first closed beta and an employer administration surface.", styles["Bodyx"]), status_table([
    ("Client", "Expo / React Native / TypeScript application with production web export and Android build path."),
    ("API", "Typed Fastify services with modular membership, commute, matching, ride, trip, reporting, and operations boundaries."),
    ("Identity", "Firebase Authentication with verified-email enforcement and revocation-aware token validation."),
    ("Data", "Cloud Firestore with tenant-scoped repositories and transactional safety-critical mutations."),
    ("Runtime", "Containerized Google Cloud Run services with dedicated service accounts and bounded concurrency."),
    ("Secrets", "Google Secret Manager references for server-only cryptographic material."),
    ("AI", "Server-side Gemini site coordinator operating on allowlisted aggregate facts."),
]), Spacer(1, 0.15 * inch), Paragraph("Deployed services observed during launch hardening", styles["H2x"]), bullet("Employer Admin API: got2get2work-admin-api in us-east1."), bullet("Employer console: got2get2work-console in us-east1."), bullet("API readiness reported configuration: ready."), bullet("Console revision got2get2work-console-00003-6lm served 100 percent of traffic after signup repair."), Paragraph("The runtime identity was granted only the read-only Firebase Authentication permission needed for revoked-session checks, plus datastore and explicitly scoped secret access. Public invocation still crosses application-level Firebase authorization.", styles["Bodyx"]), PageBreak()]

story += [Paragraph("2. AI-native operation and governance", styles["H1x"]), Paragraph("Gemini is used as a privacy-limited site coordinator rather than as the authority for rider eligibility or safety.", styles["Bodyx"]), status_table([
    ("Input boundary", "Allowlisted aggregate program facts; no names, emails, addresses, messages, precise routes, plates, or individual attendance."),
    ("Output contract", "Structured recommendation using server-owned action codes and cited aggregate fact identifiers."),
    ("Validation", "Server validates the response and rejects unsupported actions or fact references before display."),
    ("Human authority", "Employer administrators retain approval, spending, roster, and pilot decisions."),
    ("Deterministic authority", "Policy code controls membership, matching hard gates, blocks, safety restrictions, consent, and state transitions."),
    ("Availability", "A visibly labeled deterministic fallback preserves service when Gemini is unavailable."),
]), Spacer(1, 0.15 * inch), Paragraph("AI decisions Gemini is not permitted to make", styles["H2x"]), bullet("Approve or reject a worker or employer membership."), bullet("Override a safety report, block, restriction, or consent decision."), bullet("Reveal precise personal information or contact a worker."), bullet("Authorize employer spending, reimbursement, or incentives."), bullet("Guarantee transportation, attendance, or ride completion."), Paragraph("The required Devpost evidence upload should append a sanitized Gemini observability screenshot and a redacted execution trace demonstrating the live production call.", styles["Callout"]), PageBreak()]

story += [Paragraph("3. Verification record", styles["H1x"]), Paragraph("The following checks were recorded during the production hardening and launch process. Counts are test executions, not customer traction.", styles["Bodyx"]), status_table([
    ("Application tests", "44 of 44 passed after the email-verification signup repair."),
    ("API tests", "53 of 53 passed after moderation, restriction, idempotency, and transaction hardening."),
    ("Server tests", "26 of 26 passed in the full validation run."),
    ("Website tests", "3 of 3 passed with lint."),
    ("Firestore emulator", "6 of 6 concurrency, rules, and index checks passed."),
    ("Type safety", "Frontend and API TypeScript checks passed."),
    ("Exports", "Expo web and Android production exports completed in the full validation run."),
    ("Live bundle", "Public console returned HTTP 200 and contained the deployed resumable email-verification flow."),
]), Spacer(1, 0.15 * inch), Paragraph("Security controls verified in code and tests", styles["H2x"]), bullet("Recent authentication and MFA are required for privileged moderation and employer mutations."), bullet("Restriction, decision, case state, and audit writes are transactionally coordinated."), bullet("Ride creation and captain acceptance recheck safety restrictions inside Firestore transactions."), bullet("Privacy request idempotency and moderation state/version conflicts are guarded."), bullet("Safety narratives remain in restricted evidence records rather than general case documents."), Paragraph("Latest submission package commit at the time of generation: c8db082 on codex/openrouter-employer-console.", styles["Smallx"]), PageBreak()]

story += [Paragraph("4. Submission evidence still required", styles["H1x"]), Paragraph("This document is supporting evidence. The official form separately requires the items below.", styles["Bodyx"]), status_table([
    ("Google Cloud invoices", "Missing from this pack. Export monthly PDF invoices or zero-dollar/free-tier cost statements for the competition period."),
    ("Gemini observability", "Missing from this pack. Capture sanitized production model dashboards and API usage evidence."),
    ("P&L", "Missing from this pack. Upload an accurate PDF/PNG/JPG using verified revenue and expense records."),
    ("Revenue", "Must be disclosed by month, including zero values and related-party revenue."),
    ("Users and customers", "Must use verifiable counts and permissioned evidence; fictional demo users do not count."),
    ("Video", "Required public YouTube or Vimeo demonstration under three minutes."),
    ("Repository access", "Confirm testing@devpost.com and judging@hacker.fund can access the linked code."),
]), Spacer(1, 0.18 * inch), Paragraph("Evidence handling", styles["H2x"]), Paragraph("Redact secrets, action links, passwords, tokens, private email addresses, precise locations, customer contact information not expressly authorized for judging, and billing identifiers not needed to prove the claim. Preserve original source files privately in case Devpost requests verification.", styles["Bodyx"]), Paragraph("No claim in this pack should be interpreted as a transportation guarantee, employer attendance record, insurance determination, or proof of commercial traction.", styles["Callout"])]

doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUTPUT)
