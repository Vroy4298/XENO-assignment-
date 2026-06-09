require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const CRM_RECEIPT_URL = process.env.CRM_RECEIPT_URL || 'http://localhost:5000/api/receipt';

// Helper: random delay in ms between min and max
const delay = (min, max) => new Promise(resolve =>
  setTimeout(resolve, Math.floor(Math.random() * (max - min)) + min)
);

// Send a status callback to the CRM
async function sendCallback(messageId, status) {
  try {
    await axios.post(CRM_RECEIPT_URL, {
      messageId,
      status,
      timestamp: new Date().toISOString(),
    });
    console.log(`[CALLBACK] messageId=${messageId} → ${status}`);
  } catch (err) {
    // WHY: Log error but don't crash — CRM might be briefly unavailable.
    // In production you'd add a retry queue here.
    console.error(`[CALLBACK ERROR] messageId=${messageId} status=${status}: ${err.message}`);
  }
}

// ─── Main send endpoint ────────────────────────────────────────────────────────
// Called by CRM for each recipient. Returns immediately, then fires async callbacks.
//
// Realistic delivery rates (based on real marketing benchmarks):
//   delivered: 85% | failed: 15%
//   opened (of delivered): 70%
//   clicked (of opened): 40%
app.post('/send', async (req, res) => {
  const { messageId, recipient, message, channel } = req.body;

  if (!messageId) {
    return res.status(400).json({ error: 'messageId is required' });
  }

  // Immediate ACK — stub received the message
  res.json({ accepted: true, messageId });

  console.log(`[STUB] Received message for ${recipient?.name} via ${channel} — messageId=${messageId}`);

  // ── Async callback simulation ─────────────────────────────────────────────
  // WHY: Each status fires as a separate async callback (not bundled) to mirror
  // how real messaging providers work — delivery and engagement events arrive
  // independently, often seconds to minutes apart.

  (async () => {
    // Simulate network/delivery delay (2–5s)
    await delay(2000, 5000);

    const isFailed = Math.random() < 0.15; // 15% failure rate

    if (isFailed) {
      await sendCallback(messageId, 'failed');
      return; // No further events for failed messages
    }

    // Delivered
    await sendCallback(messageId, 'delivered');

    // 70% open rate — wait 3–10s after delivery
    if (Math.random() < 0.70) {
      await delay(3000, 10000);
      await sendCallback(messageId, 'opened');

      // 40% click rate (of those who opened) — wait 2–8s after open
      if (Math.random() < 0.40) {
        await delay(2000, 8000);
        await sendCallback(messageId, 'clicked');
      }
    }
  })();
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'xeno-channel-stub' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Channel Stub running on port ${PORT}`));
