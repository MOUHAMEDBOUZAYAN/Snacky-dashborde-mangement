import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import {
  formatDateTimeFr,
  formatPriceDh,
  formatTimeFr,
  shortId,
} from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/i18n";
import {
  drawSnackyInvoiceHeader,
  drawSnackyPdfFooter,
  PDF_ORANGE,
  PDF_ROW_ALT,
  PDF_TEXT,
  PDF_TEXT_MUTED,
  type JsPdfWithAutoTable,
} from "@/lib/pdf/brand";

import {
  orderCustomerLabel,
  orderStatusLabel,
  orderTypeLabel,
  paymentMethodLabel,
} from "./labels";
import type { Order, OrderItem } from "./types";

export type OrderInvoicePdfAction = "download" | "print";

function itemOptionsLine(item: OrderItem, locale: Locale): string {
  const m = getMessages(locale);
  const parts: string[] = [];
  if (item.size) parts.push(`${m.orderSize}: ${item.size}`);
  if (item.sauce) parts.push(`${m.orderSauce}: ${item.sauce}`);
  if (item.extras.length > 0) {
    parts.push(
      `${m.orderExtras}: ${item.extras.map((e) => e.name).join(", ")}`,
    );
  }
  return parts.join(" · ") || "—";
}

function buildOrderInvoiceDoc(order: Order, locale: Locale): Promise<jsPDF> {
  return (async () => {
    const m = getMessages(locale);
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const marginX = 14;

    const startY = await drawSnackyInvoiceHeader(doc, {
      title: m.orderInvoiceTitle,
      metaLines: [
        `#${shortId(order.id, 10)}`,
        formatDateTimeFr(order.createdAt),
      ],
    });

    let y = startY;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...PDF_TEXT);
    doc.text(m.orderCustomer, marginX, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...PDF_TEXT);
    doc.text(orderCustomerLabel(order.customer, locale), marginX, y);
    y += 5;

    if (order.customer?.phone) {
      doc.setTextColor(...PDF_TEXT_MUTED);
      doc.text(order.customer.phone, marginX, y);
      y += 5;
    }

    y += 2;
    doc.setTextColor(...PDF_TEXT);
    doc.text(
      `${m.orderType}: ${orderTypeLabel(order.type, locale)}`,
      marginX,
      y,
    );
    y += 5;
    doc.text(
      `${m.orderStatus}: ${orderStatusLabel(order.status, locale)}`,
      marginX,
      y,
    );
    y += 5;

    if (order.type === "DELIVERY") {
      const place = order.deliveryAddress?.trim() || "—";
      doc.text(`${m.orderDeliveryPlace}: ${place}`, marginX, y);
      y += 5;
    }

    if (order.scheduledFor) {
      doc.text(
        `${m.orderScheduledFor}: ${formatTimeFr(order.scheduledFor)}`,
        marginX,
        y,
      );
      y += 5;
    }

    y += 3;

    autoTable(doc, {
      startY: y,
      head: [
        [
          m.orderInvoiceItem,
          m.orderInvoiceOptions,
          m.orderInvoiceQty,
          m.orderUnitPrice,
          m.orderInvoiceLineTotal,
        ],
      ],
      body: order.items.map((item) => [
        item.menuItemName,
        itemOptionsLine(item, locale),
        String(item.quantity),
        formatPriceDh(item.unitPrice),
        formatPriceDh(item.unitPrice * item.quantity),
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        textColor: PDF_TEXT,
        fillColor: [255, 255, 255],
        valign: "top",
      },
      headStyles: {
        fillColor: PDF_ORANGE,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: PDF_ROW_ALT, textColor: PDF_TEXT },
      columnStyles: {
        2: { halign: "right", cellWidth: 16 },
        3: { halign: "right", cellWidth: 28 },
        4: { halign: "right", cellWidth: 28 },
      },
    });

    let totalsY =
      (doc as JsPdfWithAutoTable).lastAutoTable?.finalY ?? y;
    totalsY += 8;
    const pageWidth = doc.internal.pageSize.getWidth();
    const rightX = pageWidth - marginX;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...PDF_TEXT);
    doc.text(m.orderTotal, marginX, totalsY);
    doc.setTextColor(...PDF_ORANGE);
    doc.text(formatPriceDh(order.total), rightX, totalsY, { align: "right" });
    totalsY += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...PDF_TEXT);
    doc.text(
      `${m.orderPaymentMethod}: ${paymentMethodLabel(order.paymentMethod, locale)}`,
      marginX,
      totalsY,
    );

    drawSnackyPdfFooter(doc, m.orderInvoiceFooterThanks);

    return doc;
  })();
}

export async function generateOrderInvoicePdf(
  order: Order,
  locale: Locale,
  action: OrderInvoicePdfAction = "download",
): Promise<void> {
  const doc = await buildOrderInvoiceDoc(order, locale);

  if (action === "print") {
    doc.autoPrint();
    const url = doc.output("bloburl");
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  doc.save(`snacky-facture-${shortId(order.id, 10)}.pdf`);
}
