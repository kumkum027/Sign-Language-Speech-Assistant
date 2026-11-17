# AURALIS – Classroom Without Barriers 🎓✨

> **"Every Voice. Every Gesture. Every Student."**

A modern full-stack web accessibility platform designed to empower Deaf and Hard-of-Hearing (DHH) students to actively participate in academic classroom lectures.

Auralis bridges the communication divide by converting:
1. **Teacher's Spoken Words** into real-time, synchronized text captions with interim-to-final speech stabilization.
2. **Supported Sign Language Gestures** into readable text captions using browser-based computer vision (21 3D hand landmarks).

Built exclusively with **100% Pure JavaScript / JSX** across the entire full-stack ecosystem.

---

## 🌟 Key Capabilities

### 1. Real-Time Speech-to-Text Perception
- **Continuous Speech Recognition**: Native browser Web Speech API streaming without external microservice overhead.
- **Volatile Interim vs. Finalized Text**: Syllable-by-syllable interim hypotheses displayed with a live typing pulse, while finalized segments commit cleanly without duplication or buffer overflow.
- **Multilingual Support**: Tailored for Indian English (`en-IN`), General English (`en-US`), British English (`en-GB`), and Hindi (`hi-IN`).
- **Web Audio Metering**: Dynamic mic level bar (0–100%) powered by `AudioContext` and `AnalyserNode` for real-time visual feedback.

### 2. Computer Vision ISL Gesture Recognition
- **MediaPipe Hand Landmarker**: Runs directly in the browser via client-side WebAssembly / WebGL extracting 21 three-dimensional skeletal coordinates at up to 30 FPS.
- **Kinematic & Geometric Classification**: Scale-invariant classification of core Indian Sign Language gestures:
  - ☝️ **QUESTION / DOUBT**: Index finger extended upward, other fingers curled.
  - 👍 **YES / AGREE**: Thumbs up with closed fist.
  - 👎 **NO / DISAGREE**: Thumbs down with closed fist.
  - ✌️ **PEACE / VICTORY / TWO**: Index and middle fingers extended in a V-shape.
  - 👌 **OK / UNDERSTOOD**: Thumb and index tip pinch, 3 fingers extended.
  - ✋ **HELLO / GREETING**: Open flat palm with 5 extended fingers.
  - ✊ **IMPORTANT / NOTE THIS**: Closed fist hold.
  - 🤲 **HELP / ASSIST**: Flat open horizontal hand with palm cupped upward.
- **Temporal Debouncing**: 10-frame consensus buffer prevents camera noise and suppresses duplicate gesture spamming.
- **Skeleton Visualizer Overlay**: Real-time skeletal overlay drawn over webcam stream showing joint bones and glowing fingertips.

### 3. Real-Time Classroom Synchronization (Socket.IO)
- **Room Isolation**: Bi-directional communication grouped by lecture and classroom rooms.
- **Instantaneous Broadcasting**: Synchronizes speech interim text, finalized caption blocks, gesture events, and participant counters between teachers and students.
- **Connection Health Telemetry**: Live status indicators (`CONNECTED`, `CONNECTING`, `OFFLINE`).

### 4. Dual-Role Workspaces
- **Instructor Dashboard**:
  - Create and manage classrooms with unique 6–8 character invite codes (e.g. `AURA-8942`).
  - One-click live lecture launch with automatic microphone and gesture camera initialization.
  - Full classroom lecture management and participant metrics.
- **Student Learning Portal**:
  - Join any classroom using an instructor's invite code.
  - Personalized accessibility preferences (font scaling, OLED contrast).
  - Interactive sign gesture input to ask doubts or react silently.

### 5. Accessibility-First Editorial Design
- **Color System**: High-contrast editorial palette (#F6F7F4, #172521, #176B60, #B7D9CF, #142B29).
- **OLED High Contrast Mode**: WCAG 2.2 AAA compliant true dark mode (#0B0F0E background with high-contrast text and luminous borders).
- **Dynamic Caption Scaling**: Seamless font sizing (Standard 20px, Large 26px, Extra Large 34px).
- **Smart Auto-Scroll**: Seamless auto-scroll that automatically pauses when a student scrolls up to read earlier material, with a "Resume Live Stream" button.

### 6. Lecture History & Export Suite
- **Complete Lecture Archive**: Filterable history by classroom, subject, and status (*All*, *Live Now*, *Concluded*).
- **Deep Transcript Reader**: Chronological transcript with speaker attribution and separate badges for `[SPEECH]` vs `[SIGN GESTURE]`.
- **Multi-Format Export**:
  - Plain Text (`.txt`) with timestamps.
  - Structured JSON (`.json`) with confidence scores.
  - Print / Save to PDF layout.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Lucide React, Framer Motion
- **Backend**: Next.js Route Handlers, Node.js, Socket.IO Server
- **Database**: Prisma ORM with SQLite (local development `dev.db`) & PostgreSQL production schema
- **Authentication**: JWT, bcrypt password hashing, HTTP-only secure cookies
- **AI & Computer Vision**: Web Speech API, MediaPipe Hand Landmarker (`@mediapipe/tasks-vision`), TensorFlow.js
- **Form Handling & Validation**: React Hook Form, Zod

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node.js v20 and v24)
- npm or pnpm

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Ujjawal0001/Sign-Language-Speech-Assistant-.git
cd Sign-Language-Speech-Assistant-
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default local variables:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="auralis-super-secret-jwt-key-for-development-mode-2025"
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
SOCKET_PORT="3001"
```

### 4. Database Setup
Initialize the SQLite database with Prisma:
```bash
npm run prisma:push
```

### 5. Running the Application
A single command runs **both** the Next.js frontend (port 3000) and the Socket.IO realtime server (port 3001) concurrently:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in Google Chrome or Microsoft Edge.

---

## 🧪 Automated Test Suites

Auralis includes comprehensive automated test suites covering all system modules:
```bash
# Run all phase tests (66 / 66 passing)
node scripts/test-phase4.js      # Authentication, JWT, and bcrypt tests
node scripts/test-phase5.js      # Classrooms, Unique codes, and Role access
node scripts/test-phase6-7.js    # Lectures, Speech APIs, and Transcripts
node scripts/test-phase8-9.js    # 21-Joint Geometry, MediaPipe Gestures, and Socket Sync
node scripts/test-phase10.js     # Lecture History, Serialization, and Export Formats
```

---

## 📁 Project Architecture

```
├── prisma/
│   ├── schema.prisma             # SQLite local database model
│   └── schema.postgresql.prisma  # PostgreSQL remote deployment model
├── server/
│   └── socket-server.js          # Standalone Socket.IO realtime server (port 3001)
├── src/
│   ├── app/
│   │   ├── api/                  # REST Route Handlers (auth, classrooms, lectures, transcripts)
│   │   ├── classroom/[id]/       # Dedicated Live Classroom Workspace
│   │   ├── lectures/             # Lecture History Hub & In-Depth Transcript Viewer
│   │   ├── login/ & register/    # Split-screen authentication pages
│   │   ├── teacher/dashboard/    # Instructor management portal
│   │   ├── student/dashboard/    # Student learning portal
│   │   ├── layout.jsx            # Root HTML layout with Auralis design system
│   │   └── page.jsx              # Editorial Landing Page
│   ├── components/
│   │   ├── classroom/            # LiveHeader, CaptionView, SidePanel, TeacherControls, StudentControls
│   │   ├── landing/              # Hero, HowItWorks, SpeechCapabilities, SignLanguage, etc.
│   │   └── layout/               # Navbar, Footer
│   ├── hooks/
│   │   ├── useSpeechRecognition.js   # Web Speech API + Web Audio frequency visualizer
│   │   ├── useGestureRecognition.js  # MediaPipe Hand Landmarker + 21-keypoint tracking
│   │   └── useClassroomSocket.js     # Socket.IO client room synchronization
│   └── lib/
│       ├── gesture/              # classifier.js, drawing.js, stabilizer.js
│       ├── auth.js               # bcrypt & JWT helpers
│       ├── classroom-code.js     # Unique room code generator (AURA-XXXX)
│       └── prisma.js             # Singleton Prisma client
└── scripts/                      # Automated test scripts for Phases 4-10
```

---

## 📄 License
This project is licensed under the MIT License.
