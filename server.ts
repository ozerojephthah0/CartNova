import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "CartNova", timestamp: new Date().toISOString() });
  });

  // AI Shopping, Merchant & Admin Assistant Concierge
  app.post("/api/ai-assistant", async (req, res) => {
    try {
      const query = req.body.query || req.body.message || "";
      const role = req.body.role || "customer"; // 'customer' | 'seller' | 'admin'
      const activeCategory = req.body.category || "all";
      const activeSeasonalEvent = req.body.seasonalEvent || null;
      const seasonalEvents = req.body.seasonalEvents || [];
      const categories = req.body.categories || [];
      const products = req.body.products || req.body.context || [];
      const client = getGeminiClient();

      if (!client) {
        // Fallback intelligent response if API key is not configured yet
        const lowerQuery = query.toLowerCase();
        let matched = Array.isArray(products)
          ? products.filter((p: any) => {
              const matchesCat =
                activeCategory === "all" ||
                p.category?.toLowerCase() === activeCategory.toLowerCase();
              const matchesQuery =
                !query ||
                p.title?.toLowerCase().includes(lowerQuery) ||
                p.category?.toLowerCase().includes(lowerQuery) ||
                p.description?.toLowerCase().includes(lowerQuery) ||
                p.tags?.some((t: string) => t.toLowerCase().includes(lowerQuery));
              return matchesCat && matchesQuery;
            })
          : [];

        if (matched.length === 0 && Array.isArray(products)) {
          matched = products.slice(0, 3);
        }

        let fallbackReply = "";
        let eventCode = "";

        if (activeSeasonalEvent) {
          eventCode = activeSeasonalEvent.couponCode || "NOVA20";
          fallbackReply = `🎉 **${activeSeasonalEvent.name} Spotlight**: Enjoy an instant flat **20% discount** across our entire catalog using promo code \`${eventCode}\`! Here are handpicked flagship items for this campaign:`;
        } else if (role === "seller") {
          fallbackReply = `🏪 **Merchant AI Co-Pilot**: In **${activeCategory === "all" ? "All Categories" : activeCategory}**, top sellers are seeing high demand! You can optimize your titles with high-search keywords and participate in seasonal campaigns with 20% promotional badges to boost sales velocity.`;
        } else if (role === "admin") {
          fallbackReply = `🛡️ **Admin AI Store Auditor**: Catalog overview for **${activeCategory === "all" ? "All Categories" : activeCategory}**: Total inventory active across ${categories.length || 9} categories with 14 seasonal events scheduled. Inventory levels and order fulfillment health are optimal.`;
        } else {
          fallbackReply = `✨ **Nova AI Concierge**: For "${query || activeCategory}", here are top-tier curated recommendations from our verified store inventory with free express delivery and buyer protection:`;
        }

        return res.json({
          reply: fallbackReply,
          recommendedProductIds: matched.slice(0, 4).map((p: any) => p.id),
          featuredCategory: activeCategory !== "all" ? activeCategory : undefined,
          seasonalEventCode: eventCode || undefined,
          isFallback: true,
        });
      }

      const prompt = `You are "Nova", the intelligent multi-role AI Assistant for CartNova, a luxury e-commerce digital marketplace.

Context:
- User Role: "${role}" (Options: 'customer', 'seller' / 'merchant', 'admin')
- Active Category: "${activeCategory}"
- Active Seasonal Event: ${JSON.stringify(activeSeasonalEvent)}
- User Query: "${query}"
- Available Categories: ${JSON.stringify(categories.map((c: any) => c.name || c))}
- Available Seasonal Events (14 campaigns with 20% discounts): ${JSON.stringify(
        seasonalEvents.slice(0, 10).map((e: any) => ({
          name: e.name,
          month: e.month,
          couponCode: e.couponCode,
          discount: "20%",
          status: e.status,
        }))
      )}
- Catalog Items Snippet: ${JSON.stringify(
        Array.isArray(products)
          ? products.slice(0, 18).map((p: any) => ({
              id: p.id,
              title: p.title,
              category: p.category,
              brand: p.brand,
              price: p.price,
              rating: p.rating,
              stock: p.stock,
            }))
          : []
      )}

Role-based guidance:
- If Role is "customer": Recommend matching products, highlight features, explain seasonal event discounts (all 14 events feature 20% off), give friendly shopping advice.
- If Role is "seller" / "merchant": Provide high-converting product title ideas, pricing suggestions for the category, inventory advice, and how to leverage seasonal events.
- If Role is "admin": Provide category inventory audits, promotional campaign suggestions, seasonal event tracking metrics, and merchandising recommendations.

Return ONLY a JSON response matching this schema:
{
  "reply": "Concise, friendly, and formatted response (markdown bolding encouraged, max 100 words)",
  "recommendedProductIds": ["prod-id-1", "prod-id-2"],
  "featuredCategory": "Category Name or null",
  "seasonalEventCode": "COUPONCODE or null"
}`;

      const response = await client.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      let parsed: any = {};
      try {
        parsed = JSON.parse(response.text || "{}");
      } catch {
        parsed = { reply: response.text || "Here are some great options for you!" };
      }

      res.json({
        reply: parsed.reply || "Here are top curated recommendations on CartNova!",
        recommendedProductIds: parsed.recommendedProductIds || [],
        featuredCategory: parsed.featuredCategory || undefined,
        seasonalEventCode: parsed.seasonalEventCode || undefined,
      });
    } catch (error: any) {
      console.error("AI Assistant error:", error);
      res.json({
        reply: "I found top items that match your request in our catalog!",
        recommendedProductIds: [],
      });
    }
  });

  // AI Customer Support Concierge
  app.post("/api/customer-support", async (req, res) => {
    try {
      const message = req.body.message || req.body.query || "";
      const customerName = req.body.customerName || "Customer";
      const orders = req.body.orders || [];
      const client = getGeminiClient();

      if (!client) {
        // Smart fallback logic for typical support queries
        const lowerMsg = message.toLowerCase();
        let fallbackReply = `Hello ${customerName}! I'm Nova from CartNova Customer Support. I'm here to assist you with order tracking, returns, warranty claims, and account inquiries.`;
        let suggestedActions: any[] = [];

        if (lowerMsg.includes("track") || lowerMsg.includes("order") || lowerMsg.includes("where is")) {
          const latestOrder = orders[0];
          if (latestOrder) {
            fallbackReply = `I found your recent order #${latestOrder.orderNumber} placed on ${new Date(
              latestOrder.createdAt
            ).toLocaleDateString()}. Status: ${latestOrder.status.toUpperCase()}. Estimated delivery is 1-3 business days with live dispatch courier updates.`;
            suggestedActions = [
              { label: `Track #${latestOrder.orderNumber}`, actionType: "view_order", payload: latestOrder.id },
              { label: "File Delivery Inquiry", actionType: "open_ticket", payload: "delivery_delay" },
            ];
          } else {
            fallbackReply = "You can view and track all your purchases in your Orders tab with real-time DHL Express tracking.";
            suggestedActions = [{ label: "Go to Orders", actionType: "view_order" }];
          }
        } else if (lowerMsg.includes("refund") || lowerMsg.includes("return") || lowerMsg.includes("cancel")) {
          fallbackReply = `CartNova provides a 14-day hassle-free return guarantee! You can initiate a return or dispute directly from your Orders tab. Instant refunds can be credited to your NovaCash wallet or returned to your card within 3-5 business days.`;
          suggestedActions = [
            { label: "Start Return Request", actionType: "refund" },
            { label: "View Return Policy FAQ", actionType: "faq", payload: "returns_refunds" },
          ];
        } else if (lowerMsg.includes("damaged") || lowerMsg.includes("broken") || lowerMsg.includes("defect")) {
          fallbackReply = `We're very sorry to hear that! Please submit a quick support ticket with photos of the damaged package. We will process an immediate priority replacement or full refund within 24 hours.`;
          suggestedActions = [
            { label: "Create Damage Ticket", actionType: "open_ticket", payload: "damaged_item" },
            { label: "Speak with Specialist", actionType: "contact_agent" },
          ];
        } else if (lowerMsg.includes("agent") || lowerMsg.includes("human") || lowerMsg.includes("call") || lowerMsg.includes("talk")) {
          fallbackReply = `I can connect you with one of our Senior Customer Care Specialists right away! Our direct hotline is +234 800-CARTNOVA (24/7) or you can create a prioritized support ticket.`;
          suggestedActions = [
            { label: "Open Priority Ticket", actionType: "open_ticket", payload: "general_inquiry" },
            { label: "Call Support (+234 800-CARTNOVA)", actionType: "contact_agent" },
          ];
        } else {
          suggestedActions = [
            { label: "Track Active Order", actionType: "view_order" },
            { label: "Return or Refund", actionType: "refund" },
            { label: "Help Center FAQs", actionType: "faq" },
          ];
        }

        return res.json({
          reply: fallbackReply,
          agentName: "Nova Support AI",
          suggestedActions,
          isFallback: true,
        });
      }

      const prompt = `You are "Nova", the empathetic, professional, and efficient Customer Support Specialist for CartNova (a premium e-commerce platform).
Customer Name: ${customerName}
Customer Query: "${message}"
Customer Recent Orders Context: ${JSON.stringify(
        Array.isArray(orders)
          ? orders.slice(0, 3).map((o: any) => ({
              orderNumber: o.orderNumber,
              status: o.status,
              total: o.total,
              itemsCount: o.items?.length,
              date: o.createdAt,
            }))
          : []
      )}

CartNova Policies:
- 14-day hassle-free return window on unworn/unopened goods.
- Fast dispatch with DHL Express / live courier tracking.
- Refunds via NovaCash Wallet (instant) or Bank Card (3-5 days).
- 24-Month CartNova Care global warranty on tech & wearables.

Provide a warm, concise, and helpful support reply (max 80 words). If applicable, suggest 1-2 helpful actions.
Return ONLY valid JSON matching this schema:
{
  "reply": "Empathetic, clear, and actionable support message",
  "suggestedActions": [
    { "label": "Action button text", "actionType": "view_order" | "open_ticket" | "faq" | "contact_agent" | "refund", "payload": "optional payload id/category" }
  ]
}`;

      const response = await client.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      let parsed: any = {};
      try {
        parsed = JSON.parse(response.text || "{}");
      } catch {
        parsed = { reply: response.text || "I am here to help you with your order and account needs." };
      }

      res.json({
        reply: parsed.reply || "I am here to help you with your order, return, or delivery inquiry.",
        agentName: "Nova Support Concierge",
        suggestedActions: parsed.suggestedActions || [],
      });
    } catch (error: any) {
      console.error("Support API error:", error);
      res.json({
        reply: "Hello! Our support team is ready to assist. How may we help you with your orders, returns, or questions today?",
        agentName: "Nova Support",
        suggestedActions: [{ label: "View FAQs", actionType: "faq" }],
      });
    }
  });

  // AI Seller Product Description Generator (supports both /api/ai-product-copy and /api/ai-generate-product)
  const handleProductCopyGen = async (req: express.Request, res: express.Response) => {
    try {
      const topic = req.body.topic || req.body.title || "Smart Tech Accessory";
      const category = req.body.category || "Audio & Wearables";
      const tone = req.body.tone || "Modern, captivating & high-converting";
      const keyFeatures = req.body.keyFeatures || "";
      const client = getGeminiClient();

      if (!client) {
        return res.json({
          title: `${topic} - Next-Gen Edition`,
          shortDescription: `Top-rated ${topic} engineered for modern performance and supreme reliability.`,
          description: `Experience the finest in craftsmanship and innovation with this precision-crafted item. Engineered with aerospace-grade durability and ergonomic comfort tailored for everyday excellence.`,
          features: [
            "Aerospace-grade lightweight aluminum & composite chassis",
            "Ultra-responsive tactile performance with zero latency",
            "Extended battery life with RapidCharge USB-C technology",
            "IPX5 water & dust resistance rating",
          ],
          tags: ["Premium", "High-Performance", "Nova-Certified", "Flagship"],
          isFallback: true,
        });
      }

      const prompt = `You are an expert e-commerce copywriter for CartNova. Generate a high-converting product listing for:
Topic/Title: ${topic}
Category: ${category}
Tone: ${tone}
Key Details: ${keyFeatures}

Return ONLY a JSON object:
{
  "title": "Punchy and appealing product title",
  "shortDescription": "1-sentence punchy summary",
  "description": "2-paragraph detailed engaging description",
  "features": ["Feature bullet 1", "Feature bullet 2", "Feature bullet 3", "Feature bullet 4"],
  "tags": ["Array", "of", "4-5", "relevant", "tags"]
}`;

      const response = await client.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("AI Generate Product error:", error);
      res.json({
        title: `${req.body.topic || "Premium Product"} - Pro Edition`,
        shortDescription: "Engineered for high performance and sleek aesthetics.",
        description: "Built with premium materials and precision engineering to deliver an exceptional experience.",
        features: ["High durability", "Modern aesthetic", "Certified quality"],
        tags: ["Trending", "Bestseller"],
      });
    }
  };

  app.post("/api/ai-product-copy", handleProductCopyGen);
  app.post("/api/ai-generate-product", handleProductCopyGen);

  // ==========================================
  // SIMULATED PAYMENT & EMAIL ALERT API (DEMO MODE)
  // ==========================================
  const {
    getAllSimulatedTransactions,
    createSimulatedTransaction,
    updateSimulatedTransactionStatus,
    resendSimulatedAlert,
    updatePaymentConfig,
    getPaymentConfig,
    dispatchSimulatedPaymentAlert,
  } = await import("./server/simulatedPaymentService.js").catch(() =>
    import("./server/simulatedPaymentService")
  );

  // Get all simulated transactions & config
  app.get("/api/simulated-transactions", (req, res) => {
    const data = getAllSimulatedTransactions();
    res.json({ success: true, ...data });
  });

  // Create new simulated transaction on checkout
  app.post("/api/simulated-transactions", async (req, res) => {
    try {
      const {
        orderId,
        orderNumber,
        customerName,
        customerEmail,
        amount,
        currency,
        paymentMethod,
        items,
        initialStatus,
      } = req.body;

      if (!orderNumber || !amount) {
        return res.status(400).json({ error: "Missing required order details" });
      }

      const transaction = await createSimulatedTransaction({
        orderId: orderId || `ord-${Date.now()}`,
        orderNumber: orderNumber || `CN-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: customerName || "Guest Customer",
        customerEmail: customerEmail || "customer@cartnova.dev",
        amount: Number(amount) || 0,
        currency: currency || "USD",
        paymentMethod: paymentMethod || "TEST_CREDIT_CARD",
        items: items || [],
        initialStatus: initialStatus || "TEST_RECEIVED",
      });

      res.status(201).json({ success: true, transaction });
    } catch (err: any) {
      console.error("Error creating simulated transaction:", err);
      res.status(500).json({ error: err.message || "Failed to record simulated payment" });
    }
  });

  // Update status (e.g. TEST_PENDING, TEST_RECEIVED, TEST_COMPLETED, TEST_FAILED, TEST_EXPIRED)
  app.patch("/api/simulated-transactions/:id/status", (req, res) => {
    try {
      const { id } = req.params;
      const { status, note } = req.body;

      if (!status) {
        return res.status(400).json({ error: "Missing status field" });
      }

      const updated = updateSimulatedTransactionStatus(id, status, note);
      if (!updated) {
        return res.status(404).json({ error: "Simulated transaction not found" });
      }

      res.json({ success: true, transaction: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Resend email alert for a transaction
  app.post("/api/simulated-transactions/:id/resend-alert", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await resendSimulatedAlert(id);
      if (!result.transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json({ success: true, transaction: result.transaction });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // One-click Test Email Dispatch trigger for admin dashboard
  app.post("/api/admin/test-email-dispatch", async (req, res) => {
    try {
      const targetEmail = req.body.adminEmail || getPaymentConfig().adminEmail;
      if (req.body.adminEmail) {
        updatePaymentConfig({ adminEmail: req.body.adminEmail });
      }

      const dummyTxn = await createSimulatedTransaction({
        orderId: `ord-test-${Date.now()}`,
        orderNumber: `CN-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: req.body.customerName || "Dr. Alex Johnson (Verified VIP Customer)",
        customerEmail: req.body.customerEmail || "alex.johnson@example.com",
        amount: Number(req.body.amount) || 1249.99,
        currency: req.body.currency || "USD",
        paymentMethod: req.body.paymentMethod || "TEST_CREDIT_CARD",
        items: [
          {
            id: "prod-sim-1",
            title: "Pro Tandem OLED Flagship iPad 13-inch (M4 Chip)",
            price: 1249.99,
            quantity: 1,
          },
        ],
        initialStatus: "TEST_RECEIVED",
      });

      res.json({
        success: true,
        message: `Test payment alert dispatched to ${targetEmail}`,
        transaction: dummyTxn,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get/Update payment config (admin Gmail, 5-min window toggle, etc.)
  app.get("/api/admin/test-email-config", (req, res) => {
    res.json({ success: true, config: getPaymentConfig() });
  });

  app.post("/api/admin/test-email-config", (req, res) => {
    try {
      const updated = updatePaymentConfig(req.body);
      res.json({ success: true, config: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development vs static production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CartNova server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
