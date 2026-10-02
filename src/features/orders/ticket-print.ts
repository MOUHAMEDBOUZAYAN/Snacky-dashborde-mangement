import { shortId } from "@/lib/format";
import { loadSnackyLogoDataUrl } from "@/lib/pdf/brand";

import type { Order, OrderItem, OrderStatus } from "./types";

const TICKET_STATUS_AR: Record<OrderStatus, string> = {
  PENDING: "قيد الانتظار",
  PREPARING: "قيد التحضير",
  READY: "جاهز للتسليم",
  OUT_FOR_DELIVERY: "قيد التوصيل",
  COMPLETED: "مكتملة",
  CANCELLED: "ملغاة",
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatTicketPrice(amount: number): string {
  return `${parseFloat(Number(amount).toFixed(2))} د`;
}

function formatTicketDateTime(iso: string): { time: string; date: string } {
  const d = new Date(iso);
  return {
    time: new Intl.DateTimeFormat("ar-MA", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d),
    date: new Intl.DateTimeFormat("ar-MA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d),
  };
}

function formatTicketTime(iso: string): string {
  return new Intl.DateTimeFormat("ar-MA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

function itemOptionsHtml(item: OrderItem): string {
  const parts: string[] = [];
  if (item.size) parts.push(item.size);
  if (item.sauce) parts.push(item.sauce);
  for (const extra of item.extras) parts.push(extra.name);
  if (parts.length === 0) return "";
  return `<div class="opts">${escapeHtml(parts.join(" · "))}</div>`;
}

function buildTicketHtml(order: Order, logoDataUrl: string | null): string {
  const { time, date } = formatTicketDateTime(order.createdAt);
  const customerName =
    order.customer?.fullName?.trim() || "زائر";
  const customerPhone = order.customer?.phone?.trim() || "—";
  const place =
    order.type === "DELIVERY"
      ? order.deliveryAddress?.trim() || "—"
      : order.type === "DINE_IN"
        ? "في المكان"
        : "للاستلام";
  const pickupTime = order.scheduledFor
    ? formatTicketTime(order.scheduledFor)
    : "—";

  const rows = order.items
    .map((item) => {
      const lineTotal = item.unitPrice * item.quantity;
      return `
        <tr>
          <td class="col-name">
            <div class="item-name">${escapeHtml(item.menuItemName)}</div>
            ${itemOptionsHtml(item)}
          </td>
          <td class="col-qty">${item.quantity}</td>
          <td class="col-price">${formatTicketPrice(lineTotal)}</td>
        </tr>`;
    })
    .join("");

  const logoBlock = logoDataUrl
    ? `<img class="logo" src="${logoDataUrl}" alt="Snacky" />`
    : `<div class="logo-fallback">Snacky</div>`;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>Ticket ${escapeHtml(shortId(order.id, 10))}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 80mm;
      background: #fff;
      color: #000;
      font-family: "Courier New", Courier, "Segoe UI", Tahoma, Arial, sans-serif;
      font-size: 11px;
      line-height: 1.35;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body { padding: 3mm 3mm 4mm; }
    .ticket { width: 100%; }
    .center { text-align: center; }
    .logo {
      display: block;
      width: 28mm;
      height: auto;
      margin: 0 auto 1.5mm;
      filter: grayscale(1) contrast(1.2);
    }
    .logo-fallback {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: 1mm;
    }
    .brand {
      font-size: 16px;
      font-weight: 800;
      margin: 0;
    }
    .tagline {
      font-size: 9px;
      margin: 0.8mm 0 0;
    }
    .uni {
      font-size: 8px;
      margin: 1mm 0 2mm;
    }
    .rule {
      border: none;
      border-top: 1px dashed #000;
      margin: 2mm 0;
    }
    .rule-solid {
      border: none;
      border-top: 1.5px solid #000;
      margin: 2mm 0;
    }
    .order-no {
      font-size: 13px;
      font-weight: 800;
      margin: 0;
    }
    .meta {
      font-size: 10px;
      margin: 1mm 0 0;
    }
    .status {
      display: inline-block;
      margin-top: 1.5mm;
      padding: 0.8mm 2.5mm;
      border: 1.5px solid #000;
      font-weight: 800;
      font-size: 10px;
    }
    .block { margin: 2mm 0; text-align: right; }
    .row {
      display: flex;
      justify-content: space-between;
      gap: 2mm;
      margin: 0.6mm 0;
    }
    .label { font-weight: 700; white-space: nowrap; }
    .value { text-align: left; word-break: break-word; }
    .section-title {
      font-weight: 800;
      font-size: 11px;
      text-align: center;
      margin: 1.5mm 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    th, td {
      padding: 1mm 0.5mm;
      vertical-align: top;
      font-size: 10px;
    }
    th {
      border-bottom: 1px solid #000;
      font-weight: 800;
      text-align: right;
    }
    th.col-qty, td.col-qty,
    th.col-price, td.col-price {
      text-align: center;
      width: 14mm;
    }
    th.col-price, td.col-price {
      text-align: left;
      width: 18mm;
    }
    .item-name { font-weight: 700; }
    .opts {
      font-size: 8.5px;
      margin-top: 0.4mm;
      opacity: 0.95;
    }
    .total {
      font-size: 13px;
      font-weight: 800;
      text-align: center;
      margin: 2mm 0 1mm;
    }
    .pay {
      text-align: center;
      font-size: 10px;
      margin-bottom: 2mm;
    }
    .footer {
      text-align: center;
      font-size: 9px;
    }
    .footer .thanks { font-weight: 800; margin-bottom: 0.8mm; }
    .footer .keep { margin-bottom: 0.8mm; }
    .footer .web { font-weight: 700; }
    @media print {
      html, body {
        width: 80mm;
        margin: 0 !important;
        padding: 0 !important;
      }
      body { padding: 2mm 2.5mm 3mm !important; }
      .ticket { page-break-inside: avoid; break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="center">
      ${logoBlock}
      <p class="brand">Snacky</p>
      <p class="tagline">ساندويتشات · بيتزا · برغر · مشروبات</p>
      <p class="uni">جامعة السلطان مولاي سليمان · بني ملال</p>
    </div>

    <hr class="rule" />

    <div class="center">
      <p class="order-no">رقم الطلب #${escapeHtml(shortId(order.id, 10))}</p>
      <p class="meta">${escapeHtml(time)} · ${escapeHtml(date)}</p>
      <div class="status">${escapeHtml(TICKET_STATUS_AR[order.status])}</div>
    </div>

    <hr class="rule" />

    <div class="block">
      <div class="row"><span class="label">الاسم</span><span class="value">${escapeHtml(customerName)}</span></div>
      <div class="row"><span class="label">الهاتف</span><span class="value">${escapeHtml(customerPhone)}</span></div>
      <div class="row"><span class="label">نقطة الاستلام</span><span class="value">${escapeHtml(place)}</span></div>
      <div class="row"><span class="label">وقت الاستلام</span><span class="value">${escapeHtml(pickupTime)}</span></div>
    </div>

    <hr class="rule-solid" />
    <p class="section-title">تفاصيل الطلب</p>

    <table>
      <thead>
        <tr>
          <th class="col-name">المنتج</th>
          <th class="col-qty">الكمية</th>
          <th class="col-price">المبلغ</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <hr class="rule-solid" />

    <p class="total">المجموع ${escapeHtml(formatTicketPrice(order.total).replace(" د", ""))} درهم</p>
    <p class="pay">الدفع عند الاستلام</p>

    <hr class="rule" />

    <div class="footer">
      <p class="thanks">شكراً لطلبك من Snacky</p>
      <p class="keep">يرجى الاحتفاظ بهذا الإيصال</p>
      <p class="web">www.snacky.ma</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Opens the browser print dialog with an 80mm Arabic kitchen ticket.
 * User selects the WDLink WD8260 (or any installed thermal printer).
 */
export async function printOrderTicket(order: Order): Promise<void> {
  const logo = await loadSnackyLogoDataUrl();
  const html = buildTicketHtml(order, logo);

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

  const frameWindow = iframe.contentWindow;
  const frameDoc = iframe.contentDocument ?? frameWindow?.document;
  if (!frameWindow || !frameDoc) {
    iframe.remove();
    throw new Error("Unable to create print frame");
  }

  frameDoc.open();
  frameDoc.write(html);
  frameDoc.close();

  await new Promise<void>((resolve) => {
    const done = () => resolve();
    // Images (logo) need a tick to load before print.
    if (frameDoc.readyState === "complete") {
      window.setTimeout(done, 150);
    } else {
      iframe.addEventListener("load", () => window.setTimeout(done, 150), {
        once: true,
      });
    }
  });

  try {
    frameWindow.focus();
    frameWindow.print();
  } finally {
    window.setTimeout(() => iframe.remove(), 1000);
  }
}
