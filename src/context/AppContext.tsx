import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Lesson, VocabularyWord, SrsBox, Exercise, ReadingText, ConversationScenario, LearningVideo, MusicTrack } from '../types';
import { apiService } from '../services/apiService';

export type NavTab = 
  | 'dashboard' 
  | 'courses' 
  | 'exercises' 
  | 'assistant' 
  | 'audio' 
  | 'reading-writing' 
  | 'vocabulary' 
  | 'conjugation'
  | 'videos'
  | 'music'
  | 'admin';

export type AuthState = 'landing' | 'login' | 'app';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

interface AppContextType {
  user: UserProfile;
  authState: AuthState;
  setAuthState: (state: AuthState) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  apiError: string | null;
  clearApiError: () => void;
  notifications: AppNotification[];
  addNotification: (title: string, message: string) => void;
  markNotificationsRead: () => void;
  clearNotifications: () => void;
  logout: () => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  submitLevelExam: (level: UserProfile['italianLevel'], answers: Array<number | null>) => Promise<{ passed: boolean; percentage: number }>;
  completeLesson: (lessonId: string) => void;
  addXp: (amount: number) => void;
  lessons: Lesson[];
  exercises: Exercise[];
  readingTexts: ReadingText[];
  conversationScenarios: ConversationScenario[];
  videos: LearningVideo[];
  musicTracks: MusicTrack[];
  refreshLearningContent: () => Promise<void>;
  addLesson: (lesson: Lesson) => Promise<boolean>;
  updateLesson: (lesson: Lesson) => Promise<boolean>;
  deleteLesson: (lessonId: string) => void;
  vocabulary: VocabularyWord[];
  updateWordSrs: (wordId: string, targetBox: SrsBox) => void;
  addCustomWord: (word: VocabularyWord) => Promise<boolean>;
  updateVocabularyWord: (word: VocabularyWord) => Promise<boolean>;
  deleteWord: (wordId: string) => void;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (isOpen: boolean) => void;
  toggleAiDrawer: () => void;
  activeLessonForPlayer: Lesson | null;
  activeLessonTab: 'course' | 'quiz';
  startLesson: (lesson: Lesson, initialTab?: 'course' | 'quiz') => void;
  closeLessonPlayer: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  adminUsers: UserProfile[];
  updateUserByAdmin: (userId: string, updates: Partial<UserProfile>) => Promise<boolean>;
  deleteUserByAdmin: (userId: string) => Promise<boolean>;
  showLevelChoice: boolean;
  setShowLevelChoice: (value: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const EMPTY_PROFILE: UserProfile = {
  id: '',
  name: '',
  email: '',
  role: 'student',
  italianLevel: 'A1',
  preferredLanguage: 'fr',
  streakDays: 0,
  xpPoints: 0,
  gems: 0,
  completedLessons: [],
  studiedMinutes: 0,
  learningGoals: [],
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(EMPTY_PROFILE);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [readingTexts, setReadingTexts] = useState<ReadingText[]>([]);
  const [conversationScenarios, setConversationScenarios] = useState<ConversationScenario[]>([]);
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [activeTab, setActiveTabState] = useState<NavTab>('dashboard');
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [activeLessonForPlayer, setActiveLessonForPlayer] = useState<Lesson | null>(null);
  const [activeLessonTab, setActiveLessonTab] = useState<'course' | 'quiz'>('course');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [authState, setAuthState] = useState<AuthState>('landing');
  const [apiError, setApiError] = useState<string | null>(null);
  const [showLevelChoice, setShowLevelChoice] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const notificationStorageKey = (userId: string) => `italiano_ai_notifications:${userId}`;
  const seenContentStorageKey = (userId: string) => `italiano_ai_seen_content:${userId}`;

  const addNotification = (title: string, message: string) => {
    if (!user.id) return;
    const notification: AppNotification = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title,
      message,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(current => {
      const updated = [notification, ...current].slice(0, 50);
      localStorage.setItem(notificationStorageKey(user.id), JSON.stringify(updated));
      return updated;
    });
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body: message, tag: notification.id });
      } catch (error) {
        console.error('Impossible d’afficher la notification du navigateur.', error);
        setApiError('La notification a été enregistrée dans l’application, mais le navigateur n’a pas pu l’afficher.');
      }
    }
  };

  const markNotificationsRead = () => {
    setNotifications(current => {
      const updated = current.map(notification => ({ ...notification, read: true }));
      if (user.id) localStorage.setItem(notificationStorageKey(user.id), JSON.stringify(updated));
      return updated;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    if (user.id) localStorage.removeItem(notificationStorageKey(user.id));
  };

  const setActiveTab = (tab: NavTab) => {
    if (user.role === 'admin') {
      if (tab === 'admin') setActiveTabState('admin');
      return;
    }
    setActiveLessonForPlayer(null);
    setActiveTabState(tab === 'admin' ? 'dashboard' : tab);
  };

  const loadApiContent = async (profile: UserProfile) => {
    const [
      lessonsResult,
      vocabularyResult,
      preferencesResult,
      exercisesResult,
      readingTextsResult,
      scenariosResult,
      videosResult,
      musicResult,
    ] = await Promise.allSettled([
      apiService.getLessons(),
      apiService.getVocabulary(),
      apiService.getPreferences(),
      apiService.getExercises(),
      apiService.getReadingTexts(),
      apiService.getConversationScenarios(),
      apiService.getVideos(),
      apiService.getMusicTracks(),
    ]);
    if (lessonsResult.status === 'fulfilled') setLessons(lessonsResult.value);
    if (vocabularyResult.status === 'fulfilled') setVocabulary(vocabularyResult.value);
    if (preferencesResult.status === 'fulfilled') setIsDarkMode(preferencesResult.value.isDarkMode);
    if (exercisesResult.status === 'fulfilled') setExercises(exercisesResult.value);
    if (readingTextsResult.status === 'fulfilled') setReadingTexts(readingTextsResult.value);
    if (scenariosResult.status === 'fulfilled') setConversationScenarios(scenariosResult.value);
    if (videosResult.status === 'fulfilled') setVideos(videosResult.value);
    if (musicResult.status === 'fulfilled') setMusicTracks(musicResult.value);
    const localDataErrors: string[] = [];
    if (profile.id) {
      const storedNotifications = localStorage.getItem(notificationStorageKey(profile.id));
      if (storedNotifications) {
        try {
          const parsed: unknown = JSON.parse(storedNotifications);
          if (Array.isArray(parsed)) setNotifications(parsed as AppNotification[]);
          else throw new Error('Format de notifications invalide.');
        } catch (error) {
          localDataErrors.push(error instanceof Error ? `Notifications locales illisibles : ${error.message}` : 'Notifications locales illisibles.');
        }
      } else {
        setNotifications([]);
      }
      if (profile.role === 'student') {
        const contentIds = [
          ...(lessonsResult.status === 'fulfilled' ? lessonsResult.value.map(item => `lesson:${item.id}`) : []),
          ...(exercisesResult.status === 'fulfilled' ? exercisesResult.value.map(item => `exercise:${item.id}`) : []),
          ...(readingTextsResult.status === 'fulfilled' ? readingTextsResult.value.map(item => `reading:${item.id}`) : []),
          ...(scenariosResult.status === 'fulfilled' ? scenariosResult.value.map(item => `scenario:${item.id}`) : []),
          ...(videosResult.status === 'fulfilled' ? videosResult.value.map(item => `video:${item.id}`) : []),
          ...(musicResult.status === 'fulfilled' ? musicResult.value.map(item => `music:${item.id}`) : []),
        ];
        const storedContentIds = localStorage.getItem(seenContentStorageKey(profile.id));
        if (storedContentIds) {
          try {
            const previousIds: unknown = JSON.parse(storedContentIds);
            if (!Array.isArray(previousIds) || previousIds.some(id => typeof id !== 'string')) {
              throw new Error('Format de suivi du contenu invalide.');
            }
            const previous = new Set(previousIds);
            const additions = contentIds.filter(id => !previous.has(id)).length;
            if (additions > 0) {
              const notice: AppNotification = {
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                title: 'Nouveau contenu disponible',
                message: `${additions} nouveau${additions > 1 ? 'x' : ''} contenu${additions > 1 ? 's' : ''} à découvrir dans votre parcours.`,
                createdAt: new Date().toISOString(),
                read: false,
              };
              setNotifications(current => {
                const updated = [notice, ...current].slice(0, 50);
                localStorage.setItem(notificationStorageKey(profile.id), JSON.stringify(updated));
                return updated;
              });
              if ('Notification' in window && Notification.permission === 'granted') {
                try {
                  new Notification(notice.title, { body: notice.message, tag: notice.id });
                } catch (error) {
                  console.error('Impossible d’afficher la notification du navigateur.', error);
                  setApiError('Le nouveau contenu est signalé dans l’application, mais le navigateur n’a pas pu afficher la notification.');
                }
              }
            }
          } catch (error) {
            localDataErrors.push(error instanceof Error ? `Suivi du nouveau contenu illisible : ${error.message}` : 'Suivi du nouveau contenu illisible.');
          }
        }
        localStorage.setItem(seenContentStorageKey(profile.id), JSON.stringify(contentIds));
      }
    }
    const errors = [
      lessonsResult,
      vocabularyResult,
      preferencesResult,
      exercisesResult,
      readingTextsResult,
      scenariosResult,
      videosResult,
      musicResult,
    ]
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason instanceof Error ? result.reason.message : 'Erreur API.');
    errors.push(...localDataErrors);
    if (profile.role === 'admin') {
      try {
        setAdminUsers(await apiService.getAdminUsers());
      } catch (error) {
        errors.push(error instanceof Error ? error.message : 'Impossible de charger les utilisateurs.');
      }
    } else {
      setAdminUsers([]);
    }
    setApiError(errors.length ? errors.join(' ') : null);
  };

  const refreshLearningContent = async () => {
    const [updatedExercises, updatedReadings, updatedScenarios, updatedVideos, updatedMusic] = await Promise.all([
      apiService.getExercises(),
      apiService.getReadingTexts(),
      apiService.getConversationScenarios(),
      apiService.getVideos(),
      apiService.getMusicTracks(),
    ]);
    setExercises(updatedExercises);
    setReadingTexts(updatedReadings);
    setConversationScenarios(updatedScenarios);
    setVideos(updatedVideos);
    setMusicTracks(updatedMusic);
  };

  const [adminUsers, setAdminUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    localStorage.removeItem('italiano_ai_user');
    localStorage.removeItem('italiano_ai_lessons');
    localStorage.removeItem('italiano_ai_vocab');
    localStorage.removeItem('italiano_ai_theme');
    let cancelled = false;
    const restoreSession = async () => {
      if (!localStorage.getItem('italiano_ai_token')) return;
      try {
        const currentUser = await apiService.getCurrentUser();
        if (!cancelled) {
          setUser(currentUser);
          setActiveTabState(currentUser.role === 'admin' ? 'admin' : 'dashboard');
          setAuthState('app');
          await loadApiContent(currentUser);
        }
      } catch (error) {
        apiService.clearToken();
        if (!cancelled) setApiError(error instanceof Error ? error.message : 'La session n’a pas pu être restaurée.');
      }
    };
    void restoreSession();
    return () => { cancelled = true; };
  }, []);

  // Synchronisation du thème dark / light
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = async () => {
    const nextValue = !isDarkMode;
    setIsDarkMode(nextValue);
    if (!localStorage.getItem('italiano_ai_token')) return;
    try {
      const savedPreferences = await apiService.updatePreferences({ isDarkMode: nextValue });
      setIsDarkMode(savedPreferences.isDarkMode);
      setApiError(null);
    } catch (error) {
      setIsDarkMode(!nextValue);
      setApiError(error instanceof Error ? error.message : 'Impossible d’enregistrer les préférences.');
    }
  };

  // ==================== AUTH ====================
  const authenticate = async (action: () => Promise<UserProfile>) => {
    try {
      const profile = await action();
      setUser(profile);
      setActiveTabState(profile.role === 'admin' ? 'admin' : 'dashboard');
      setAuthState('app');
      await loadApiContent(profile);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Échec de l’authentification.';
      setApiError(message);
      throw error;
    }
  };

  const login = (email: string, password: string) =>
    authenticate(() => apiService.login(email, password));

  const register = (name: string, email: string, password: string) =>
    authenticate(() => apiService.register(name, email, password)).then(() => {
      setShowLevelChoice(true);
    });

  const logout = () => {
    apiService.clearToken();
    setUser(EMPTY_PROFILE);
    setLessons([]);
    setVocabulary([]);
    setExercises([]);
    setReadingTexts([]);
    setConversationScenarios([]);
    setVideos([]);
    setMusicTracks([]);
    setAdminUsers([]);
    setNotifications([]);
    setIsDarkMode(false);
    setAuthState('landing');
    setActiveTabState('dashboard');
  };
  // ===============================================

  const submitLevelExam = async (level: UserProfile['italianLevel'], answers: Array<number | null>) => {
    try {
      const result = await apiService.submitLevelExam(level, answers);
      setUser(result.user);
      setApiError(null);
      return { passed: result.passed, percentage: result.percentage };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de valider votre examen.';
      setApiError(message);
      throw error;
    }
  };

  const completeLesson = async (lessonId: string) => {
    if (user.completedLessons.includes(lessonId)) return;
    try {
      setUser(await apiService.updateProgress({
        xpPoints: user.xpPoints + 50,
        gems: user.gems + 15,
        studiedMinutes: user.studiedMinutes + 15,
        lessonId,
      }));
      addNotification('Leçon terminée', 'Bravo ! Votre progression a été enregistrée.');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Impossible d’enregistrer la progression.');
    }
  };

  const addXp = async (amount: number) => {
    try {
      setUser(await apiService.updateProgress({
        xpPoints: user.xpPoints + amount,
        gems: user.gems + Math.floor(amount / 5),
        studiedMinutes: user.studiedMinutes,
      }));
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Impossible d’enregistrer la progression.');
    }
  };

  const addLesson = async (newLesson: Lesson) => {
    try {
      const created = await apiService.createLesson(newLesson);
      setLessons(prev => [created, ...prev]);
      setApiError(null);
      return true;
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Impossible de créer la leçon.');
      return false;
    }
  };

  const updateLesson = async (updated: Lesson) => {
    try {
      const saved = await apiService.updateLesson(updated);
      setLessons(prev => prev.map(l => l.id === saved.id ? saved : l));
      setApiError(null);
      return true;
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Impossible de modifier la leçon.');
      return false;
    }
  };

  const deleteLesson = async (lessonId: string) => {
    try {
      await apiService.deleteLesson(lessonId);
      setLessons(prev => prev.filter(l => l.id !== lessonId));
      setApiError(null);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Impossible de supprimer la leçon.');
    }
  };

  const updateWordSrs = async (wordId: string, targetBox: SrsBox) => {
    try {
    await apiService.updateVocabularyProgress(wordId, targetBox);
    setVocabulary(prev => prev.map(w => {
      if (w.id === wordId) {
        return {
          ...w,
          srsBox: targetBox,
          reviewCount: w.reviewCount + 1,
          lastReviewedAt: new Date().toISOString()
        };
      }
      return w;
    }));
    setApiError(null);
    } catch (error) {
    setApiError(error instanceof Error ? error.message : 'Impossible d’enregistrer la révision.');
    }
  };

  const addCustomWord = async (word: VocabularyWord) => {
    try {
      const created = await apiService.createVocabulary(word);
      setVocabulary(prev => [created, ...prev]);
      setApiError(null);
      return true;
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Impossible d’ajouter le mot.');
      return false;
    }
  };

  const updateVocabularyWord = async (word: VocabularyWord) => {
    try {
      const saved = await apiService.updateVocabulary(word);
      setVocabulary(previous => previous.map(item => item.id === saved.id
        ? { ...saved, srsBox: item.srsBox, reviewCount: item.reviewCount, lastReviewedAt: item.lastReviewedAt, nextReviewAt: item.nextReviewAt }
        : item));
      setApiError(null);
      return true;
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Impossible de modifier cette fiche.');
      return false;
    }
  };

  const deleteWord = async (wordId: string) => {
    try {
      await apiService.deleteVocabulary(wordId);
      setVocabulary(prev => prev.filter(w => w.id !== wordId));
      setApiError(null);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Impossible de supprimer le mot.');
    }
  };

  const updateUserByAdmin = (userId: string, updates: Partial<UserProfile>) => {
    return apiService.updateAdminUser(userId, updates)
      .then(updated => {
        setAdminUsers(prev => prev.map(user => user.id === updated.id ? updated : user));
        setApiError(null);
        return true;
      })
      .catch(error => {
        setApiError(error instanceof Error ? error.message : 'Impossible de modifier cet utilisateur.');
        return false;
      });
  };

  const deleteUserByAdmin = (userId: string) => {
    return apiService.deleteAdminUser(userId)
      .then(() => {
        setAdminUsers(prev => prev.filter(user => user.id !== userId));
        setApiError(null);
        return true;
      })
      .catch(error => {
        setApiError(error instanceof Error ? error.message : 'Impossible de supprimer cet utilisateur.');
        return false;
      });
  };

  const toggleAiDrawer = () => {
    setIsAiDrawerOpen(prev => !prev);
  };

  const startLesson = (lesson: Lesson, initialTab: 'course' | 'quiz' = 'course') => {
    setActiveLessonForPlayer(lesson);
    setActiveLessonTab(initialTab);
  };

  const closeLessonPlayer = () => {
    setActiveLessonForPlayer(null);
    setActiveLessonTab('course');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        authState,
        setAuthState,
        login,
        register,
        apiError,
        clearApiError: () => setApiError(null),
        notifications,
        addNotification,
        markNotificationsRead,
        clearNotifications,
        logout,
        activeTab,
        setActiveTab,
        submitLevelExam,
        completeLesson,
        addXp,
        lessons,
        exercises,
        readingTexts,
        conversationScenarios,
        videos,
        musicTracks,
        refreshLearningContent,
        addLesson,
        updateLesson,
        deleteLesson,
        vocabulary,
        updateWordSrs,
        addCustomWord,
        updateVocabularyWord,
        deleteWord,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        toggleAiDrawer,
        activeLessonForPlayer,
        activeLessonTab,
        startLesson,
        closeLessonPlayer,
        isDarkMode,
        toggleDarkMode,
        adminUsers,
        updateUserByAdmin,
        deleteUserByAdmin,
        showLevelChoice,
        setShowLevelChoice
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp doit être utilisé au sein d\'un AppProvider');
  }
  return context;
};
