# SiglaTrack 🧭  
A habit and event tracking app designed to gamify productivity, enhance mental wellness, and streamline daily planning.

---

## 🚀 Tech Stack

- **Frontend:** React Native (Expo)
- **Backend:** Node.js (Express)
- **Database & Auth:** Firebase (Firestore, Auth, Cloud Functions)
- **Calendar Integration:** Google Calendar, Outlook Sync

---

## 📂 Project Structure
```
SiglaTrack/
│
├── frontend/                  # React Native + Expo app
│   ├── assets/                # Images, fonts, icons
│   ├── components/            # Reusable UI components
│   ├── screens/               # App screens (Home, Dashboard, HabitTracker, etc.)
│   ├── navigation/            # React Navigation setup
│   ├── context/               # Global state (e.g., AuthContext, HabitContext)
│   ├── utils/                 # Helper functions, constants
│   ├── services/              # API calls, Firebase client setup
│   ├── hooks/                 # Custom React hooks
│   ├── App.js                 # Entry point
│   └── app.json               # Expo config
│
├── backend/                   # Node.js + Firebase backend
│   ├── controllers/           # Logic for handling requests
│   ├── models/                # Data models (if using Firestore structure)
│   ├── routes/                # Express routes
│   ├── middleware/            # Auth, validation, etc.
│   ├── utils/                 # Helper functions
│   ├── config/                # Firebase config, env setup
│   ├── index.js               # Entry point for Express server
│   └── package.json           # Backend dependencies
│
├── firebase/                  # Firebase functions and rules
│   ├── functions/             # Cloud Functions
│   ├── firestore.rules        # Firestore security rules
│   └── firebase.json          # Firebase project config
│
├── docs/                      # Documentation, roadmap, diagrams
│   ├── roadmap.txt            # Feature roadmap (Notepad version)
│   ├── architecture.png       # Visual roadmap chart
│   └── README.md              # Project overview
│
├── .gitignore                 # Git ignore file
└── README.md                  # Root README for GitHub
```

---

## 🧩 Feature Roadmap

### ✅ Core Functions
- **Event & Task Creation**
  - Title, description, date, time, category
  - Priority, reminder, repeat schedule

- **Overview Dashboard**
  - Daily, weekly, monthly calendar view
  - Today’s task summary
  - Progress tracker (e.g., “70% complete”)

- **Smart Reminders**
  - Time-based
  - Location-based (geo-triggered)
  - Behavior-based (“You usually do this every morning”)

- **Habit Tracking Integrated With Events**
  - Convert events into habits (e.g., “Read 20 mins daily”)
  - Visual habit streaks (🔥 21-day streak, ⏳ almost there badge)
  - Gamified productivity

---

### ✨ Enhancements
- **Mood + Context Tracking**
  - Log mood alongside habits/events
  - Correlate habits with emotional states
  - Notes + charts to visualize mental health impact

- **Smart Calendar Sync**
  - Sync with Google/Outlook calendars
  - Detect free time slots & suggest habit scheduling
  - Prevent clashes (e.g., reschedule workout if meeting overlaps)

- **Color Labels for Status**
  - Green = Completed
  - Red = Missed
  - Yellow = Deferred
  - Blue = Active habits

---

### 🚀 Advanced Features
- **Gamified Social Challenges**
  - Challenge friends (e.g., “Drink 8 glasses of water daily for 7 days”)
  - Leaderboards, badges, and rewards for consistency
  - Team habits: groups build habits together

---

## 📌 Setup Instructions

### Frontend
```bash
cd frontend
npm install
npx expo start
```

### Backend
```bash
cd backend
npm install
npm run dev
```
```bash
firebase deploy --only functions
```

## 📅 Project Roadmap (SiglaTrack)
**Deadline: 3rd Week of January 2026**

### Phase 1 — Planning (Week 1–2)
- Define app features  
- Write project overview  
- Finalize user flow  

### Phase 2 — Setup (Week 3)
- Install dependencies  
- Create Expo project  
- Connect Firebase  

### Phase 3 — App Structure (Week 4)
- Create folder structure  
- Setup navigation  

### Phase 4 — UI/UX (Month 1–1.5)
- Wireframe screens  
- Develop basic UI  

### Phase 5 — Core Features (Month 2–3)
- Task creation  
- Habit tracking  
- Calendar  
- Reminders  

### Phase 6 — Smart Features (Month 3–4)
- Mood logs  
- Analytics charts  

### Phase 7 — Optimization (Month 4–5)
- Responsive UI  
- Data loading optimization  

### Phase 8 — Documentation (Month 5)
- Complete sections 1–8  

### Phase 9 — Final Submission (Jan 2026)
- Build APK  
- Demo video  
- Final report  



📖 Expo Boilerplate Notes

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```


