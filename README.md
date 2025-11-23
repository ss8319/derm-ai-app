# Dermatology AI App

A multi-user dermatology AI web application with role-based access control, case assignment system, and research analytics dashboard.

## Features

- **Multi-user Authentication**: Support for clinicians, researchers, and admins
- **Role-Based Access Control (RBAC)**: Different permissions for different user roles
- **Case Assignment System**: Assign specific cases to specific clinicians
- **Research Dashboard**: Analytics and performance metrics for admins
- **AI-Assisted Diagnosis**: View AI predictions alongside clinical cases

## Tech Stack

- **Backend**: NestJS, TypeORM, SQLite, JWT Authentication
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ss8319/derm-ai-app.git
   cd derm-ai-app
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

#### Start the Backend Server

```bash
cd backend
npm run start:dev
```

The backend server will start on **http://localhost:3000**

#### Start the Frontend Server

Open a new terminal window:

```bash
cd frontend
npm run dev
```

The frontend application will be available at **http://localhost:3001**

### Seed Database (Optional)

To populate the database with sample data:

```bash
cd backend
npm run seed
```

This creates:
- 3 test users (admin, clinician1, clinician2)
- 3 sample dermatology cases
- AI predictions for each case
- Case assignments

### Default Test Users

After running the seed script, you can log in with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@derm.ai | password123 |
| Clinician | clinician1@derm.ai | password123 |
| Clinician | clinician2@derm.ai | password123 |

## Project Structure

```
derm-ai-app/
├── backend/          # NestJS backend API
│   ├── src/
│   │   ├── auth/     # Authentication & authorization
│   │   ├── users/    # User management
│   │   ├── cases/    # Case management
│   │   ├── responses/# Clinician responses
│   │   ├── assignments/ # Case assignments
│   │   └── analytics/   # Research analytics
│   └── derm_ai.db    # SQLite database
│
└── frontend/         # Next.js frontend
    ├── app/          # App router pages
    ├── components/   # React components
    ├── context/      # React context (Auth)
    └── lib/          # Utilities (API client)
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login

### Cases
- `GET /cases` - Get all cases (filtered by role)
- `GET /cases/:id` - Get case details

### Assignments
- `GET /assignments/my-cases` - Get assigned cases (clinician)
- `POST /assignments` - Assign cases (admin)

### Analytics (Admin only)
- `GET /admin/analytics/overview` - Platform metrics
- `GET /admin/analytics/cases/:id` - Case-level analytics
- `GET /admin/analytics/clinicians` - Clinician performance

## Development

### Backend Development

```bash
cd backend
npm run start:dev  # Start with hot-reload
npm run build      # Build for production
npm run test       # Run tests
```

### Frontend Development

```bash
cd frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
```

