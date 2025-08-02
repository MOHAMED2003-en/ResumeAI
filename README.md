# CV Analysis MVP

🚀 **A comprehensive AI-powered CV analysis platform built as a Minimum Viable Product (MVP)**

*Made by **Ennajami Mohammed***

---

## 📋 Overview

CV Analysis MVP is a full-stack web application that revolutionizes the CV evaluation process by leveraging artificial intelligence. Users can upload their CV files, receive detailed AI-powered analysis, and view comprehensive scoring results through an intuitive dashboard interface.

## ✨ Key Features

### 🔐 **Authentication & Security**
- Secure email/password authentication via Supabase Auth
- Protected routes and API endpoints
- Session management with automatic token refresh
- Security headers and middleware protection

### 📄 **File Processing**
- **Multi-format Support**: PDF, DOC, and DOCX files
- **Intelligent Text Extraction**: Advanced parsing for different document formats
- **File Validation**: Size limits and format verification
- **Secure Storage**: Files stored in Supabase Storage with proper access controls

### 🤖 **AI-Powered Analysis**
- **Google Gemini AI Integration**: State-of-the-art language model for CV analysis
- **Comprehensive Scoring**: Multi-dimensional evaluation including:
  - Experience relevance and progression
  - Educational background strength
  - Skills assessment and diversity
  - Professional presentation quality
  - Achievement recognition
  - Overall CV effectiveness
- **Detailed Feedback**: Actionable insights and improvement recommendations
- **ATS Compatibility**: Analysis of Applicant Tracking System compatibility

### 📊 **Dashboard & Visualization**
- **Interactive Dashboard**: Real-time view of all uploaded CVs
- **Score Visualization**: Beautiful bar charts and progress indicators
- **Detailed Analysis View**: Expandable sections for in-depth feedback
- **Search & Filter**: Easy navigation through CV history
- **Responsive Design**: Optimized for desktop and mobile devices

### ⚡ **Real-time Processing**
- **Background Job Processing**: Asynchronous CV analysis using BullMQ
- **WebSocket Integration**: Real-time status updates during processing
- **Queue Management**: Efficient handling of multiple CV uploads
- **Progress Tracking**: Live updates on analysis progress

## 🛠 Tech Stack

### **Frontend**
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **ShadCN UI**: Modern component library
- **Framer Motion**: Smooth animations and transitions
- **Recharts**: Data visualization library
- **React Hook Form**: Form handling and validation

### **Backend**
- **Next.js API Routes**: Serverless API endpoints
- **BullMQ Worker**: Background job processing
- **Multer**: File upload handling
- **PDF-Parse**: PDF text extraction
- **Mammoth**: Word document processing

### **Database & Storage**
- **Supabase**: PostgreSQL database with real-time capabilities
- **Supabase Storage**: Secure file storage
- **Supabase Auth**: Authentication and user management

### **AI & External Services**
- **Google Gemini AI**: Advanced language model for CV analysis
- **Redis**: In-memory data store for job queues

### **Development & Testing**
- **Jest**: Testing framework
- **Testing Library**: React component testing
- **ESLint**: Code linting
- **Docker**: Containerization support

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- **Node.js 18+** and **pnpm**
- **Redis server** (for job queues)
- **Supabase project** (database and auth)
- **Google Gemini AI API key**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd najami
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Copy `.env.example` to `.env.local` and configure your environment variables:

```bash
cp .env.example .env.local
```

**Required Environment Variables:**

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Redis Configuration (for BullMQ)
REDIS_URL=redis://localhost:6379

# AI Configuration (Gemini AI)
GEMINI_API_KEY=your_gemini_api_key

# NextJS Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up Supabase:
   - Create a new Supabase project
   - Run the migration in `supabase/migrations/001_initial_schema.sql`
   - Create a storage bucket named `cv-files`
   - Enable GitHub OAuth in Authentication settings

3. Start Redis server:
```bash
redis-server
```

4. Start the development server:
```bash
pnpm dev
```

5. Start the background worker:
```bash
pnpm worker
```

### Deployment

The application can be deployed to Vercel or any Node.js hosting platform. Make sure to:

1. Set all environment variables
2. Deploy Redis instance (Redis Cloud, Railway, etc.)
3. Ensure the worker process is running

## Usage

1. Sign in with GitHub
2. Upload CV files (PDF, DOC, DOCX)
3. Wait for AI analysis to complete
4. View results in the dashboard with scores and insights

## API Endpoints

- `POST /api/cv/upload` - Get presigned upload URL
- `POST /api/cv/process` - Trigger CV processing
- `GET /api/cv/dashboard` - Get user's CVs and scores

## Architecture

The application follows a modern full-stack architecture:

1. **Frontend**: Next.js app with server-side rendering
2. **API Layer**: Next.js API routes for file handling
3. **Background Processing**: BullMQ worker for CV analysis
4. **Database**: Supabase for user data and CV metadata
5. **Storage**: Supabase Storage for file storage
6. **AI Processing**: Gemini AI for CV analysis and scoring

## 📁 Project Structure

```
najami/
├── 📁 app/                     # Next.js App Router
│   ├── 📁 api/                 # API Routes
│   │   ├── 📁 auth/            # Authentication endpoints
│   │   ├── 📁 cv/              # CV-related endpoints
│   │   │   ├── dashboard/      # Dashboard data API
│   │   │   ├── upload/         # File upload API
│   │   │   └── [id]/           # Individual CV operations
│   │   └── 📁 health/          # Health check endpoint
│   ├── 📁 auth/                # Authentication pages
│   ├── 📁 dashboard/           # Dashboard page
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── 📁 components/              # React Components
│   ├── 📁 ui/                  # Reusable UI components
│   │   ├── button.tsx          # Button component
│   │   ├── card.tsx            # Card component
│   │   ├── dialog.tsx          # Modal dialog
│   │   ├── input.tsx           # Input component
│   │   ├── progress.tsx        # Progress bar
│   │   ├── table.tsx           # Table component
│   │   └── toast.tsx           # Toast notifications
│   ├── auth-button.tsx         # Authentication button
│   ├── auth-modal.tsx          # Login/signup modal
│   ├── auth-provider.tsx       # Auth context provider
│   ├── cv-dashboard.tsx        # Main dashboard component
│   ├── cv-uploader.tsx         # File upload component
│   ├── landing-page.tsx        # Landing page component
│   ├── loading-spinner.tsx     # Loading indicator
│   ├── navbar.tsx              # Navigation bar
│   ├── security-headers.tsx    # Security headers component
│   └── websocket-provider.tsx  # WebSocket context
├── 📁 lib/                     # Utility Libraries
│   ├── supabase.ts             # Supabase client
│   └── utils.ts                # Utility functions
├── 📁 worker/                  # Background Processing
│   └── index.js                # BullMQ worker for CV analysis
├── 📁 __tests__/               # Test Suite
│   ├── ai-analysis.test.js     # AI analysis tests
│   ├── cv-analysis-integration.test.js  # Integration tests
│   └── cv-uploader.test.tsx    # Upload component tests
├── 📁 supabase/                # Database
│   └── migrations/             # Database migrations
├── 📁 scripts/                 # Utility Scripts
│   └── run-ai-tests.js         # AI testing script
├── 📁 .github/                 # GitHub Configuration
│   └── workflows/              # CI/CD workflows
├── .env.example                # Environment variables template
├── docker-compose.yml          # Docker composition
├── Dockerfile                  # Container configuration
├── jest.config.js              # Jest testing configuration
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── vercel.json                 # Vercel deployment config
```

## 🎯 Usage Guide

### For End Users

1. **🔐 Authentication**
   - Visit the application homepage
   - Click "Get Started" or "Sign In"
   - Create a new account or login with existing credentials

2. **📤 Upload Your CV**
   - Navigate to the upload section
   - Drag and drop your CV file or click to browse
   - Supported formats: PDF, DOC, DOCX
   - Maximum file size: 10MB

3. **⏳ Processing**
   - Your CV will be queued for analysis
   - Real-time updates will show processing status
   - Analysis typically takes 30-60 seconds

4. **📊 View Results**
   - Access your dashboard to see all analyzed CVs
   - View detailed scores and feedback
   - Download analysis reports
   - Track improvement over time

### For Developers

#### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Background Processing
pnpm worker           # Start BullMQ worker

# Testing
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
pnpm test:cv          # Run CV uploader tests
pnpm test:ai          # Run AI analysis tests

# Docker
docker-compose up     # Start all services with Docker
```

## 🔌 API Reference

### Authentication Endpoints
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### CV Management Endpoints
- `POST /api/cv/upload` - Upload and queue CV for analysis
- `GET /api/cv/dashboard` - Get user's CV analysis results
- `GET /api/cv/[id]` - Get specific CV analysis details
- `DELETE /api/cv/[id]` - Delete CV and associated analysis

### System Endpoints
- `GET /api/health` - System health check
- `GET /api/status` - Service status and metrics

## 🧪 Testing

The project includes comprehensive testing coverage:

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test -- --coverage

# Run specific test suites
pnpm test:cv          # Component tests
pnpm test:ai          # AI analysis tests

# Run tests in watch mode
pnpm test:watch
```

### Test Coverage
- **Unit Tests**: Component functionality and utilities
- **Integration Tests**: API endpoints and workflows
- **AI Tests**: CV analysis accuracy and performance
- **E2E Tests**: Complete user workflows

## 🚀 Deployment

### Production Deployment (Vercel - Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

2. **Environment Variables**
   - Add all required environment variables in Vercel dashboard
   - Ensure Redis URL points to production Redis instance
   - Configure Supabase production keys

3. **Database Migration**
   ```bash
   # Run migrations on production
   supabase db push --db-url "your-production-db-url"
   ```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build -d

# Or build manually
docker build -t cv-analysis-mvp .
docker run -p 3000:3000 --env-file .env cv-analysis-mvp
```

### Environment-Specific Configurations

**Development:**
- Local Redis instance
- Supabase development project
- Debug logging enabled

**Production:**
- Managed Redis service (Redis Cloud, AWS ElastiCache)
- Production Supabase project
- Error tracking (Sentry)
- Performance monitoring

## 🔧 Configuration

### Redis Configuration
```bash
# Local development
REDIS_URL=redis://localhost:6379

# Production (example)
REDIS_URL=redis://username:password@host:port
```

### Supabase Configuration
```bash
# Required for all environments
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### AI Configuration
```bash
# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Optional: Custom model settings
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TEMPERATURE=0.1
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/najami.git
   cd najami
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Your Changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

4. **Test Your Changes**
   ```bash
   pnpm test
   pnpm lint
   ```

5. **Commit and Push**
   ```bash
   git commit -m 'Add amazing feature'
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Provide a clear description of changes
   - Include screenshots for UI changes
   - Reference any related issues

### Development Guidelines

- **Code Style**: Follow TypeScript and React best practices
- **Testing**: Maintain test coverage above 80%
- **Documentation**: Update README and code comments
- **Performance**: Optimize for Core Web Vitals
- **Security**: Follow OWASP guidelines
