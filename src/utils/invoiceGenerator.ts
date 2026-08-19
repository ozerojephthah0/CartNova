import { Order } from '../types';

/**
 * Generates a clean, standalone, printable HTML document for an order invoice
 */
export function generateInvoiceHTML(order: Order, formatPrice: (val: number) => string): string {
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = new Date(order.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const itemsRows = order.items
    .map((item, idx) => {
      const variantStr = item.selectedVariant
        ? Object.entries(item.selectedVariant)
            .map(([k, v]) => `${k}: ${v}`)
            .join(' | ')
        : '';

      return `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 16px; font-size: 13px; color: #1e293b; vertical-align: top;">
          <div style="font-weight: 600; color: #0f172a;">${idx + 1}. ${item.productTitle}</div>
          ${item.sellerName ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">Sold by: ${item.sellerName}</div>` : ''}
          ${variantStr ? `<div style="font-size: 11px; color: #4f46e5; margin-top: 2px;">Specs: ${variantStr}</div>` : ''}
        </td>
        <td style="padding: 12px 16px; text-align: center; font-size: 13px; color: #334155; vertical-align: top; font-weight: 500;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 16px; text-align: right; font-size: 13px; color: #334155; vertical-align: top;">
          ${formatPrice(item.unitPrice)}
        </td>
        <td style="padding: 12px 16px; text-align: right; font-size: 13px; color: #0f172a; font-weight: 700; vertical-align: top;">
          ${formatPrice(item.unitPrice * item.quantity)}
        </td>
      </tr>
    `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CartNova Official Tax Invoice - #${order.orderNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      padding: 32px 16px;
      line-height: 1.5;
    }
    
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 28px;
      margin-bottom: 28px;
    }
    
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo-badge {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 900;
      font-size: 20px;
    }
    
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    
    .brand-subtitle {
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .invoice-meta {
      text-align: right;
    }
    
    .invoice-tag {
      display: inline-block;
      background: #eef2ff;
      color: #4f46e5;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 9999px;
      margin-bottom: 6px;
      border: 1px solid #e0e7ff;
    }
    
    .invoice-number {
      font-family: 'JetBrains Mono', monospace;
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
    }
    
    .invoice-date {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }
    
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 28px;
    }
    
    .info-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 16px 20px;
    }
    
    .info-label {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 8px;
    }
    
    .info-name {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }
    
    .info-text {
      font-size: 12px;
      color: #475569;
      line-height: 1.4;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    
    th {
      background: #f8fafc;
      padding: 12px 16px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .totals-area {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 2px solid #f1f5f9;
    }
    
    .totals-table {
      width: 320px;
    }
    
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
      color: #475569;
    }
    
    .totals-row.discount {
      color: #059669;
      font-weight: 600;
    }
    
    .totals-row.grand-total {
      border-top: 2px solid #0f172a;
      margin-top: 8px;
      padding-top: 12px;
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
    }
    
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
    }
    
    .footer {
      margin-top: 36px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #94a3b8;
    }
    
    .actions-bar {
      max-width: 800px;
      margin: 0 auto 20px auto;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    
    .btn {
      padding: 10px 18px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background: #4f46e5;
      color: white;
    }
    
    .btn-primary:hover {
      background: #4338ca;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .invoice-card {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
      .actions-bar {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="actions-bar">
    <button class="btn btn-primary" onclick="window.print()">🖨️ Print or Save as PDF</button>
  </div>

  <div class="invoice-card">
    <!-- Header -->
    <div class="header">
      <div class="brand">
        <div class="logo-badge">CN</div>
        <div>
          <div class="brand-title">CartNova Marketplace</div>
          <div class="brand-subtitle">Official Digital Tax Receipt & Invoice</div>
        </div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-tag">TAX INVOICE</div>
        <div class="invoice-number">#${order.orderNumber}</div>
        <div class="invoice-date">Issued: ${formattedDate} at ${formattedTime}</div>
        <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">TIN: CARTNOVA-NG-9842109</div>
      </div>
    </div>

    <!-- Client & Order Info -->
    <div class="grid-2">
      <div class="info-box">
        <div class="info-label">Customer & Shipping Details</div>
        <div class="info-name">${order.shippingAddress.fullName || order.customerName}</div>
        <div class="info-text">${order.shippingAddress.street}</div>
        <div class="info-text">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}</div>
        <div class="info-text">${order.shippingAddress.country}</div>
        <div class="info-text" style="margin-top: 6px; color: #64748b;">Email: ${order.customerEmail}</div>
        ${order.customerPhone ? `<div class="info-text" style="color: #64748b;">Phone: ${order.customerPhone}</div>` : ''}
      </div>

      <div class="info-box">
        <div class="info-label">Payment & Delivery Summary</div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="font-size: 12px; color: #64748b;">Payment Status:</span>
          <span class="status-badge">✓ ${order.paymentStatus ? order.paymentStatus.toUpperCase() : 'PAID & VERIFIED'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px;">
          <span style="color: #64748b;">Payment Method:</span>
          <span style="font-weight: 700; color: #0f172a; text-transform: uppercase;">${order.paymentMethod.replace('_', ' ')}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px;">
          <span style="color: #64748b;">Delivery Carrier:</span>
          <span style="font-weight: 600; color: #0f172a;">${order.carrier || 'Express Courier Logistics'}</span>
        </div>
        ${
          order.trackingNumber
            ? `<div style="display: flex; justify-content: space-between; font-size: 12px;">
                <span style="color: #64748b;">Tracking ID:</span>
                <span style="font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #4f46e5;">${order.trackingNumber}</span>
              </div>`
            : ''
        }
      </div>
    </div>

    <!-- Line Items Table -->
    <table>
      <thead>
        <tr>
          <th style="text-align: left;">Item Description & Seller</th>
          <th style="text-align: center; width: 80px;">Qty</th>
          <th style="text-align: right; width: 130px;">Unit Price</th>
          <th style="text-align: right; width: 140px;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <!-- Totals Area -->
    <div class="totals-area">
      <div class="totals-table">
        <div class="totals-row">
          <span>Items Subtotal (${order.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
          <span style="font-weight: 600; color: #0f172a;">${formatPrice(order.subtotal)}</span>
        </div>
        ${
          order.discountAmount > 0
            ? `<div class="totals-row discount">
                <span>Discount / Voucher (${order.couponCode || 'PROMO'})</span>
                <span>-${formatPrice(order.discountAmount)}</span>
              </div>`
            : ''
        }
        <div class="totals-row">
          <span>Estimated Tax & VAT (7.5%)</span>
          <span style="font-weight: 600; color: #0f172a;">${formatPrice(order.tax)}</span>
        </div>
        <div class="totals-row">
          <span>Shipping & Courier Handling</span>
          <span style="font-weight: 600; color: ${order.shippingFee === 0 ? '#059669' : '#0f172a'};">
            ${order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee)}
          </span>
        </div>
        <div class="totals-row grand-total">
          <span>Total Amount Paid</span>
          <span style="color: #4f46e5;">${formatPrice(order.totalAmount)}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div>
        <strong>CartNova Technologies Ltd.</strong> • 14 Adeola Odeku St, VI, Lagos, Nigeria<br>
        Support: support@cartnova.com | Web: https://cartnova.app
      </div>
      <div style="text-align: right;">
        Digitally Generated & Verified • Order Ref #${order.orderNumber}<br>
        Thank you for shopping with CartNova!
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Downloads a digital invoice as an HTML file or opens printable view
 */
export function downloadDigitalInvoice(
  order: Order,
  formatPrice: (val: number) => string
): void {
  const htmlContent = generateInvoiceHTML(order, formatPrice);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const fileName = `CartNova_Invoice_${order.orderNumber}.html`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Prints invoice directly via a clean pop-up window
 */
export function printDigitalInvoice(
  order: Order,
  formatPrice: (val: number) => string
): void {
  const htmlContent = generateInvoiceHTML(order, formatPrice);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  }
}
