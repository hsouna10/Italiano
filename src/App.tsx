import React from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { FloatingAiDrawer } from './components/layout/FloatingAiDrawer';
import { DashboardView } from './components/dashboard/DashboardView';
import { CourseListView } from './components/courses/CourseListView';
import { LessonPlayer } from './components/courses/LessonPlayer';
import { LessonQuizHubView } from './components/exercises/LessonQuizHubView';
import { AiAssistantView } from './components/assistant/AiAssistantView';
import { AudioPracticeView } from './components/audio/AudioPracticeView';
import { ReadingWritingView } from './components/reading-writing/ReadingWritingView';
import { VocabularyView } from './components/vocabulary/VocabularyView';
import { ConjugationView } from './components/conjugation/ConjugationView';
import { MediaLibraryView } from './components/media/MediaLibraryView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { LevelChoice } from './components/auth/LevelChoice';

// ─── MAIN APP (authenticated) ───────────────────────────────────────────────
const AppContent: React.FC = () => {
  const { activeTab, activeLessonForPlayer, activeLessonTab, closeLessonPlayer, user, apiError, clearApiError, showLevelChoice } = useApp();

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-[#FBF9F5] text-[#1F1A17]">
      {showLevelChoice && <LevelChoice />}
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <TopBar />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-10">
          {apiError && (
            <div role="alert" className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-[#F6D9CE] bg-[#FDF0EB] px-4 py-3 text-sm text-[#C04A33]">
              <span>{apiError}</span>
              <button onClick={clearApiError} className="shrink-0 font-semibold hover:underline">Fermer</button>
            </div>
          )}
          {user.role === 'admin' ? (
            <AdminDashboardView />
          ) : activeLessonForPlayer ? (
            <LessonPlayer lesson={activeLessonForPlayer} onClose={closeLessonPlayer} initialTab={activeLessonTab} />
          ) : (
            <>
              {activeTab === 'dashboard' && <DashboardView />}
              {activeTab === 'courses' && <CourseListView />}
              {activeTab === 'exercises' && <LessonQuizHubView />}
              {activeTab === 'assistant' && <AiAssistantView />}
              {activeTab === 'audio' && <AudioPracticeView />}
              {activeTab === 'reading-writing' && <ReadingWritingView />}
              {activeTab === 'vocabulary' && <VocabularyView />}
              {activeTab === 'conjugation' && <ConjugationView />}
              {activeTab === 'videos' && <MediaLibraryView kind="videos" />}
              {activeTab === 'music' && <MediaLibraryView kind="music" />}
            </>
          )}
        </main>
      </div>
      <FloatingAiDrawer />
    </div>
  );
};

// ─── ROOT ROUTER ─────────────────────────────────────────────────────────────
export default function App() {
  const { authState } = useApp();

  if (authState === 'landing') return <LandingPage />;
  if (authState === 'login')   return <LoginPage />;
  return <AppContent />;
}
