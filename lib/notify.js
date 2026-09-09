import { sql } from "./db";

// type examples: 'new_listing' | 'order_created' | 'payment_claimed' | 'payment_confirmed'
//              | 'listing_approved' | 'listing_rejected' | 'reported' | 'account_flagged'
export async function notify(userId, type, message, link = "") {
  await sql`
    INSERT INTO notifications (user_id, type, message, link)
    VALUES (${userId}, ${type}, ${message}, ${link})
  `;
}

// Notify every subscriber of a seller, e.g. when a new listing goes live.
export async function notifySubscribers(sellerId, type, message, link = "") {
  const subs = await sql`
    SELECT subscriber_id FROM subscriptions WHERE seller_id = ${sellerId}
  `;
  for (const s of subs) {
    await notify(s.subscriber_id, type, message, link);
  }
}
