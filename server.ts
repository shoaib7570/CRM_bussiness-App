import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // In-memory database
  let leads = [
    {
      id: "1",
      name: "shoaib",
      company: "Tech Solutions",
      email: "shoaib@123.com",
      phone: "555-0101",
      status: "qualified",
      value: 15000,
      assignedTo: "user-1",
      notes: "Interested in full-stack project.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "raza",
      company: "SLOG Solutions",
      email: "raza@123.com",
      phone: "555-0202",
      status: "new",
      value: 25000,
      assignedTo: "user-1",
      notes: "Referred by partner.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  let activityLogs = [
    {
      id: "log-1",
      uid: "user-1",
      action: "System initialized with sample data",
      entityId: null,
      timestamp: new Date().toISOString(),
    }
  ];

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "ResoBrand CRM API is healthy" });
  });

  // Auth Mock
  app.post("/api/auth/mock", (req, res) => {
    res.json({
      uid: "user-1",
      displayName: "Demo Admin",
      email: "sr4802086@gmail.com",
      role: "admin",
      createdAt: new Date().toISOString(),
    });
  });

  // Leads API
  app.get("/api/leads", (req, res) => {
    res.json(leads);
  });

  app.post("/api/leads", (req, res) => {
    const newLead = {
      ...req.body,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    leads.push(newLead);
    res.json(newLead);
  });

  app.patch("/api/leads/:id", (req, res) => {
    const { id } = req.params;
    const index = leads.findIndex(l => l.id === id);
    if (index !== -1) {
      leads[index] = { ...leads[index], ...req.body, updatedAt: new Date().toISOString() };
      res.json(leads[index]);
    } else {
      res.status(404).json({ error: "Lead not found" });
    }
  });

  app.delete("/api/leads/:id", (req, res) => {
    const { id } = req.params;
    leads = leads.filter(l => l.id !== id);
    res.json({ success: true });
  });

  // Activity Logs API
  app.get("/api/logs", (req, res) => {
    res.json(activityLogs);
  });

  app.post("/api/logs", (req, res) => {
    const newLog = {
      ...req.body,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    activityLogs.push(newLog);
    res.json(newLog);
  });

  // Example API for WhatsApp integration (mock)
  app.post("/api/whatsapp/send", (req, res) => {
    const { to, message } = req.body;
    console.log(`Sending WhatsApp message to ${to}: ${message}`);
    res.json({ success: true, message: "WhatsApp message sent (mock)" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
