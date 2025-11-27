import React, { useState, createContext, useContext } from 'react';
import { CategorySelection } from './components/CategorySelection';
import { InterviewSession } from './components/InterviewSession';
import { SessionSummary } from './components/SessionSummary';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SessionManager } from './services/SessionManager';
import { SessionSummary as SessionSummaryType } from './types';
import './App.css';

// Application view states
enum AppView {
  CATEGORY_SELECTION = 'CATEGORY_SELECTION',
  INTERVIEW_SESSION = 'INTERVIEW_SESSION',
  SESSION_SUMMARY = 'SESSION_SUMMARY',
}

// Global application state context
interface AppContextType {
  apiKey?: string;
  setApiKey: (key: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

function App() {
  // View state management
  const [currentView, setCurrentView] = useState<AppView>(AppView.CATEGORY_SELECTION);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sessionSummary, setSessionSummary] = useState<SessionSummaryType | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  
  // Global configuration
  const [apiKey, setApiKey] = useState<string | undefined>(
    process.env.REACT_APP_HUGGINGFACE_API_KEY
  );

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentView(AppView.INTERVIEW_SESSION);
  };

  // Handle session end - receives the summary from InterviewSession
  const handleSessionEnd = (summary: SessionSummaryType) => {
    setSessionSummary(summary);
    setCurrentSessionId(summary.sessionId);
    setCurrentView(AppView.SESSION_SUMMARY);
  };

  // Handle starting a new session
  const handleStartNewSession = () => {
    setSelectedCategory('');
    setSessionSummary(null);
    setCurrentView(AppView.CATEGORY_SELECTION);
  };

  const appContextValue: AppContextType = {
    apiKey,
    setApiKey,
  };

  return (
    <AppContext.Provider value={appContextValue}>
      <ErrorBoundary>
        <div className="app" role="application" aria-label="Interview preparation application">
          <main className="app-container" role="main">
            {currentView === AppView.CATEGORY_SELECTION && (
              <CategorySelection onCategorySelect={handleCategorySelect} />
            )}

            {currentView === AppView.INTERVIEW_SESSION && selectedCategory && (
              <InterviewSession
                category={selectedCategory}
                onSessionEnd={handleSessionEnd}
                apiKey={apiKey}
              />
            )}

            {currentView === AppView.SESSION_SUMMARY && sessionSummary && (
              <SessionSummary
                summary={sessionSummary}
                onStartNewSession={handleStartNewSession}
              />
            )}
          </main>
        </div>
      </ErrorBoundary>
    </AppContext.Provider>
  );
}

export default App;
