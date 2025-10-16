import cron from "node-cron";
import axios from "axios";

// URL of your Render backend (replace with your actual Render URL)
const BACKEND_URL = process.env.BACKEND_URL 

export const startKeepAlive = () => {
  // Ping every 3 minutes to keep app awake
  cron.schedule("*/3 * * * *", async () => {
    try {
      const res = await axios.get(BACKEND_URL);
      console.log(`⏱️ Keep-alive ping successful at ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      console.error("⚠️ Keep-alive ping failed:", err);
    }
  });
};
