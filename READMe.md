# HarBaat AI (formerly Knowledge Orchestrator)

An enterprise-grade, multi-tenant workspace for transforming your meetings into structured, searchable knowledge with AI-powered transcription and entity extraction.

## 🚀 Features

### Core Features
- **Multi-Tenant Workspaces**: Dedicated, isolated projects and team environments.
- **Role-Based Access Control (RBAC)**: Manage granular permissions across projects and meetings.
- **Audio Upload**: Support for MP3, WAV, M4A, and OGG formats with mandatory recording consent flows.
- **Meeting Library**: View all processed meetings with scoped data fetching and advanced analytics.
- **Premium Audio Playback**: Synchronized audio and transcript editing suite.
- **Speaker Diarization**: Automatic identification of different speakers.
- **Smart Search**: Find specific content within transcripts.
- **Entity Extraction & Knowledge Graph**: Automatic extraction of tasks/decisions, visualized via an interactive Cytoscape.js graph.

### Authentication & User Management
- **User Registration & Login**: Secure account creation and authentication.
- **Email Verification**: Verify email addresses with secure tokens (7-day expiry).
- **Password Reset**: Forgot password flow with secure reset tokens (1-hour expiry).
- **User Profiles**: View and edit profile information.
- **Session Management**: JWT-based authentication with NextAuth.

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

## 🛠️ Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:3000`

**Note**: For production builds, use:
```bash
npm run build
npm start
```

## 📁 Project Structure

```
FYP-Knowledge-Orchestrator/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── auth.py              # Authentication endpoints
│   ├── requirements.txt     # Python dependencies
│   └── uploads/            # Uploaded audio files (created automatically)
│
├── frontend/
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   │   ├── layout.tsx  # Root layout
│   │   │   ├── page.tsx    # Home page
│   │   │   ├── profile/    # User profile page
│   │   │   ├── auth/       # Authentication pages
│   │   │   │   ├── signin/      # Sign in page
│   │   │   │   ├── signup/      # Sign up page
│   │   │   │   ├── forgot-password/  # Password reset request
│   │   │   │   ├── reset-password/   # Password reset form
│   │   │   │   └── verify-email/     # Email verification
│   │   │   ├── providers.tsx # React Query & other providers
│   │   │   └── globals.css # Global styles
│   │   ├── lib/
│   │   │   ├── api/        # API client & services
│   │   │   │   ├── client.ts      # Axios client configuration
│   │   │   │   ├── meetings.ts    # Meeting API endpoints
│   │   │   │   └── auth.ts        # Authentication API endpoints
│   │   │   ├── hooks/      # Custom React hooks
│   │   │   │   ├── useMeetings.ts
│   │   │   │   └── useTranscript.ts
│   │   │   └── utils/      # Utility functions
│   │   │       ├── cn.ts           # Class name utilities
│   │   │       ├── formatters.ts   # Date/time formatters
│   │   │       └── validation.ts   # Form validation
│   │   ├── config/         # Configuration constants
│   │   │   └── constants.ts
│   │   ├── auth.ts         # NextAuth configuration
│   │   ├── middleware.ts  # Auth middleware
│   │   └── types/          # TypeScript type definitions
│   │       └── index.ts
│   ├── components/         # React components
│   │   ├── layout/         # Layout components (UserMenu, etc.)
│   │   └── ui/             # UI components (shadcn/ui)
│   ├── package.json
│   ├── next.config.ts      # Next.js configuration
│   ├── tailwind.config.ts  # Tailwind CSS configuration
│   └── tsconfig.json       # TypeScript configuration
│
└── README.md
```

## 🎯 Usage

### Authentication

#### 1. Create an Account
1. Navigate to `/auth/signup`
2. Enter your name, email, and password
3. Click "Sign Up"
4. Check your email for verification link (or use the token in development mode)

#### 2. Verify Your Email
1. Click the verification link in your email
2. Or visit `/auth/verify-email?token={your_token}`
3. Your email will be verified and you can access all features

#### 3. Sign In
1. Navigate to `/auth/signin`
2. Enter your email and password
3. Click "Sign In"

#### 4. Reset Password
1. On the sign-in page, click "Forgot password?"
2. Enter your email address
3. Check your email for reset link (or use the token in development mode)
4. Click the link and enter your new password

#### 5. Manage Profile
1. Click on your avatar in the top right
2. Select "Profile"
3. Edit your name or email
4. View email verification status
5. Resend verification email if needed

### Meeting Management

#### 1. Upload a Meeting

1. Sign in to your account
2. Go to the home page
3. Drag & drop or browse for an audio file
4. Click "Upload & Process"
5. Wait for processing to complete

#### 2. View Transcript

1. Click on any meeting from the list
2. View the full transcript with speaker labels
3. Use the search bar to find specific content
4. Click on timestamps to jump to relevant sections

#### 3. Review Extracted Entities

- **Tasks**: View assigned tasks with owners and deadlines
- **Decisions**: See key decisions made during the meeting
- Click timestamp buttons to jump to relevant transcript sections

## 🔧 API Endpoints

### Authentication Endpoints

#### User Registration
```
POST /api/auth/signup
Content-Type: application/json
Body: { "name": "string", "email": "string", "password": "string" }
```

#### User Login
```
POST /api/auth/login
Content-Type: application/json
Body: { "email": "string", "password": "string" }
```

#### Forgot Password
```
POST /api/auth/forgot-password
Content-Type: application/json
Body: { "email": "string" }
```

#### Reset Password
```
POST /api/auth/reset-password
Content-Type: application/json
Body: { "token": "string", "new_password": "string" }
```

#### Verify Email
```
POST /api/auth/verify-email
Content-Type: application/json
Body: { "token": "string" }
```

#### Resend Verification Email
```
POST /api/auth/resend-verification
Content-Type: application/json
Body: { "email": "string" }
```

#### Get User Profile
```
GET /api/auth/profile/{user_id}
```

#### Update User Profile
```
PUT /api/auth/profile/{user_id}
Content-Type: application/json
Body: { "name": "string" (optional), "email": "string" (optional) }
```

### Meeting Endpoints

#### Upload Meeting
```
POST /api/meetings/upload
Content-Type: multipart/form-data
```

#### Get All Meetings
```
GET /api/meetings
```

#### Get Meeting Details
```
GET /api/meetings/{meeting_id}
```

#### Get Transcript
```
GET /api/meetings/{meeting_id}/transcript
```

#### Search Transcript
```
GET /api/meetings/{meeting_id}/search?q={query}
```

#### Get Extracted Entities
```
GET /api/meetings/{meeting_id}/entities
```

#### Get Processing Status
```
GET /api/meetings/{meeting_id}/status
```

#### Mock Complete (Testing)
```
POST /api/meetings/{meeting_id}/mock-complete
```

## 🧪 Testing with Mock Data

For development purposes, you can simulate completed processing:

```bash
curl -X POST http://localhost:8000/api/meetings/{meeting_id}/mock-complete
```

This will populate the meeting with sample transcript and entity data.

## 🎨 Customization

### Modify Supported File Types

Edit `backend/main.py`:
```python
allowed_extensions = {".mp3", ".wav", ".m4a", ".ogg", ".flac"}
```

### Change Upload Size Limit

Edit `frontend/src/config/constants.ts`:
```typescript
export const APP_CONFIG = {
  maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '104857600'), // 100MB
  // ...
};
```

### Adjust Speaker Colors

Edit `frontend/src/config/constants.ts`:
```typescript
export const SPEAKER_COLORS = [
  '#1890ff',
  '#52c41a',
  '#fa8c16',
  '#eb2f96',
  '#722ed1',
  '#13c2c2',
] as const;
```

### Change API Base URL

Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling & Dark-first premium design
- **NextAuth.js** - Authentication and session management
- **TanStack Query** - Data fetching and caching
- **Zustand** - State management
- **Cytoscape.js** - Knowledge graph visualization
- **Wavesurfer.js** - Audio playback synchronization
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Sonner** - Toast notifications
- **shadcn/ui** - UI component library
- **next-themes** - Dark/Light mode support

### Backend
- **FastAPI** - Python web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **aiofiles** - Async file operations
- **bcrypt** - Password hashing
- **secrets** - Secure token generation

## 📝 Next Steps (Future Development)

- [ ] Integrate actual ASR pipeline (WhisperX)
- [ ] Add LLM-based entity extraction
- [x] Implement interactive knowledge graph (Cytoscape.js) ✅
- [x] Add audio playback synchronized with transcript ✅
- [ ] Support real-time transcription
- [x] Add user authentication ✅
- [x] Email verification ✅
- [x] Password reset functionality ✅
- [x] User profile management ✅
- [x] Implement Multi-Tenancy & Teams ✅
- [x] Add role-based access control (RBAC) ✅
- [ ] Implement task management features
- [ ] Export functionality (PDF, Word)
- [ ] Add database persistence (currently in-memory)
- [ ] Integrate email service (SendGrid/AWS SES) for production
- [ ] Implement OAuth providers (Google, GitHub)

## 🐛 Troubleshooting

### CORS Errors
Make sure the backend is running on port 8000 and frontend on port 3000. The backend CORS middleware is configured to allow requests from `http://localhost:3000`.

### File Upload Fails
Check that the `uploads` directory exists in the backend folder and has write permissions. It should be created automatically on first run.

### Port Already in Use
Kill the process using the port:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Next.js Build Errors
If you encounter TypeScript errors during build, ensure all dependencies are installed:
```bash
cd frontend
npm install
```

### Environment Variables
If the API URL is not working, check that `NEXT_PUBLIC_API_URL` is set correctly in your `.env.local` file or use the default `http://localhost:8000/api`.

Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### Authentication Issues
- **Token not working**: Verification and reset tokens expire (7 days for email verification, 1 hour for password reset). Request a new one if expired.
- **Email not verified**: Check your email inbox or use the "Resend Verification" button in your profile.
- **Can't reset password**: Make sure you're using the correct token from the email. Tokens are single-use and expire after 1 hour.

### Development Mode Notes
- In development, verification and reset tokens are returned in API responses for testing purposes
- **Remove token exposure in production** - implement actual email sending service
- Currently using in-memory storage - migrate to database for production use

## 👥 Team

- **Asim Majeed** (22K-4535) - ASR & Transcription
- **Muhammad Muzammil** (22K-4267) - Dashboard, Multi-Tenancy & LLM Integration
- **Ayan Hasan** (22K-4367) - Knowledge Graph & Entity Extraction

## 📄 License

This project is part of the Final Year Project at FAST-NUCES, Karachi Campus.

## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using bcrypt before storage
- **Secure Tokens**: Verification and reset tokens use cryptographically secure random generation
- **Token Expiration**: 
  - Email verification tokens expire after 7 days
  - Password reset tokens expire after 1 hour
- **Single-Use Tokens**: Reset and verification tokens are deleted after use
- **Session Management**: JWT-based sessions with NextAuth.js
- **CORS Protection**: Configured CORS middleware for secure cross-origin requests

## 📧 Email Integration (TODO)

Currently, the application generates verification and reset tokens but doesn't send emails. For production:

1. **Choose an email service**:
   - SendGrid
   - AWS SES
   - Mailgun
   - Resend

2. **Create email templates** for:
   - Email verification
   - Password reset
   - Welcome emails

3. **Update backend** to send emails instead of returning tokens

4. **Configure environment variables**:
   ```env
   EMAIL_SERVICE_API_KEY=your-api-key
   EMAIL_FROM=noreply@yourapp.com
   ```

