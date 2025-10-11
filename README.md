# SafeQuest 🛡️

An AI-powered interactive storytelling platform designed to teach children important life values through engaging, personalized adventures. SafeQuest combines cutting-edge AI technology with immersive storytelling to create educational content that is both fun and meaningful.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features
- **🤖 AI-Powered Story Generation**: Dynamic story creation using Groq AI API
- **🎭 Character-Based Adventures**: Multiple character personas with unique traits
- **🔊 Text-to-Speech Narration**: Immersive audio storytelling with character voices
- **🎯 Value-Based Learning**: Stories designed to teach important life lessons
- **📊 Progress Tracking**: Save and continue adventures across sessions
- **🏆 Achievement System**: Rewards for completing stories and learning values

### Interactive Elements
- **🎮 Choice-Based Gameplay**: Make decisions that affect story outcomes
- **😊 Dynamic Character Expressions**: Visual feedback based on story events
- **🎨 AI-Generated Images**: Visual storytelling with scene illustrations
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices

### Social Features
- **📝 Blog System**: Share experiences and thoughts
- **👤 User Profiles**: Showcase achievements and progress
- **💬 Community Interaction**: Like and comment on blog posts
- **🔐 Secure Authentication**: Google OAuth and traditional signup/login

### Parental Controls
- **🛡️ Safe Content**: Age-appropriate stories and interactions
- **📈 Progress Monitoring**: Track learning progress and achievements
- **⚙️ Customizable Settings**: Control content preferences

## 🛠️ Technology Stack

### Frontend
- **React 18.2.0** - Modern UI library with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation and gesture library
- **Three.js** - 3D graphics and animations
- **Lucide React** - Beautiful icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - Secure authentication
- **Multer** - File upload handling

### AI & External Services
- **Groq API** - AI story generation
- **HuggingFace API** - Image generation
- **Google OAuth** - Authentication service
- **Coqui TTS** - Text-to-speech synthesis

### Development Tools
- **Concurrently** - Run multiple servers simultaneously
- **dotenv** - Environment variable management
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

Before running SafeQuest, ensure you have the following installed:

- **Node.js** (version 16.x or higher)
- **npm** (version 8.x or higher) or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Python 3.8+** (for TTS service)
- **Git** (for version control)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Sathvik5647/Safequest.git
cd Safequest
```

### 2. Install Root Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
```

### 4. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 5. Setup TTS Service (Optional)
```bash
cd ../tts-service
pip install -r requirements.txt
```

## ⚙️ Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/safequest
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/safequest

# JWT Secret (generate a secure random string)
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Groq AI API
GROQ_API_KEY=your_groq_api_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here

# HuggingFace (for image generation)
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Frontend Configuration

The frontend uses a proxy to connect to the backend. No additional environment variables are required for basic setup.

### Getting API Keys

1. **Groq API Key**: 
   - Visit [Groq Console](https://console.groq.com/)
   - Create an account and generate an API key

2. **Google Client ID**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a project and enable Google+ API
   - Create OAuth 2.0 credentials

3. **HuggingFace API Key**:
   - Visit [HuggingFace](https://huggingface.co/)
   - Create an account and generate an API token

4. **MongoDB**:
   - Local: Install MongoDB locally
   - Cloud: Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas)

## 🏃 Running the Application

### Method 1: Run All Services Simultaneously
```bash
# From the root directory
npm start
```

This command uses `concurrently` to start both backend and frontend servers.

### Method 2: Run Services Individually

#### Start Backend Server
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

#### Start Frontend Development Server
```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

#### Start TTS Service (Optional)
```bash
cd tts-service
python app.py
# TTS service runs on http://localhost:8080
```

### Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **TTS Service**: http://localhost:8080

## 📁 Project Structure

```
safequest/
├── 📁 backend/                    # Node.js/Express backend
│   ├── 📁 models/                 # MongoDB schemas
│   ├── 📁 routes/                 # API route handlers
│   ├── 📁 public/                 # Static files and uploads
│   │   └── 📁 images/             # Generated story images
│   ├── server.js                  # Main server file
│   ├── package.json              # Backend dependencies
│   └── .env                      # Environment variables
├── 📁 frontend/                   # React frontend
│   ├── 📁 public/                 # Static assets
│   │   ├── 📁 expressions/        # Character expression images
│   │   └── 📁 images/             # UI assets
│   ├── 📁 src/                    # Source code
│   │   ├── 📁 components/         # React components
│   │   ├── 📁 utils/              # Utility functions
│   │   ├── App.js                # Main app component
│   │   ├── AppContext.js         # Global state management
│   │   └── index.js              # Entry point
│   └── package.json              # Frontend dependencies
├── 📁 tts-service/                # Python TTS service
│   ├── app.py                    # Flask TTS server
│   └── requirements.txt          # Python dependencies
├── package.json                  # Root package configuration
├── README.md                     # Project documentation
├── .gitignore                   # Git ignore rules
└── TODO.md                      # Development roadmap
```

## 📡 API Documentation

### Authentication Endpoints
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/google-auth` - Google OAuth login

### Story Endpoints
- `POST /api/generate-story` - Generate new story
- `GET /api/stories` - Get user stories
- `POST /api/stories` - Save story progress
- `PUT /api/stories/:id` - Update story progress

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/stats` - Get user statistics

### Blog Endpoints
- `GET /api/blog-posts` - Get all blog posts
- `POST /api/blog-posts` - Create blog post
- `PUT /api/blog-posts/:id` - Update blog post
- `DELETE /api/blog-posts/:id` - Delete blog post

### TTS Endpoints
- `POST /api/tts` - Generate speech audio

## 🎮 How to Use

### 1. Getting Started
1. **Sign up** or **log in** using email or Google account
2. **Select your avatar** from available characters
3. **Choose an interest** to begin your adventure

### 2. Story Experience
1. **Read or listen** to story narration
2. **Make choices** that affect the story outcome
3. **Learn values** through interactive scenarios
4. **Track progress** and achievements

### 3. Community Features
1. **Write blog posts** about your experiences
2. **View profiles** of other users
3. **Like and comment** on community content

## 🔧 Development

### Available Scripts

#### Root Level
- `npm start` - Start both frontend and backend
- `npm install` - Install root dependencies

#### Backend
- `npm start` - Start backend server
- `npm run dev` - Start with nodemon (if configured)

#### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

#### TTS Service
- `python app.py` - Start TTS server

### Adding New Features

1. **Story Characters**: Add new character files in `backend/` and corresponding expressions in `frontend/public/expressions/`
2. **Story Interests**: Update the interests array in `AppContext.js`
3. **UI Components**: Create new components in `frontend/src/components/`
4. **API Endpoints**: Add new routes in `backend/server.js`

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally or check Atlas connection string
   - Verify MONGO_URI in `.env` file

2. **API Key Issues**
   - Check all API keys are correctly set in `.env`
   - Ensure no extra spaces or quotes in environment variables

3. **TTS Not Working**
   - Ensure Python TTS service is running on port 8080
   - Check TTS dependencies are installed: `pip install -r requirements.txt`

4. **Frontend Not Loading**
   - Ensure backend is running on port 5000
   - Check proxy configuration in `frontend/package.json`

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## 🤝 Contributing

We welcome contributions to SafeQuest! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style
- Use ESLint for JavaScript code formatting
- Follow React best practices
- Write meaningful commit messages
- Add comments for complex logic

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Groq** for providing AI story generation capabilities
- **Coqui TTS** for text-to-speech functionality
- **HuggingFace** for image generation models
- **MongoDB** for database services
- **React** and **Node.js** communities for excellent documentation

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Sathvik5647/Safequest/issues) page
2. Create a new issue with detailed description
3. Contact the development team

---

**SafeQuest** - Making learning fun, safe, and interactive! 🛡️✨