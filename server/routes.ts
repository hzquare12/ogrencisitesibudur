import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.ts";
import { insertCourseSchema, insertAssignmentSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import session from "express-session";
import express from "express";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Admin session middleware
const adminAuth = (req: any, res: any, next: any) => {
  if (!req.session?.isAdmin) {
    return res.status(401).json({ message: 'Admin authentication required' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable express session
  app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // Admin authentication
  app.post('/api/admin/login', (req: any, res: any) => {
    const { password } = req.body;
    if (password === '20111903*') {
      req.session.isAdmin = true;
      res.json({ success: true });
    } else {
      res.status(401).json({ message: 'Invalid password' });
    }
  });

  app.post('/api/admin/logout', (req: any, res: any) => {
    req.session.destroy();
    res.json({ success: true });
  });

  app.get('/api/admin/status', (req: any, res: any) => {
    res.json({ isAdmin: !!req.session?.isAdmin });
  });

  // Course routes
  app.get('/api/courses', async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch courses' });
    }
  });

  app.get('/api/courses/:slug', async (req, res) => {
    try {
      const course = await storage.getCourseBySlug(req.params.slug);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch course' });
    }
  });

  app.post('/api/courses', adminAuth, async (req: any, res: any) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete('/api/courses/:id', adminAuth, async (req: any, res: any) => {
    try {
      const { passwords } = req.body;
      
      // Verify 5 passwords
      if (!Array.isArray(passwords) || passwords.length !== 5) {
        return res.status(400).json({ message: '5 passwords required' });
      }
      
      const allCorrect = passwords.every((pwd: string) => pwd === '20111903*');
      if (!allCorrect) {
        return res.status(400).json({ message: 'All passwords must be correct' });
      }

      const deleted = await storage.deleteCourse(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete course' });
    }
  });

  // Assignment routes
  app.get('/api/assignments', async (req, res) => {
    try {
      const assignments = await storage.getAssignments();
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch assignments' });
    }
  });

  app.get('/api/courses/:courseId/assignments', async (req, res) => {
    try {
      const assignments = await storage.getAssignmentsByCourse(req.params.courseId);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch assignments' });
    }
  });

  app.get('/api/assignments/:courseSlug/:orderIndex', async (req, res) => {
    try {
      const { courseSlug, orderIndex } = req.params;
      const assignment = await storage.getAssignmentByCourseAndOrder(
        courseSlug, 
        parseInt(orderIndex)
      );
      
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }
      
      const course = await storage.getCourse(assignment.courseId);
      res.json({ assignment, course });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch assignment' });
    }
  });

  app.post('/api/assignments', adminAuth, upload.array('images', 10), async (req: any, res: any) => {
    try {
      const { courseId, description, title } = req.body;
      
      // Get next order index for this course
      const existingAssignments = await storage.getAssignmentsByCourse(courseId);
      const orderIndex = existingAssignments.length + 1;
      
      // Process uploaded images
      const images = req.files?.map((file: any) => `/uploads/${file.filename}`) || [];
      
      const assignmentData = insertAssignmentSchema.parse({
        courseId,
        title: title || `Ödev ${orderIndex}`,
        description: description || '',
        images,
        orderIndex,
      });
      
      const assignment = await storage.createAssignment(assignmentData);
      const course = await storage.getCourse(courseId);
      
      res.status(201).json({ 
        assignment, 
        link: `/${course?.slug}/${orderIndex}` 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/assignments/:id', adminAuth, async (req: any, res: any) => {
    try {
      const updates = req.body;
      const assignment = await storage.updateAssignment(req.params.id, updates);
      
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }
      
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update assignment' });
    }
  });

  app.delete('/api/assignments/:id', adminAuth, async (req: any, res: any) => {
    try {
      const deleted = await storage.deleteAssignment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Assignment not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete assignment' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
