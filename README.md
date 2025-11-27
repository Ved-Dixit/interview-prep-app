# Interview Prep App

An intelligent, AI-powered interview preparation application built with React and TypeScript. Practice interviews across 20+ professional domains with real-time feedback powered by local Hugging Face models.

## 🌟 Features

- **20 Interview Categories**: Software Engineering, Marketing, Finance, Data Science, Product Management, and more
- **Local AI Models**: Runs Hugging Face Transformers.js models directly in your browser - no API keys needed!
- **Real-time Assessment**: Get instant feedback on your answers with detailed improvement suggestions
- **Voice & Text Input**: Practice with speech recognition or traditional text input
- **Contextual Questions**: AI generates follow-up questions based on your previous answers
- **Session Tracking**: Monitor your progress and review past sessions
- **Privacy First**: All processing happens locally - your data never leaves your device
- **Offline Capable**: Works without internet after initial model download

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Modern browser (Chrome 90+, Firefox 89+, Safari 15+)

### Installation

```bash
# Clone the repository
git clone https://github.com/Ved-Dixit/interview-prep-app.git
cd interview-prep-app

# Install dependencies
npm install

# Start the development server
npm start
```

The app will open at `http://localhost:3000`

### First Use

On your first interview session:
1. Select a category
2. Enter your introductory pitch
3. Wait 30-60 seconds for the AI model to download (~250MB)
4. Start answering questions!

The model is cached locally, so subsequent uses are much faster.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

**Test Coverage**: 215 tests across 20 test suites, all passing ✅

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 19, TypeScript 4.9
- **AI/ML**: Transformers.js (@xenova/transformers)
- **Testing**: Jest, React Testing Library, fast-check (property-based testing)
- **Speech**: Web Speech API
- **Styling**: CSS3 with responsive design

### Project Structure

```
interview-prep-app/
├── src/
│   ├── components/        # React components
│   │   ├── CategorySelection.tsx
│   │   ├── InterviewSession.tsx
│   │   ├── QuestionDisplay.tsx
│   │   ├── ResponseInput.tsx
│   │   ├── AssessmentFeedback.tsx
│   │   └── ...
│   ├── services/          # Business logic
│   │   ├── HuggingFaceService.ts
│   │   ├── SessionManager.ts
│   │   └── SpeechService.ts
│   ├── types/             # TypeScript definitions
│   ├── config/            # Category configurations
│   ├── utils/             # Helper functions
│   └── tests/             # Property-based tests
├── .kiro/specs/           # Specification documents
│   └── interview-prep-app/
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
└── LOCAL_MODEL_SETUP.md   # Detailed setup guide
```

## 📚 Documentation

- [Requirements](/.kiro/specs/interview-prep-app/requirements.md) - Detailed feature requirements
- [Design](/.kiro/specs/interview-prep-app/design.md) - Architecture and design decisions
- [Tasks](/.kiro/specs/interview-prep-app/tasks.md) - Implementation checklist
- [Local Model Setup](/interview-prep-app/LOCAL_MODEL_SETUP.md) - AI model configuration

## 🎯 Interview Categories

1. Software Engineering
2. Data Science
3. Product Management
4. Marketing
5. Finance
6. Sales
7. Human Resources
8. Operations
9. Customer Success
10. Design (UX/UI)
11. Business Analysis
12. Project Management
13. Consulting
14. Healthcare
15. Education
16. Legal
17. Research
18. Engineering Management
19. DevOps/SRE
20. Quality Assurance

## 🔒 Privacy & Security

- **100% Local Processing**: All AI computations happen in your browser
- **No Data Collection**: Your responses never leave your device
- **No API Keys Required**: No external services or authentication needed
- **Offline Capable**: Works without internet after initial setup

## 🛠️ Development

### Available Scripts

- `npm start` - Start development server
- `npm test` - Run test suite
- `npm run build` - Create production build
- `npm run eject` - Eject from Create React App (one-way operation)

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Hugging Face](https://huggingface.co/) for Transformers.js
- [Xenova](https://github.com/xenova) for browser-compatible ML models
- [fast-check](https://github.com/dubzzz/fast-check) for property-based testing

## 📧 Contact

Ved Dixit - [@Ved-Dixit](https://github.com/Ved-Dixit)

Project Link: [https://github.com/Ved-Dixit/interview-prep-app](https://github.com/Ved-Dixit/interview-prep-app)

---

**Built with ❤️ using Kiro AI and spec-driven development**
