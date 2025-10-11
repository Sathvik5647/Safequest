# Contributing to SafeQuest 🛡️

We're excited that you're interested in contributing to SafeQuest! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful, inclusive, and constructive in all interactions.

### Our Standards

- **Be Respectful**: Treat everyone with respect and kindness
- **Be Inclusive**: Welcome people of all backgrounds and experience levels
- **Be Constructive**: Provide helpful feedback and suggestions
- **Be Professional**: Keep interactions focused and professional

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** (16.x or higher)
- **npm** or **yarn**
- **Git** for version control
- **MongoDB** (local or Atlas)
- **Python 3.8+** (for TTS service)
- A code editor (VS Code recommended)

### First Time Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/Safequest.git
   cd Safequest
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/Sathvik5647/Safequest.git
   ```
4. **Run setup script**:
   ```bash
   # On Linux/Mac
   chmod +x setup.sh
   ./setup.sh
   
   # On Windows
   setup.bat
   ```

## 💻 Development Setup

### Environment Configuration

1. Copy the example environment file:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Fill in your API keys and configuration in `backend/.env`

3. Start the development servers:
   ```bash
   # Start all services
   npm start
   
   # Or start individually
   cd backend && npm start    # Backend on :5000
   cd frontend && npm start   # Frontend on :3000
   cd tts-service && python app.py  # TTS on :8080
   ```

### Database Setup

**Local MongoDB:**
```bash
# Install MongoDB locally and start it
mongod
```

**MongoDB Atlas:**
```bash
# Use connection string in .env file
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/safequest
```

## 📁 Project Structure

```
safequest/
├── 📁 backend/                 # Node.js/Express API
│   ├── 📁 models/             # Database schemas
│   ├── 📁 routes/             # API endpoints
│   ├── 📁 public/             # Static files
│   └── server.js              # Main server file
├── 📁 frontend/               # React frontend
│   ├── 📁 src/
│   │   ├── 📁 components/     # React components
│   │   ├── 📁 utils/          # Utility functions
│   │   ├── App.js             # Main app component
│   │   └── AppContext.js      # Global state
│   └── 📁 public/             # Static assets
├── 📁 tts-service/           # Python TTS service
└── 📄 Configuration files
```

## 🔧 Contributing Guidelines

### Types of Contributions

We welcome various types of contributions:

- **🐛 Bug Fixes**: Fix issues and improve stability
- **✨ Features**: Add new functionality
- **📝 Documentation**: Improve docs and examples
- **🎨 UI/UX**: Enhance user interface and experience
- **⚡ Performance**: Optimize speed and efficiency
- **🧪 Testing**: Add or improve tests
- **♿ Accessibility**: Make the app more accessible

### Before You Start

1. **Check existing issues** to see if your idea is already being worked on
2. **Open an issue** to discuss major changes before implementation
3. **Keep changes focused** - one feature/fix per pull request
4. **Follow coding standards** outlined below

### Branch Naming

Use descriptive branch names:
- `feature/story-generation-improvements`
- `bugfix/tts-audio-sync-issue`
- `docs/api-documentation-update`
- `ui/character-selection-redesign`

## 📝 Pull Request Process

### 1. Prepare Your Changes

```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "Add: detailed description of changes"

# Push to your fork
git push origin feature/your-feature-name
```

### 2. Create Pull Request

1. **Open a PR** from your fork to the main repository
2. **Use the PR template** and fill in all sections
3. **Link related issues** using keywords like "Fixes #123"
4. **Add screenshots** for UI changes
5. **Request review** from maintainers

### 3. PR Requirements

Before your PR can be merged:

- ✅ All tests must pass
- ✅ Code follows style guidelines  
- ✅ No merge conflicts
- ✅ Documentation is updated
- ✅ Changes are tested manually
- ✅ At least one maintainer approval

## 🐛 Issue Guidelines

### Reporting Bugs

Use the bug report template and include:

- **Clear title** describing the issue
- **Steps to reproduce** the problem
- **Expected vs actual behavior**
- **Screenshots/videos** if applicable
- **Environment details** (OS, browser, Node version)
- **Error messages** or console logs

### Feature Requests

Use the feature request template and include:

- **Clear description** of the feature
- **Use case** and user benefit
- **Acceptance criteria** 
- **Mockups or examples** if applicable
- **Implementation considerations**

### Issue Labels

We use labels to categorize issues:

- `bug` - Something isn't working
- `enhancement` - New feature request
- `documentation` - Docs improvements
- `good first issue` - Good for newcomers
- `help wanted` - Community help needed
- `priority:high` - Critical issues
- `ui/ux` - User interface improvements

## 📊 Coding Standards

### JavaScript/React

```javascript
// Use consistent formatting
const MyComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  const handleClick = useCallback(() => {
    // Event handler logic  
  }, [dependencies]);
  
  return (
    <div className="component-wrapper">
      {/* JSX content */}
    </div>
  );
};

export default MyComponent;
```

### CSS/Tailwind

```css
/* Use semantic class names */
.story-container {
  @apply flex flex-col items-center p-6 bg-white rounded-lg shadow-md;
}

/* Group related utilities */
.character-avatar {
  @apply w-16 h-16 rounded-full border-2 border-blue-500 object-cover;
}
```

### Python (TTS Service)

```python
# Follow PEP 8 style guide
def generate_speech(text: str, character_name: str) -> bytes:
    """Generate speech audio from text.
    
    Args:
        text: The text to convert to speech
        character_name: Character voice to use
        
    Returns:
        Audio data as bytes
    """
    # Implementation
    pass
```

### General Guidelines

- **Use meaningful variable names**
- **Write self-documenting code**
- **Add comments for complex logic**
- **Keep functions small and focused**
- **Handle errors gracefully**
- **Follow existing patterns**

## 🧪 Testing

### Frontend Testing

```bash
cd frontend
npm test                    # Run Jest tests
npm run test:coverage      # Run with coverage
npm run test:watch         # Watch mode
```

### Backend Testing

```bash
cd backend  
npm test                   # Run API tests
npm run test:integration   # Integration tests
```

### Manual Testing

Before submitting PRs, manually test:

- ✅ **Story generation** works correctly
- ✅ **Character selection** functions properly  
- ✅ **TTS narration** plays audio
- ✅ **User authentication** works
- ✅ **Responsive design** on different screens
- ✅ **Error handling** displays appropriate messages

## 📚 Documentation

### Code Documentation

- **JSDoc comments** for complex functions
- **README updates** for new features
- **API documentation** for new endpoints
- **Component documentation** for reusable components

### Writing Guidelines

- Use **clear, concise language**
- Include **code examples** where helpful
- Add **screenshots** for UI features  
- Keep documentation **up to date**
- Use **proper markdown formatting**

### Documentation Structure

```markdown
## Feature Name

Brief description of what the feature does.

### Usage

```javascript
// Code example
const result = useFeature(options);
```

### Props/Parameters

| Name | Type | Description | Required |
|------|------|-------------|----------|
| prop1 | string | Description | Yes |
| prop2 | number | Description | No |

### Examples

Add practical examples here.
```

## 🎯 Development Workflow

### 1. Planning Phase
- Review requirements
- Break down into tasks  
- Estimate effort
- Plan implementation approach

### 2. Implementation Phase
- Write failing tests (TDD)
- Implement functionality
- Make tests pass
- Refactor and optimize

### 3. Review Phase
- Self-review changes
- Test manually
- Update documentation
- Submit pull request

### 4. Iteration Phase
- Address review feedback
- Make necessary changes
- Re-test functionality
- Merge when approved

## 🏆 Recognition

### Contributors

We recognize contributors in several ways:

- **Contributors section** in README
- **Changelog entries** for significant contributions
- **Special recognition** for major features
- **Maintainer status** for consistent contributors

### Contribution Types

We value all types of contributions:

- 💻 **Code contributions**
- 📝 **Documentation improvements** 
- 🐛 **Bug reports**
- 💡 **Feature suggestions**
- 🎨 **Design contributions**
- 📢 **Community support**

## 📞 Getting Help

### Community Support

- **GitHub Discussions** - For questions and ideas
- **Issues** - For bug reports and feature requests
- **Discord/Slack** - For real-time chat (if available)

### Maintainer Contact

For urgent issues or security concerns:
- Open a private security issue
- Email maintainers directly
- Tag maintainers in issues

## 📋 Checklist for Contributors

Before submitting a contribution:

- [ ] I have read and understood the contributing guidelines
- [ ] My code follows the project's style guidelines
- [ ] I have tested my changes thoroughly
- [ ] I have updated documentation where necessary
- [ ] My commit messages are clear and descriptive
- [ ] I have linked any related issues
- [ ] All tests pass locally
- [ ] I have resolved any merge conflicts

## 🎉 Thank You!

Thank you for contributing to SafeQuest! Your efforts help make learning fun, safe, and interactive for children everywhere. Every contribution, no matter how small, makes a difference.

Together, we're building something amazing! 🛡️✨

---

**Happy Contributing!** 🚀