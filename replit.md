# Overview

This is a full-stack web application for showcasing educational projects and assignments. The system is built as a portfolio platform for "FTEAL TUNA ERDEM" to display coursework across different subjects like Mathematics, Physics, and Computer Science. The application features a public gallery view for browsing assignments by course, and a protected admin interface for content management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Modern React application using functional components and hooks
- **Vite Build System**: Fast development server and optimized production builds
- **Wouter Router**: Lightweight client-side routing for navigation
- **TanStack Query**: Server state management with caching and synchronization
- **Shadcn/ui Components**: Comprehensive UI component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first styling with custom design tokens and CSS variables

## Backend Architecture
- **Express.js Server**: RESTful API server handling course and assignment operations
- **TypeScript**: Full type safety across server-side code
- **Session-based Authentication**: Simple admin authentication using express-session
- **File Upload Handling**: Multer middleware for image upload processing
- **Development Integration**: Vite middleware integration for seamless development experience

## Data Storage Solutions
- **PostgreSQL Database**: Primary data store using Drizzle ORM
- **Neon Database**: Serverless PostgreSQL hosting solution
- **In-Memory Fallback**: MemStorage class for development/testing scenarios
- **File System Storage**: Local uploads directory for image assets

## Database Schema Design
- **Courses Table**: Stores course information with auto-generated UUIDs, names, and URL-friendly slugs
- **Assignments Table**: Contains assignment details with foreign key relationships to courses, support for multiple images, and ordering system
- **Drizzle ORM**: Type-safe database operations with schema validation using Zod

## API Structure
- **RESTful Endpoints**: Standard HTTP methods for CRUD operations
- **Course Management**: GET /api/courses, POST /api/courses, DELETE /api/courses/:id
- **Assignment Operations**: Full CRUD with image upload support
- **Admin Authentication**: Login/logout endpoints with session management
- **File Serving**: Static file serving for uploaded images

## Authentication & Authorization
- **Session-based Admin Auth**: Simple password-based admin access
- **Middleware Protection**: Route-level protection for admin endpoints
- **Frontend Auth Integration**: React Query-based authentication state management
- **No User Registration**: Single admin user model for content management

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for database connectivity
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **drizzle-kit**: Database migration and schema management tools
- **express**: Node.js web framework for API server
- **vite**: Modern build tool and development server

## UI and Styling Libraries
- **@radix-ui/react-***: Comprehensive collection of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for managing conditional CSS classes
- **clsx**: Conditional className utility

## State Management and Data Fetching
- **@tanstack/react-query**: Server state management with caching
- **wouter**: Lightweight React router

## Development and Build Tools
- **typescript**: Static type checking
- **esbuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution for development

## File Handling and Utilities
- **multer**: Multipart form data handling for file uploads
- **date-fns**: Date manipulation and formatting utilities
- **nanoid**: URL-safe unique identifier generation

## Replit-specific Integrations
- **@replit/vite-plugin-***: Development tools for Replit environment including error overlays and dev banners