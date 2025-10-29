import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import requestIp from "request-ip";
import useragent from "express-useragent";
import geoip from "geoip-lite";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(requestIp.mw());
app.use(useragent.express());

// simple in-memory store for visitor IPs
const visitors = new Map();

// ✅ Route: track page view
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

    console.log("🎬 Tracked Visitor:", data);
    return res.status(200).json(data);
  } catch (err) {
    console.error("❌ Tracking error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Root route (homepage)
app.get("/", (req, res) => {
  res.send(`
    <div style="background:black;color:white;font-family:sans-serif;text-align:center;padding:40px;">
      <h1>🎬 YouWatch Movies Tracker – ICONIC TECH</h1>
      <p>Tracking API is online and ready.</p>
      <p style="color:gray;">POST /api/track-pageview to record a visit.</p>
    </div>
  `);
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 YouWatch Movies Backend running on port ${PORT}`);
});