import type { jsPDF } from "jspdf";

/** Brand orange (accent only — never for body text on white). */
export const PDF_ORANGE: [number, number, number] = [234, 88, 12];
/** Near-black body text for high contrast on white. */
export const PDF_TEXT: [number, number, number] = [28, 28, 28];
/** Secondary but still dark (labels, meta). */
export const PDF_TEXT_MUTED: [number, number, number] = [55, 55, 55];
/** Soft orange row stripe (still readable with dark text). */
export const PDF_ROW_ALT: [number, number, number] = [255, 247, 237];

const LOGO_PUBLIC_PATH = "/logo/image.png";

let logoDataUrlPromise: Promise<string | null> | null = null;

/** Load public/logo/image.png as a PNG data URI for jsPDF embedding. */
export function loadSnackyLogoDataUrl(): Promise<string | null> {
  if (!logoDataUrlPromise) {
    logoDataUrlPromise = (async () => {
      try {
        const res = await fetch(LOGO_PUBLIC_PATH);
        if (!res.ok) return null;
        const blob = await res.blob();
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === "string") resolve(reader.result);
            else reject(new Error("Failed to read logo"));
          };
          reader.onerror = () => reject(reader.error ?? new Error("FileReader error"));
          reader.readAsDataURL(blob);
        });
      } catch {
        return null;
      }
    })();
  }
  return logoDataUrlPromise;
}

export interface PdfInvoiceHeaderOptions {
  /** Document title under / beside the brand, e.g. "Facture". */
  title: string;
  /** Optional right-side meta lines (order id, date…). */
  metaLines?: string[];
  /** Optional subtitle under the title (driver name, etc.). */
  subtitle?: string;
  marginX?: number;
}

/**
 * Draws a consistent Snacky invoice header with embedded logo.
 * Returns the Y position below the header for content.
 */
export async function drawSnackyInvoiceHeader(
  doc: jsPDF,
  options: PdfInvoiceHeaderOptions,
): Promise<number> {
  const marginX = options.marginX ?? 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  const logoW = 22;
  const logoH = 22;
  const logoY = 10;
  const textX = marginX + logoW + 4;

  const logo = await loadSnackyLogoDataUrl();
  if (logo) {
    try {
      doc.addImage(logo, "PNG", marginX, logoY, logoW, logoH);
    } catch {
      // Fall through to text-only brand if image embed fails.
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...PDF_ORANGE);
  doc.text("Snacky", textX, logoY + 8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...PDF_TEXT);
  doc.text(options.title, textX, logoY + 15);

  if (options.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...PDF_TEXT);
    doc.text(options.subtitle, textX, logoY + 21);
  }

  if (options.metaLines?.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...PDF_TEXT_MUTED);
    let metaY = logoY + 7;
    for (const line of options.metaLines) {
      doc.text(line, pageWidth - marginX, metaY, { align: "right" });
      metaY += 5;
    }
  }

  const lineY = Math.max(logoY + logoH, logoY + (options.subtitle ? 24 : 18)) + 4;
  doc.setDrawColor(...PDF_ORANGE);
  doc.setLineWidth(0.6);
  doc.line(marginX, lineY, pageWidth - marginX, lineY);

  return lineY + 8;
}

export function drawSnackyPdfFooter(
  doc: jsPDF,
  text: string,
  marginX = 14,
): void {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const y = pageHeight - 14;

  doc.setDrawColor(...PDF_ORANGE);
  doc.setLineWidth(0.4);
  doc.line(marginX, y - 6, pageWidth - marginX, y - 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...PDF_TEXT_MUTED);
  doc.text(text, pageWidth / 2, y, { align: "center" });
}

export type JsPdfWithAutoTable = jsPDF & {
  lastAutoTable?: { finalY: number };
};
