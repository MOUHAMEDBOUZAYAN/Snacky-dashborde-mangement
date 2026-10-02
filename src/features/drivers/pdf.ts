import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { formatDateTimeFr, formatPriceDh, shortId } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { getMessages, localeDateTag } from "@/lib/i18n";
import {
  drawSnackyInvoiceHeader,
  drawSnackyPdfFooter,
  PDF_ORANGE,
  PDF_ROW_ALT,
  PDF_TEXT,
  type JsPdfWithAutoTable,
} from "@/lib/pdf/brand";

import type { Driver, DriverStatementItem, DriverStats } from "./types";

interface GenerateDriverStatementPdfParams {
  driver: Driver;
  stats: DriverStats;
  items: DriverStatementItem[];
  locale: Locale;
  dateFrom?: string;
  dateTo?: string;
}

function formatDateRangeLabel(
  from?: string,
  to?: string,
  locale: Locale = "fr",
): string {
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat(localeDateTag(locale), {
      dateStyle: "medium",
    }).format(new Date(iso));

  if (from && to) return `${fmt(from)} — ${fmt(to)}`;
  if (from) return `${fmt(from)} →`;
  if (to) return `→ ${fmt(to)}`;
  if (locale === "ar") return "كل التواريخ";
  if (locale === "en") return "All dates";
  return "Toutes les dates";
}

export async function generateDriverStatementPdf({
  driver,
  stats,
  items,
  locale,
  dateFrom,
  dateTo,
}: GenerateDriverStatementPdfParams): Promise<void> {
  const m = getMessages(locale);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const startY = await drawSnackyInvoiceHeader(doc, {
    title: m.driversTitle,
    subtitle: driver.fullName,
    metaLines: [
      `${driver.email}`,
      `${driver.phone}`,
      formatDateRangeLabel(dateFrom, dateTo, locale),
    ],
  });

  autoTable(doc, {
    startY,
    head: [
      [
        m.driverStatementOrderId,
        m.driverStatementDate,
        m.driverStatementOrderTotal,
        m.driverStatementCommissionPercent,
        m.driverStatementCommissionAmount,
        m.driverStatementPaidStatus,
      ],
    ],
    body: items.map((item) => [
      shortId(item.orderId, 10),
      formatDateTimeFr(item.completedAt),
      formatPriceDh(item.orderTotal),
      `${item.commissionPercent} %`,
      formatPriceDh(item.commissionAmount),
      item.paidOut ? m.driverStatementPaid : m.driverStatementUnpaid,
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: PDF_TEXT,
      fillColor: [255, 255, 255],
    },
    headStyles: {
      fillColor: PDF_ORANGE,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: PDF_ROW_ALT, textColor: PDF_TEXT },
  });

  const finalY =
    (doc as JsPdfWithAutoTable).lastAutoTable?.finalY ?? startY;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...PDF_TEXT);
  doc.text(
    `${m.driverTotalEarned}: ${formatPriceDh(stats.totalEarned)}`,
    14,
    finalY + 10,
  );
  doc.text(
    `${m.driverPaidAmount}: ${formatPriceDh(stats.paidAmount)}`,
    14,
    finalY + 16,
  );
  doc.setTextColor(185, 28, 28);
  doc.text(
    `${m.driverUnpaidAmount}: ${formatPriceDh(stats.unpaidAmount)}`,
    14,
    finalY + 22,
  );

  drawSnackyPdfFooter(
    doc,
    locale === "ar"
      ? "Snacky — كشف حساب الموصل"
      : locale === "en"
        ? "Snacky — Driver statement"
        : "Snacky — Relevé livreur",
  );

  const slug = driver.fullName.replace(/\s+/g, "-").toLowerCase();
  doc.save(`snacky-releve-${slug}.pdf`);
}
