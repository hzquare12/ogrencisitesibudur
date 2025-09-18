// server/index.ts
import express3 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  courses = /* @__PURE__ */ new Map();
  assignments = /* @__PURE__ */ new Map();
  constructor() {
    const mathCourse = {
      id: randomUUID(),
      name: "Matematik",
      slug: "matematik",
      createdAt: /* @__PURE__ */ new Date()
    };
    const physicsCourse = {
      id: randomUUID(),
      name: "Fizik",
      slug: "fizik",
      createdAt: /* @__PURE__ */ new Date()
    };
    const computerCourse = {
      id: randomUUID(),
      name: "Bilgisayar Bilimi",
      slug: "bilgisayar",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.courses.set(mathCourse.id, mathCourse);
    this.courses.set(physicsCourse.id, physicsCourse);
    this.courses.set(computerCourse.id, computerCourse);
  }
  async getCourses() {
    return Array.from(this.courses.values()).sort((a, b) => a.name.localeCompare(b.name));
  }
  async getCourse(id) {
    return this.courses.get(id);
  }
  async getCourseBySlug(slug) {
    return Array.from(this.courses.values()).find((course) => course.slug === slug);
  }
  async createCourse(insertCourse) {
    const id = randomUUID();
    const course = {
      ...insertCourse,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.courses.set(id, course);
    return course;
  }
  async deleteCourse(id) {
    const assignments2 = Array.from(this.assignments.values()).filter((a) => a.courseId === id);
    assignments2.forEach((a) => this.assignments.delete(a.id));
    return this.courses.delete(id);
  }
  async getAssignments() {
    return Array.from(this.assignments.values()).sort((a, b) => a.orderIndex - b.orderIndex);
  }
  async getAssignmentsByCourse(courseId) {
    return Array.from(this.assignments.values()).filter((assignment) => assignment.courseId === courseId).sort((a, b) => a.orderIndex - b.orderIndex);
  }
  async getAssignment(id) {
    return this.assignments.get(id);
  }
  async getAssignmentByCourseAndOrder(courseSlug, orderIndex) {
    const course = await this.getCourseBySlug(courseSlug);
    if (!course) return void 0;
    return Array.from(this.assignments.values()).find(
      (assignment) => assignment.courseId === course.id && assignment.orderIndex === orderIndex
    );
  }
  async createAssignment(insertAssignment) {
    const id = randomUUID();
    const assignment = {
      ...insertAssignment,
      id,
      title: insertAssignment.title || null,
      description: insertAssignment.description || null,
      images: insertAssignment.images || [],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.assignments.set(id, assignment);
    return assignment;
  }
  async updateAssignment(id, updates) {
    const assignment = this.assignments.get(id);
    if (!assignment) return void 0;
    const updatedAssignment = { ...assignment, ...updates };
    this.assignments.set(id, updatedAssignment);
    return updatedAssignment;
  }
  async deleteAssignment(id) {
    return this.assignments.delete(id);
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow()
});
var assignments = pgTable("assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  title: text("title"),
  description: text("description"),
  images: text("images").array().default([]),
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true
});
var insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  createdAt: true
});

// server/routes.ts
import multer from "multer";
import path from "path";
import fs from "fs";
import session from "express-session";
import express from "express";
var uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
var upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 },
  // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});
var adminAuth = (req, res, next) => {
  if (!req.session?.isAdmin) {
    return res.status(401).json({ message: "Admin authentication required" });
  }
  next();
};
async function registerRoutes(app2) {
  app2.use(session({
    secret: process.env.SESSION_SECRET || "default-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1e3 }
    // 24 hours
  }));
  app2.use("/uploads", express.static(uploadDir));
  app2.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (password === "20111903*") {
      req.session.isAdmin = true;
      res.json({ success: true });
    } else {
      res.status(401).json({ message: "Invalid password" });
    }
  });
  app2.post("/api/admin/logout", (req, res) => {
    req.session.destroy();
    res.json({ success: true });
  });
  app2.get("/api/admin/status", (req, res) => {
    res.json({ isAdmin: !!req.session?.isAdmin });
  });
  app2.get("/api/courses", async (req, res) => {
    try {
      const courses2 = await storage.getCourses();
      res.json(courses2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });
  app2.get("/api/courses/:slug", async (req, res) => {
    try {
      const course = await storage.getCourseBySlug(req.params.slug);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });
  app2.post("/api/courses", adminAuth, async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.delete("/api/courses/:id", adminAuth, async (req, res) => {
    try {
      const { passwords } = req.body;
      if (!Array.isArray(passwords) || passwords.length !== 5) {
        return res.status(400).json({ message: "5 passwords required" });
      }
      const allCorrect = passwords.every((pwd) => pwd === "20111903*");
      if (!allCorrect) {
        return res.status(400).json({ message: "All passwords must be correct" });
      }
      const deleted = await storage.deleteCourse(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete course" });
    }
  });
  app2.get("/api/assignments", async (req, res) => {
    try {
      const assignments2 = await storage.getAssignments();
      res.json(assignments2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });
  app2.get("/api/courses/:courseId/assignments", async (req, res) => {
    try {
      const assignments2 = await storage.getAssignmentsByCourse(req.params.courseId);
      res.json(assignments2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });
  app2.get("/api/assignments/:courseSlug/:orderIndex", async (req, res) => {
    try {
      const { courseSlug, orderIndex } = req.params;
      const assignment = await storage.getAssignmentByCourseAndOrder(
        courseSlug,
        parseInt(orderIndex)
      );
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      const course = await storage.getCourse(assignment.courseId);
      res.json({ assignment, course });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assignment" });
    }
  });
  app2.post("/api/assignments", adminAuth, upload.array("images", 10), async (req, res) => {
    try {
      const { courseId, description, title } = req.body;
      const existingAssignments = await storage.getAssignmentsByCourse(courseId);
      const orderIndex = existingAssignments.length + 1;
      const images = req.files?.map((file) => `/uploads/${file.filename}`) || [];
      const assignmentData = insertAssignmentSchema.parse({
        courseId,
        title: title || `\xD6dev ${orderIndex}`,
        description: description || "",
        images,
        orderIndex
      });
      const assignment = await storage.createAssignment(assignmentData);
      const course = await storage.getCourse(courseId);
      res.status(201).json({
        assignment,
        link: `/${course?.slug}/${orderIndex}`
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.put("/api/assignments/:id", adminAuth, async (req, res) => {
    try {
      const updates = req.body;
      const assignment = await storage.updateAssignment(req.params.id, updates);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update assignment" });
    }
  });
  app2.delete("/api/assignments/:id", adminAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteAssignment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete assignment" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "127.0.0.1", () => {
    log(`Server running on http://127.0.0.1:${port}`);
  });
})();
