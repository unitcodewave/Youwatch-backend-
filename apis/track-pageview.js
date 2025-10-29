import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import requestIp from "request-ip";
import useragent from "express-useragent";
import geoip from "geoip-lite";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(requestIp.mw());
app.use(useragent.express());

// Visitor memory storage
const visitors = new Map();

app.post("/api/track-pageview", (req, res) => {
  try {
    const ip = req.clientIp?.replace("::ffff:", "") || "unknown";
    const geo = geoip.lookup(ip);
    const country = geo?.country || "Unknown";
    const city = geo?.city || "Unknown";
    const device = req.useragent?.platform || "Unknown";
    const page = req.body.page || "/";
    const referrer = req.body.referrer || "direct";

    const isReturning = visitors.has(ip);
    visitors.set(ip, { lastVisit: Date.now(), page });

    const data = {
      ip,
      country,
      city,
      device,
      page,
      referrer,
      isReturning,
      message: isReturning
        ? "Welcome back to YouWatch Movies! 🎬"
        : "Thanks for joining YouWatch Movies – by ICONIC TECH ✨",
    };

    console.log("🎥 Tracked Visitor:", data);
    return res.status(200).json(data);
  } catch (err) {
    console.error("❌ Tracking error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Default route (for testing)
app.get("/", (req, res) => {
  res.send(`
    <h1 style="font-family:sans-serif;text-align:center;color:white;background:black;padding:30px;">
      🎬 YouWatch Movies Backend by ICONIC TECH
    </h1>
    <p style="text-align:center;color:gray;">Tracking API is active and ready.</p>
  `);
});

// Export for Vercel serverless
export default app;