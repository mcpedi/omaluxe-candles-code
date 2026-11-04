import { ENV } from "./env";

type OrderEmailInput = {
  orderId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  city?: string;
  country?: string;
  postalCode?: string;
  notes?: string;
  items: Array<{
    productName: string;
    selectedSize?: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
  }>;
  subtotal: string;
  shipping: string;
  total: string;
};

export async function sendOrderEmails(order: OrderEmailInput): Promise<boolean> {
  if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) {
    console.error("[OrderEmail] Supabase order email configuration is missing.");
    return false;
  }

  try {
    const response = await fetch(`${ENV.supabaseUrl}/functions/v1/send-order-email`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ENV.supabaseServiceRoleKey}`,
        apikey: ENV.supabaseServiceRoleKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("[OrderEmail] Supabase Edge Function failed:", response.status, detail);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[OrderEmail] Could not reach Supabase Edge Function:", error);
    return false;
  }
}
