import { loadSnackyLogoDataUrl } from "@/lib/pdf/brand";

import type { Order, OrderItem } from "./types";

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
  const customerName = order.customer?.fullName?.trim() || "زائر";
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
  const orderNumber =
    order.orderNumber != null ? String(order.orderNumber) : "—";
  const totalAmount = escapeHtml(
    formatTicketPrice(order.total).replace(" د", ""),
  );

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
    : "";

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>Ticket #${escapeHtml(orderNumber)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    * { box-sizing: border-box; }
    html {
      margin: 0;
      padding: 0;
      background: #fff;
    }
    body {
      width: 72mm; /* 80mm ناقص الهوامش */
      margin: 0 auto;
      padding: 5px;
      direction: rtl;
      font-family: "Cairo", Tahoma, "Segoe UI", Arial, sans-serif;
      font-size: 12px;
      font-weight: 700;
      line-height: 1.45;
      color: #000;
      background: #fff;
      word-wrap: break-word;
      white-space: normal;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .ticket {
      width: 100%;
      overflow: hidden;
    }
    .center { text-align: center; }
    .logo {
      display: block;
      width: 28mm;
      height: auto;
      margin: 0 auto 2mm;
      filter: grayscale(1) contrast(1.25);
    }
    .brand {
      font-size: 24px;
      font-weight: 900;
      margin: 0;
      letter-spacing: 0.3px;
    }
    .tagline {
      font-size: 11px;
      font-weight: 700;
      margin: 1.5mm 0 0;
    }
    .uni {
      font-size: 10px;
      font-weight: 600;
      margin: 1.2mm 0 2mm;
    }
    .rule {
      border: none;
      border-top: 1.5px dashed #000;
      margin: 2.5mm 0;
    }
    .rule-solid {
      border: none;
      border-top: 2px solid #000;
      margin: 2.5mm 0;
    }
    .order-label {
      font-size: 13px;
      font-weight: 700;
      margin: 0;
    }
    .order-no {
      font-size: 30px;
      font-weight: 900;
      margin: 1mm 0 0;
      letter-spacing: 0.5px;
    }
    .meta {
      font-size: 12px;
      font-weight: 700;
      margin: 1.8mm 0 0;
    }
    .block { margin: 2.5mm 0; text-align: right; font-size: 12px; }
    .row {
      display: flex;
      justify-content: space-between;
      gap: 2mm;
      margin: 1mm 0;
    }
    .label { font-weight: 800; white-space: nowrap; }
    .value {
      text-align: left;
      word-break: break-word;
      overflow-wrap: anywhere;
      font-weight: 700;
    }
    .section-title {
      font-weight: 800;
      font-size: 13px;
      text-align: center;
      margin: 2mm 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      word-wrap: break-word;
    }
    th, td {
      padding: 1.5mm 0.5mm;
      vertical-align: top;
      font-size: 12px;
      font-weight: 700;
      word-wrap: break-word;
      overflow-wrap: anywhere;
    }
    th {
      border-bottom: 2px solid #000;
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
    .item-name { font-weight: 800; font-size: 12px; }
    .opts {
      font-size: 10px;
      font-weight: 600;
      margin-top: 0.6mm;
    }
    .total {
      font-size: 17px;
      font-weight: 900;
      text-align: center;
      margin: 2.5mm 0 1.5mm;
    }
    .pay {
      text-align: center;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 2.5mm;
    }
    .footer {
      text-align: center;
      font-size: 11px;
      font-weight: 700;
    }
    .footer .thanks { font-weight: 800; font-size: 12px; margin-bottom: 1mm; }
    .footer .keep { font-weight: 600; margin-bottom: 1mm; }
    .footer .web { font-weight: 800; }
    @media print {
      html, body {
        margin: 0 !important;
        background: #fff;
      }
      body {
        width: 72mm !important;
        margin: 0 auto !important;
        padding: 5px !important;
      }
      .ticket {
        width: 100%;
        overflow: hidden;
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="center">
      ${logoBlock}
      <p class="brand">Snacky</p>
      <p class="tagline">طاكوس · ساندويتش · باستيشيو · مشروبات</p>
      <p class="uni">جامعة السلطان مولاي سليمان · بني ملال</p>
    </div>

    <hr class="rule" />

    <div class="center">
      <p class="order-label">رقم الطلب</p>
      <p class="order-no">#${escapeHtml(orderNumber)}</p>
      <p class="meta">${escapeHtml(time)} · ${escapeHtml(date)}</p>
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

    <p class="total">المجموع ${totalAmount} درهم</p>
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
    const finish = () => resolve();
    const waitFontsThen = () => {
      const fonts = frameDoc.fonts;
      if (fonts?.ready) {
        void fonts.ready.then(() => window.setTimeout(finish, 80));
      } else {
        window.setTimeout(finish, 250);
      }
    };
    if (frameDoc.readyState === "complete") {
      waitFontsThen();
    } else {
      iframe.addEventListener("load", waitFontsThen, { once: true });
    }
  });

  try {
    frameWindow.focus();
    frameWindow.print();
  } finally {
    window.setTimeout(() => iframe.remove(), 1000);
  }
}
