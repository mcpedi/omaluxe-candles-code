type OrderItem = {
  productName: string;
  selectedSize?: string | null;
  quantity: number;
  unitPrice: string;
  subtotal: string;
};

type OrderEmailPayload = {
  orderId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  shippingAddress: string;
  city?: string | null;
  country?: string | null;
  postalCode?: string | null;
  notes?: string | null;
  items: OrderItem[];
  subtotal: string;
  shipping: string;
  total: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ??
      character,
  );

function renderItems(items: OrderItem[]) {
  return items
    .map(
      (item) =>
        `<li>${escapeHtml(item.productName)}${item.selectedSize ? ` (${escapeHtml(item.selectedSize)})` : ""} ×${item.quantity} — KSh ${escapeHtml(item.subtotal)}</li>`,
    )
    .join("");
}

function renderCustomerEmail(order: OrderEmailPayload) {
  return `<h1>Thank you for your OmaLuxe order</h1>
    <p>Hi ${escapeHtml(order.customerName)}, your order #${order.orderId} has been received.</p>
    <h2>Items</h2><ul>${renderItems(order.items)}</ul>
    <p>Subtotal: KSh ${escapeHtml(order.subtotal)}<br>
    Shipping: KSh ${escapeHtml(order.shipping)}<br>
    <strong>Total: KSh ${escapeHtml(order.total)}</strong></p>
    <p>Delivery address: ${escapeHtml(order.shippingAddress)}, ${escapeHtml(order.city ?? "")}, ${escapeHtml(order.country ?? "")}</p>`;
}

function renderOwnerEmail(order: OrderEmailPayload) {
  return `<h1>New OmaLuxe order #${order.orderId}</h1>
    <p><strong>Customer:</strong> ${escapeHtml(order.customerName)} (${escapeHtml(order.customerEmail)})</p>
    <p><strong>Phone:</strong> ${escapeHtml(order.customerPhone ?? "Not provided")}<br>
    <strong>Address:</strong> ${escapeHtml(order.shippingAddress)}, ${escapeHtml(order.city ?? "")}, ${escapeHtml(order.country ?? "")} ${escapeHtml(order.postalCode ?? "")}</p>
    <h2>Items</h2><ul>${renderItems(order.items)}</ul>
    <p>Subtotal: KSh ${escapeHtml(order.subtotal)}<br>
    Shipping: KSh ${escapeHtml(order.shipping)}<br>
    <strong>Total: KSh ${escapeHtml(order.total)}</strong></p>
    <p><strong>Notes:</strong> ${escapeHtml(order.notes ?? "None")}</p>`;
}

async function sendEmail(to: string, subject: string, html: string) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + resendApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: Deno.env.get("RESEND_FROM_EMAIL"),
      to: [to],
      subject,
      html,
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend rejected the email: ${response.status} ${detail}`);
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const order = (await request.json()) as OrderEmailPayload;
    const required = ["RESEND_API_KEY", "RESEND_FROM_EMAIL", "OWNER_EMAIL"];
    const missing = required.filter((name) => !Deno.env.get(name));
    if (missing.length > 0) {
      throw new Error(`Missing function secrets: ${missing.join(", ")}`);
    }

    await Promise.all([
      sendEmail(
        Deno.env.get("OWNER_EMAIL")!,
        `New OmaLuxe order #${order.orderId} — KSh ${order.total}`,
        renderOwnerEmail(order),
      ),
      sendEmail(
        order.customerEmail,
        `OmaLuxe order confirmation #${order.orderId}`,
        renderCustomerEmail(order),
      ),
    ]);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[send-order-email]", error);
    return new Response(JSON.stringify({ error: "Unable to send order emails" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
