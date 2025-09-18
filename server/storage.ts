import { type Course, type InsertCourse, type Assignment, type InsertAssignment } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Courses
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  getCourseBySlug(slug: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  deleteCourse(id: string): Promise<boolean>;
  
  // Assignments
  getAssignments(): Promise<Assignment[]>;
  getAssignmentsByCourse(courseId: string): Promise<Assignment[]>;
  getAssignment(id: string): Promise<Assignment | undefined>;
  getAssignmentByCourseAndOrder(courseSlug: string, orderIndex: number): Promise<Assignment | undefined>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: string, assignment: Partial<Assignment>): Promise<Assignment | undefined>;
  deleteAssignment(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private courses: Map<string, Course> = new Map();
  private assignments: Map<string, Assignment> = new Map();

  constructor() {
    // Initialize with sample courses
    const mathCourse: Course = {
      id: randomUUID(),
      name: "Matematik",
      slug: "matematik",
      createdAt: new Date(),
    };
    
    const physicsCourse: Course = {
      id: randomUUID(),
      name: "Fizik", 
      slug: "fizik",
      createdAt: new Date(),
    };
    
    const computerCourse: Course = {
      id: randomUUID(),
      name: "Bilgisayar Bilimi",
      slug: "bilgisayar",
      createdAt: new Date(),
    };

    this.courses.set(mathCourse.id, mathCourse);
    this.courses.set(physicsCourse.id, physicsCourse);
    this.courses.set(computerCourse.id, computerCourse);
  }

  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getCourseBySlug(slug: string): Promise<Course | undefined> {
    return Array.from(this.courses.values()).find(course => course.slug === slug);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = randomUUID();
    const course: Course = {
      ...insertCourse,
      id,
      createdAt: new Date(),
    };
    this.courses.set(id, course);
    return course;
  }

  async deleteCourse(id: string): Promise<boolean> {
    // Also delete all assignments for this course
    const assignments = Array.from(this.assignments.values()).filter(a => a.courseId === id);
    assignments.forEach(a => this.assignments.delete(a.id));
    
    return this.courses.delete(id);
  }

  async getAssignments(): Promise<Assignment[]> {
    return Array.from(this.assignments.values()).sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async getAssignmentsByCourse(courseId: string): Promise<Assignment[]> {
    return Array.from(this.assignments.values())
      .filter(assignment => assignment.courseId === courseId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async getAssignment(id: string): Promise<Assignment | undefined> {
    return this.assignments.get(id);
  }

  async getAssignmentByCourseAndOrder(courseSlug: string, orderIndex: number): Promise<Assignment | undefined> {
    const course = await this.getCourseBySlug(courseSlug);
    if (!course) return undefined;
    
    return Array.from(this.assignments.values()).find(
      assignment => assignment.courseId === course.id && assignment.orderIndex === orderIndex
    );
  }

  async createAssignment(insertAssignment: InsertAssignment): Promise<Assignment> {
    const id = randomUUID();
    const assignment: Assignment = {
      ...insertAssignment,
      id,
      title: insertAssignment.title || null,
      description: insertAssignment.description || null,
      images: insertAssignment.images || [],
      createdAt: new Date(),
    };
    this.assignments.set(id, assignment);
    return assignment;
  }

  async updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment | undefined> {
    const assignment = this.assignments.get(id);
    if (!assignment) return undefined;
    
    const updatedAssignment = { ...assignment, ...updates };
    this.assignments.set(id, updatedAssignment);
    return updatedAssignment;
  }

  async deleteAssignment(id: string): Promise<boolean> {
    return this.assignments.delete(id);
  }
}

export const storage = new MemStorage();
