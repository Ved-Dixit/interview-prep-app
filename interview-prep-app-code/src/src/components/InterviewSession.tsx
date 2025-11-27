import React, { useState, useEffect, createContext, useContext } from 'react';
import { SessionManager } from '../services/SessionManager';
import { HuggingFaceService } from '../services/HuggingFaceService';
import {
  Session,
  SessionState,
  Assessment,
  PitchAnalysis,
  HuggingFaceError,
} from '../types';
import { IntroductoryPitch } from './IntroductoryPitch';
import { QuestionDisplay } from './QuestionDisplay';
import { ResponseInput } from './ResponseInput';
import { AssessmentFeedback } from './AssessmentFeedback';
import { SessionProgress } from './SessionProgress';
import { generateUserMessage } from '../utils/errorMessages';
import './InterviewSession.css';

interface InterviewSessionContextType {
  session: Session | null;
  sessionManager: SessionManager;
  hfService: HuggingFaceService;
}

const InterviewSessionContext = createContext<InterviewSessionContextType | null>(null);

export const useInterviewSession = () => {
  const context = useContext(InterviewSessionContext);
  if (!context) {
    throw new Error('useInterviewSession must be used within InterviewSessionProvider');
  }
  return context;
};

interface InterviewSessionProps {
  category: string;
  onSessionEnd: (summary: import('../types').SessionSummary) => void;
  apiKey?: string;
}

export const InterviewSession: React.FC<InterviewSessionProps> = ({
  category,
  onSessionEnd,
  apiKey,
}) => {
  const [sessionManager] = useState(() => new SessionManager());
  const [hfService] = useState(() => new HuggingFaceService(apiKey));
  const [session, setSession] = useState<Session | null>(null);
  
  // Pitch state
  const [pitchAnalysis, setPitchAnalysis] = useState<PitchAnalysis | undefined>();
  const [isPitchLoading, setIsPitchLoading] = useState(false);
  const [pitchError, setPitchError] = useState<string>('');
  
  // Question state
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [isQuestionLoading, setIsQuestionLoading] = useState(false);
  
  // Response state
  const [isResponseProcessing, setIsResponseProcessing] = useState(false);
  const [responseError, setResponseError] = useState<string>('');
  
  // Assessment state
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [isAssessmentLoading, setIsAssessmentLoading] = useState(false);

  // Initialize session on mount
  useEffect(() => {
    const newSession = sessionManager.initializeSession(category);
    setSession(newSession);
  }, [category, sessionManager]);

  // Handle pitch submission
  const handlePitchSubmit = async (pitch: string) => {
    setIsPitchLoading(true);
    setPitchError('');

    try {
      // Analyze the pitch
      const analysis = await hfService.analyzeIntroduction(pitch);
      setPitchAnalysis(analysis);

      // Store pitch in session
      sessionManager.storePitch(pitch);
      const updatedSession = sessionManager.getCurrentSession();
      setSession(updatedSession);

      // Generate first question
      await generateNextQuestion();
    } catch (error) {
      if (error instanceof Error) {
        setPitchError(generateUserMessage(error));
      } else {
        setPitchError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsPitchLoading(false);
    }
  };

  // Generate next question based on context
  const generateNextQuestion = async () => {
    setIsQuestionLoading(true);
    setCurrentAssessment(null);

    try {
      const context = sessionManager.getContext();
      const question = await hfService.generateQuestion(context, category);
      setCurrentQuestion(question);
    } catch (error) {
      if (error instanceof HuggingFaceError) {
        // Fallback to a generic question if generation fails
        setCurrentQuestion('Can you tell me about a challenging project you worked on?');
      }
    } finally {
      setIsQuestionLoading(false);
    }
  };

  // Handle response submission
  const handleResponseSubmit = async (answer: string) => {
    setIsResponseProcessing(true);
    setIsAssessmentLoading(true);
    setResponseError('');

    try {
      // Assess the response
      const assessment = await hfService.assessResponse(
        currentQuestion,
        answer,
        category
      );
      setCurrentAssessment(assessment);

      // Add exchange to session
      sessionManager.addExchange(currentQuestion, answer, assessment);
      const updatedSession = sessionManager.getCurrentSession();
      setSession(updatedSession);

      setIsAssessmentLoading(false);

      // Wait a moment for user to review assessment, then generate next question
      setTimeout(() => {
        generateNextQuestion();
      }, 2000);
    } catch (error) {
      setIsAssessmentLoading(false);
      if (error instanceof Error) {
        setResponseError(generateUserMessage(error));
      } else {
        setResponseError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsResponseProcessing(false);
    }
  };

  // Handle session end
  const handleEndSession = () => {
    const summary = sessionManager.endSession();
    onSessionEnd(summary);
  };

  if (!session) {
    return <div>Loading session...</div>;
  }

  const contextValue: InterviewSessionContextType = {
    session,
    sessionManager,
    hfService,
  };

  return (
    <InterviewSessionContext.Provider value={contextValue}>
      <div className="interview-session">
        <SessionProgress
          currentState={session.currentState}
          questionsCompleted={session.exchanges.length}
          onEndSession={handleEndSession}
        />

        {session.currentState === SessionState.INTRODUCTORY_PITCH && (
          <IntroductoryPitch
            onPitchSubmit={handlePitchSubmit}
            pitchAnalysis={pitchAnalysis}
            isLoading={isPitchLoading}
            error={pitchError}
          />
        )}

        {session.currentState === SessionState.QUESTION_ANSWER && (
          <>
            <QuestionDisplay
              question={currentQuestion}
              questionNumber={session.exchanges.length + 1}
              category={category}
              isLoading={isQuestionLoading}
            />

            {!isQuestionLoading && currentQuestion && !currentAssessment && (
              <ResponseInput
                onResponseSubmit={handleResponseSubmit}
                isLoading={isResponseProcessing}
                error={responseError}
                disabled={isAssessmentLoading}
              />
            )}

            {currentAssessment && (
              <AssessmentFeedback
                assessment={currentAssessment}
                isLoading={isAssessmentLoading}
              />
            )}
          </>
        )}
      </div>
    </InterviewSessionContext.Provider>
  );
};
