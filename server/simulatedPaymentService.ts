import nodemailer from "nodemailer";

export type SimulatedPaymentStatus =
  | "TEST_PENDING"
  | "TEST_RECEIVED"
  | "TEST_COMPLETED"
  | "TEST_FAILED"
  | "TEST_EXPIRED";

export interface SimulatedTransactionItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface SimulatedEmailAlert {
  recipient: string;
  sent: boolean;
  sentAt?: string;
  subject: string;
  status: "SENT" | "SIMULATED_DISPATCH" | "QUEUED" | "FAILED";
  messageId?: string;
  error?: string;
  htmlBody?: string;
  rawText?: string;
}

export interface SimulatedTransactionTimelineEvent {
  status: SimulatedPaymentStatus;
  timestamp: string;
  note: string;
}

export interface SimulatedTransaction {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: SimulatedPaymentStatus;
  items: SimulatedTransactionItem[];
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  isTestMode: boolean;
  emailAlert: SimulatedEmailAlert;
  timeline: SimulatedTransactionTimelineEvent[];
}

export interface SimulatedPaymentConfig {
  adminEmail: string;
  enableAutoAlerts: boolean;
  enableFiveMinuteWindow: boolean;
  autoExpireSeconds: number;
  simulationSpeed: "realtime" | "accelerated";
  demoBannerEnabled: boolean;
  smtpConfigured: boolean;
}

// In-Memory store initialized with realistic initial simulated transactions
let paymentConfig: SimulatedPaymentConfig = {
  adminEmail: process.env.ADMIN_ALERT_GMAIL || "ozerojephthah0@gmail.com",
  enableAutoAlerts: true,
  enableFiveMinuteWindow: true,
  autoExpireSeconds: 300, // 5 minutes
  simulationSpeed: "realtime",
  demoBannerEnabled: true,
  smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
};

const now = Date.now();

let simulatedTransactions: SimulatedTransaction[] = [
  {
    id: `TEST-TXN-${now - 3600000}-4821`,
    orderId: "ord-seed-01",
    orderNumber: "CN-9042",
    customerName: "Alex Vance",
    customerEmail: "alex.vance@example.com",
    amount: 1299.0,
    currency: "USD",
    paymentMethod: "TEST_CREDIT_CARD",
    status: "TEST_COMPLETED",
    items: [
      {
        id: "prod-1",
        title: "Titanium Pro Tandem OLED iPad 13-inch (M4)",
        price: 1299.0,
        quantity: 1,
      },
    ],
    createdAt: new Date(now - 3600000).toISOString(),
    updatedAt: new Date(now - 3300000).toISOString(),
    expiresAt: new Date(now - 3300000).toISOString(),
    isTestMode: true,
    emailAlert: {
      recipient: paymentConfig.adminEmail,
      sent: true,
      sentAt: new Date(now - 3600000).toISOString(),
      subject: "CartNova — TEST PAYMENT ALERT — Order #CN-9042 [SIMULATED TRANSACTION]",
      status: "SIMULATED_DISPATCH",
      messageId: `<test-sim-${now - 3600000}@cartnova.dev>`,
      htmlBody: "",
      rawText: "TEST PAYMENT ALERT: Order #CN-9042 for $1,299.00 has been recorded in DEMO/TEST mode.",
    },
    timeline: [
      {
        status: "TEST_PENDING",
        timestamp: new Date(now - 3600000).toISOString(),
        note: "Simulated checkout initiated by customer",
      },
      {
        status: "TEST_RECEIVED",
        timestamp: new Date(now - 3595000).toISOString(),
        note: "Test payment authorization simulated successfully",
      },
      {
        status: "TEST_COMPLETED",
        timestamp: new Date(now - 3300000).toISOString(),
        note: "5-Minute Test Window elapsed: Transaction marked TEST_COMPLETED",
      },
    ],
  },
  {
    id: `TEST-TXN-${now - 1200000}-9914`,
    orderId: "ord-seed-02",
    orderNumber: "CN-9088",
    customerName: "Sophia Lin",
    customerEmail: "sophia.lin@example.com",
    amount: 349.99,
    currency: "USD",
    paymentMethod: "SIMULATED_INSTANT_TRANSFER",
    status: "TEST_RECEIVED",
    items: [
      {
        id: "prod-2",
        title: "Studio ANC Active Noise-Canceling Wireless Headphones",
        price: 349.99,
        quantity: 1,
      },
    ],
    createdAt: new Date(now - 1200000).toISOString(),
    updatedAt: new Date(now - 1200000).toISOString(),
    expiresAt: new Date(now + 180000).toISOString(),
    isTestMode: true,
    emailAlert: {
      recipient: paymentConfig.adminEmail,
      sent: true,
      sentAt: new Date(now - 1200000).toISOString(),
      subject: "CartNova — TEST PAYMENT ALERT — Order #CN-9088 [SIMULATED TRANSACTION]",
      status: "SIMULATED_DISPATCH",
      messageId: `<test-sim-${now - 1200000}@cartnova.dev>`,
      htmlBody: "",
      rawText: "TEST PAYMENT ALERT: Order #CN-9088 for $349.99 recorded in DEMO mode.",
    },
    timeline: [
      {
        status: "TEST_PENDING",
        timestamp: new Date(now - 1200000).toISOString(),
        note: "Simulated checkout initiated",
      },
      {
        status: "TEST_RECEIVED",
        timestamp: new Date(now - 1198000).toISOString(),
        note: "Test alert dispatched to admin Gmail",
      },
    ],
  },
];

// Helper to generate the exact HTML email
export function generateTestPaymentAlertHtml(
  txn: SimulatedTransaction,
  adminEmail: string
): { subject: string; html: string; text: string } {
  const subject = `CartNova — TEST PAYMENT ALERT — Order #${txn.orderNumber} [SIMULATED TRANSACTION]`;

  const itemsRows = txn.items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px 12px; font-size: 13px; color: #1e293b; font-weight: 500;">
        ${escapeHtml(item.title)}
      </td>
      <td style="padding: 10px 12px; font-size: 13px; color: #475569; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px 12px; font-size: 13px; color: #475569; text-align: right; font-family: monospace;">
        ${txn.currency === "NGN" ? "₦" : "$"}${item.price.toFixed(2)}
      </td>
      <td style="padding: 10px 12px; font-size: 13px; color: #0f172a; font-weight: 700; text-align: right; font-family: monospace;">
        ${txn.currency === "NGN" ? "₦" : "$"}${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>`
    )
    .join("");

  const formattedDate = new Date(txn.createdAt).toUTCString();
  const formattedAmount = `${txn.currency === "NGN" ? "₦" : "$"}${txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Top Test Notice Banner -->
          <tr>
            <td style="background-color: #dc2626; padding: 14px 20px; text-align: center;">
              <p style="margin: 0; color: #ffffff; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;">
                ⚠️ [DEMO / TEST MODE ONLY — NO REAL FUNDS OR FINANCIAL DATA]
              </p>
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 24px 28px; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); text-align: left;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <span style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em;">
                      CartNova Sandbox Engine
                    </span>
                    <h1 style="margin: 8px 0 4px 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.02em;">
                      Simulated Payment Notification
                    </h1>
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                      Order Reference: <strong style="color: #38bdf8; font-family: monospace;">#${txn.orderNumber}</strong>
                    </p>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 11px; font-weight: 800; padding: 6px 12px; border-radius: 20px; text-transform: uppercase;">
                      ${txn.status}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Mandatory Non-Banking Simulation Disclaimer -->
          <tr>
            <td style="padding: 16px 28px; background-color: #fffbeb; border-bottom: 1px solid #fef3c7;">
              <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 1.5;">
                <strong>IMPORTANT NOTICE:</strong> This is an automated developer test alert generated by CartNova's sandbox simulation engine.
                <strong>This is NOT a genuine bank, OPay, or financial institution notification.</strong> No real money has been credited, deposited, or transferred to any bank account. No real card details, PINs, or credentials were utilized.
              </p>
            </td>
          </tr>

          <!-- Transaction Summary Grid -->
          <tr>
            <td style="padding: 24px 28px;">
              <h2 style="margin: 0 0 14px 0; font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">
                Simulated Transaction Details
              </h2>
              
              <table role="presentation" width="100%" style="border: 1px solid #e2e8f0; border-radius: 10px; border-collapse: separate; border-spacing: 0; overflow: hidden;">
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px 14px; font-size: 12px; color: #64748b; font-weight: 600; width: 40%; border-bottom: 1px solid #e2e8f0;">
                    Simulated Transaction Ref
                  </td>
                  <td style="padding: 10px 14px; font-size: 12px; color: #0f172a; font-family: monospace; font-weight: 700; border-bottom: 1px solid #e2e8f0;">
                    ${txn.id}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; font-size: 12px; color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0;">
                    Order Number / ID
                  </td>
                  <td style="padding: 10px 14px; font-size: 12px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">
                    #${txn.orderNumber} (${txn.orderId})
                  </td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px 14px; font-size: 12px; color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0;">
                    Simulated Total Amount
                  </td>
                  <td style="padding: 10px 14px; font-size: 15px; color: #059669; font-weight: 800; font-family: monospace; border-bottom: 1px solid #e2e8f0;">
                    ${formattedAmount} <span style="font-size: 10px; color: #64748b; font-weight: normal;">(TEST CREDIT)</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; font-size: 12px; color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0;">
                    Payment Method
                  </td>
                  <td style="padding: 10px 14px; font-size: 12px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">
                    ${txn.paymentMethod.replace(/_/g, " ")} (Simulated Sandbox)
                  </td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px 14px; font-size: 12px; color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0;">
                    Customer Profile
                  </td>
                  <td style="padding: 10px 14px; font-size: 12px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    <strong>${escapeHtml(txn.customerName)}</strong> &lt;${escapeHtml(txn.customerEmail)}&gt;
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; font-size: 12px; color: #64748b; font-weight: 600;">
                    Transaction Timestamp
                  </td>
                  <td style="padding: 10px 14px; font-size: 12px; color: #0f172a;">
                    ${formattedDate}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Purchased Table -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <h2 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">
                Purchased Items (${txn.items.length})
              </h2>

              <table role="presentation" width="100%" style="border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px;">
                <thead>
                  <tr style="background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
                    <th style="padding: 8px 12px; font-size: 11px; text-align: left; color: #64748b; font-weight: 700; text-transform: uppercase;">Item</th>
                    <th style="padding: 8px 12px; font-size: 11px; text-align: center; color: #64748b; font-weight: 700; text-transform: uppercase;">Qty</th>
                    <th style="padding: 8px 12px; font-size: 11px; text-align: right; color: #64748b; font-weight: 700; text-transform: uppercase;">Unit Price</th>
                    <th style="padding: 8px 12px; font-size: 11px; text-align: right; color: #64748b; font-weight: 700; text-transform: uppercase;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
                <tfoot>
                  <tr style="background-color: #f8fafc;">
                    <td colspan="3" style="padding: 10px 12px; text-align: right; font-size: 12px; font-weight: 700; color: #334155;">
                      Simulated Order Total:
                    </td>
                    <td style="padding: 10px 12px; text-align: right; font-size: 14px; font-weight: 800; color: #0f172a; font-family: monospace;">
                      ${formattedAmount}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </td>
          </tr>

          <!-- 5-Minute Test Window Notice -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <div style="background-color: #e0e7ff; border: 1px solid #c7d2fe; border-radius: 10px; padding: 12px 16px;">
                <p style="margin: 0; font-size: 12px; color: #3730a3; line-height: 1.4;">
                  ⏱️ <strong>5-Minute Test Window:</strong> This simulated transaction will remain in state <code>${txn.status}</code> and automatically progress according to CartNova's automated sandbox testing cycle at <strong>${new Date(txn.expiresAt).toLocaleTimeString()}</strong>.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b;">
                Admin Recipient: <strong>${escapeHtml(adminEmail)}</strong> | Dispatch Engine: <strong>CartNova Dev Sandbox</strong>
              </p>
              <p style="margin: 0; font-size: 10px; color: #94a3b8;">
                This simulated message was generated automatically. Please do not reply with passwords, banking numbers, or payment keys.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `[DEMO / TEST MODE ONLY - NO REAL FUNDS]
CartNova — TEST PAYMENT ALERT — Order #${txn.orderNumber}
=========================================================
NOTICE: This is an automated developer test alert. No real funds or banking accounts were touched.

Simulated Txn ID: ${txn.id}
Order Number: #${txn.orderNumber}
Status: ${txn.status}
Customer: ${txn.customerName} (${txn.customerEmail})
Amount: ${formattedAmount}
Payment Method: ${txn.paymentMethod}
Timestamp: ${formattedDate}
Items:
${txn.items.map((i) => `- ${i.title} (x${i.quantity}) - $${i.price.toFixed(2)}`).join("\n")}

Total: ${formattedAmount}
Recipient: ${adminEmail}
=========================================================
CartNova Sandbox Developer Environment`;

  return { subject, html, text };
}

function escapeHtml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Dispatch email via nodemailer or realistic simulated dispatcher
export async function dispatchSimulatedPaymentAlert(
  txn: SimulatedTransaction
): Promise<SimulatedEmailAlert> {
  const targetEmail = paymentConfig.adminEmail;
  const { subject, html, text } = generateTestPaymentAlertHtml(txn, targetEmail);

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || `CartNova Sandbox <alerts@cartnova.dev>`;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: smtpFrom,
        to: targetEmail,
        subject,
        text,
        html,
      });

      console.log(`[SMTP SUCCESS] Sent test alert to ${targetEmail}, messageId: ${info.messageId}`);
      return {
        recipient: targetEmail,
        sent: true,
        sentAt: new Date().toISOString(),
        subject,
        status: "SENT",
        messageId: info.messageId,
        htmlBody: html,
        rawText: text,
      };
    } catch (err: any) {
      console.warn("[SMTP ERROR - Falling back to Simulated Dispatch]", err.message);
      return {
        recipient: targetEmail,
        sent: true,
        sentAt: new Date().toISOString(),
        subject,
        status: "SIMULATED_DISPATCH",
        messageId: `<simulated-${Date.now()}@cartnova.dev>`,
        error: `SMTP config attempted (${err.message}). Recorded in Simulated Mail Ledger.`,
        htmlBody: html,
        rawText: text,
      };
    }
  }

  // Pure Server-side Simulated Dispatch
  const simulatedMessageId = `<test-sim-${Date.now()}-${Math.floor(Math.random() * 10000)}@cartnova.dev>`;
  console.log(`[SIMULATED ALERT DISPATCH] Prepared test payment alert for ${targetEmail}. Message ID: ${simulatedMessageId}`);

  return {
    recipient: targetEmail,
    sent: true,
    sentAt: new Date().toISOString(),
    subject,
    status: "SIMULATED_DISPATCH",
    messageId: simulatedMessageId,
    htmlBody: html,
    rawText: text,
  };
}

// Auto-expiry / 5-minute lifecycle manager
export function runLifecycleCheck() {
  if (!paymentConfig.enableFiveMinuteWindow) return;

  const currentTime = Date.now();
  let updatedCount = 0;

  simulatedTransactions = simulatedTransactions.map((txn) => {
    if (txn.status === "TEST_RECEIVED" || txn.status === "TEST_PENDING") {
      const expTime = new Date(txn.expiresAt).getTime();
      if (currentTime >= expTime) {
        updatedCount++;
        const newStatus: SimulatedPaymentStatus = "TEST_COMPLETED";
        const newTimeline = [
          ...txn.timeline,
          {
            status: newStatus,
            timestamp: new Date().toISOString(),
            note: "5-Minute Test Window elapsed: Automatically settled in DEMO/TEST sandbox mode",
          },
        ];
        return {
          ...txn,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          timeline: newTimeline,
        };
      }
    }
    return txn;
  });

  if (updatedCount > 0) {
    console.log(`[LIFECYCLE MANAGER] Updated ${updatedCount} transactions after 5-minute test window.`);
  }
}

// Lifecycle interval running every 15 seconds
setInterval(runLifecycleCheck, 15000);

export function getAllSimulatedTransactions(): {
  transactions: SimulatedTransaction[];
  config: SimulatedPaymentConfig;
} {
  return {
    transactions: simulatedTransactions,
    config: paymentConfig,
  };
}

export function createSimulatedTransaction(data: {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  items: SimulatedTransactionItem[];
  initialStatus?: SimulatedPaymentStatus;
}): Promise<SimulatedTransaction> {
  const txId = `TEST-TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const createdAt = new Date().toISOString();
  const expireDurationMs = (paymentConfig.autoExpireSeconds || 300) * 1000;
  const expiresAt = new Date(Date.now() + expireDurationMs).toISOString();
  const initialStatus = data.initialStatus || "TEST_RECEIVED";

  const newTxn: SimulatedTransaction = {
    id: txId,
    orderId: data.orderId,
    orderNumber: data.orderNumber,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    amount: data.amount,
    currency: data.currency || "USD",
    paymentMethod: data.paymentMethod || "TEST_CHECKOUT",
    status: initialStatus,
    items: data.items || [],
    createdAt,
    updatedAt: createdAt,
    expiresAt,
    isTestMode: true,
    emailAlert: {
      recipient: paymentConfig.adminEmail,
      sent: false,
      subject: `CartNova — TEST PAYMENT ALERT — Order #${data.orderNumber} [SIMULATED TRANSACTION]`,
      status: "QUEUED",
    },
    timeline: [
      {
        status: "TEST_PENDING",
        timestamp: createdAt,
        note: "Customer initiated simulated order checkout",
      },
      {
        status: initialStatus,
        timestamp: createdAt,
        note: "Simulated payment captured successfully in DEMO mode",
      },
    ],
  };

  return (async () => {
    if (paymentConfig.enableAutoAlerts) {
      const emailResult = await dispatchSimulatedPaymentAlert(newTxn);
      newTxn.emailAlert = emailResult;
      newTxn.timeline.push({
        status: initialStatus,
        timestamp: new Date().toISOString(),
        note: `Test payment alert dispatched to admin (${paymentConfig.adminEmail}) [${emailResult.status}]`,
      });
    }

    simulatedTransactions.unshift(newTxn);
    return newTxn;
  })();
}

export function updateSimulatedTransactionStatus(
  id: string,
  newStatus: SimulatedPaymentStatus,
  note?: string
): SimulatedTransaction | null {
  const index = simulatedTransactions.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const current = simulatedTransactions[index];
  const updated: SimulatedTransaction = {
    ...current,
    status: newStatus,
    updatedAt: new Date().toISOString(),
    timeline: [
      ...current.timeline,
      {
        status: newStatus,
        timestamp: new Date().toISOString(),
        note: note || `Status updated manually by Admin to ${newStatus}`,
      },
    ],
  };

  simulatedTransactions[index] = updated;
  return updated;
}

export async function resendSimulatedAlert(
  id: string
): Promise<{ transaction: SimulatedTransaction | null; success: boolean }> {
  const index = simulatedTransactions.findIndex((t) => t.id === id);
  if (index === -1) return { transaction: null, success: false };

  const txn = simulatedTransactions[index];
  const alertResult = await dispatchSimulatedPaymentAlert(txn);

  const updated: SimulatedTransaction = {
    ...txn,
    emailAlert: alertResult,
    updatedAt: new Date().toISOString(),
    timeline: [
      ...txn.timeline,
      {
        status: txn.status,
        timestamp: new Date().toISOString(),
        note: `Admin re-dispatched test payment alert to ${paymentConfig.adminEmail}`,
      },
    ],
  };

  simulatedTransactions[index] = updated;
  return { transaction: updated, success: true };
}

export function updatePaymentConfig(
  newConfig: Partial<SimulatedPaymentConfig>
): SimulatedPaymentConfig {
  paymentConfig = {
    ...paymentConfig,
    ...newConfig,
    smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
  };
  return paymentConfig;
}

export function getPaymentConfig(): SimulatedPaymentConfig {
  return paymentConfig;
}
