# AuraFlow

An emotion-aware adaptive task management system designed to reduce workplace stress through intelligent interface adaptations and evidence-based micro-interventions.

![AuraFlow Logo](src/assets/images/auraFlow-normal-colors.png)

## 🌟 Features

- **Real-time Stress Detection**: Client-side facial expression analysis using face-api.js
- **Adaptive User Interface**: Stress-responsive themes and layouts
- **Gmail Integration**: Intelligent email categorization and stress analysis
- **Task Management**: Firebase-powered task organization with stress-aware prioritization
- **Wellness Activities**: Box breathing exercises and digital doodling space
- **Privacy-First**: All biometric processing happens locally in your browser

## 🚀 Live Demo

- **Live Application**: [https://aura-flow-gamma.vercel.app/](https://aura-flow-gamma.vercel.app/)

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js**: v20.9.0
- **npm**: v10.1.0

You can check your versions by running:

```bash
node --version
npm --version
```

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ahmedMshaban/AuraFlow.git
   cd AuraFlow
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory and add the following configuration:

   ```env
   # GMAIL OAUTH2
   VITE_GOOGLE_CLIENT_ID=your_client_id_here
   VITE_GOOGLE_CLIENT_SECRET=your_client_secret_here

   # Firebase configuration
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   VITE_FIREBASE_PROJECT_ID=your_project_id_here
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   VITE_FIREBASE_APP_ID=your_app_id_here
   ```

## Running the Project

### Development Mode

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

Build the project for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Testing

Run the test suite:

```bash
npm run test
```

## 📁 Project Structure

```text
AuraFlow/
├── public/
│   ├── models/                 # face-api.js models
│   └── ...
├── src/
│   ├── assets/
│   ├── pages/
│   │   ├── activities/         # Wellness activities
│   │   ├── emails/            # Gmail integration
│   │   ├── home/              # Dashboard
│   │   ├── login/             # Authentication
│   │   ├── register/          # User registration
│   │   └── tasks/             # Task management
│   ├── shared/
│   │   ├── adaptations/       # Stress adaptations
│   │   ├── auth/              # Authentication logic
│   │   ├── components/        # Reusable components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── modules/           # Feature modules
│   │   ├── services/          # API services
│   │   ├── store/             # Redux store
│   │   └── types/             # TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── .env                       # Environment variables
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🔧 Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Styling**: CSS Modules
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **ML/AI**: face-api.js (TensorFlow.js)
- **Testing**: Vitest + React Testing Library
- **Deployment**: Vercel

## 🔐 Privacy & Security

AuraFlow prioritizes user privacy:

- **Local Processing**: All facial expression analysis happens in your browser
- **Minimal Data Storage**: Only stress scores are stored, never raw biometric data
- **Secure Authentication**: OAuth 2.0 with Google and Firebase
- **Session Management**: Tokens are stored securely and cleared on logout

## 👨‍💻 Author

Ahmed Shaban

- GitHub: [@ahmedMshaban](https://github.com/ahmedMshaban)
- Project Link: [https://github.com/ahmedMshaban/AuraFlow/](https://github.com/ahmedMshaban/AuraFlow/)

## Acknowledgments

- [face-api.js](https://github.com/justadudewhohacks/face-api.js) for facial expression recognition
- [Firebase](https://firebase.google.com/) for backend services
- [Vite](https://vitejs.dev/) for the excellent development experience
- University of London for academic support

---

**Note**: This is an academic project developed as part of a final year dissertation on emotion-aware computing and workplace wellness.
