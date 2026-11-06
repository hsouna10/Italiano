import { ConversationScenario, Exercise, LearningVideo, Lesson, MusicTrack, ReadingText, UserProfile, VocabularyWord } from '../types';

const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const TOKEN_KEY = 'italiano_ai_token';

interface ApiUser extends Omit<UserProfile, 'id'> {
  _id?: string;
  id?: string;
}

interface AuthResponse {
  token: string;
  user: ApiUser;
}

type ApiLessonSection = Omit<Lesson['sections'][number], 'id' | 'conjugationTable'> & {
  id?: string;
  _id?: string;
  conjugationTable?: {
    verbName?: string;
    auxiliaryNote?: string;
    verb?: string;
    tense?: string;
    rows: NonNullable<Lesson['sections'][number]['conjugationTable']>['rows'];
  };
};

type ApiLesson = Omit<Lesson, 'id' | 'sections' | 'quiz'> & {
  id?: string;
  _id: string;
  sections?: ApiLessonSection[];
  quiz?: Array<Omit<Lesson['quiz'][number], 'id'> & { id?: string; _id?: string }>;
};

type ApiVocabularyWord = Omit<VocabularyWord, 'id' | 'srsBox' | 'reviewCount' | 'lastReviewedAt' | 'nextReviewAt'> & {
  id?: string;
  _id: string;
  srsBox?: VocabularyWord['srsBox'];
  reviewCount?: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
};

export type DynamicContentKind = 'exercises' | 'reading-texts' | 'conversation-scenarios' | 'videos' | 'music';
export type DynamicContentRecord = Record<string, unknown> & { id: string };
type DynamicContentProperty = 'exercises' | 'readingTexts' | 'conversationScenarios' | 'videos' | 'musicTracks';

const dynamicContentProperties: Record<DynamicContentKind, DynamicContentProperty> = {
  exercises: 'exercises',
  'reading-texts': 'readingTexts',
  'conversation-scenarios': 'conversationScenarios',
  videos: 'videos',
  music: 'musicTracks',
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem(TOKEN_KEY);
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('API inaccessible. Vérifiez que le backend fonctionne sur http://localhost:5000.');
    }
    throw error;
  }

  const body = await response.json().catch(() => null) as { message?: string } | null;
  if (!response.ok) {
    throw new Error(body?.message || `Erreur API (${response.status}).`);
  }
  return body as T;
};

const toUserProfile = (user: ApiUser): UserProfile => {
  const { _id, ...profile } = user;
  return { ...profile, id: user.id || _id || '' } as UserProfile;
};

const toApiLesson = (lesson: Lesson) => ({
  _id: lesson.id,
  level: lesson.level,
  unitNumber: lesson.unitNumber,
  orderNumber: lesson.orderNumber,
  title: lesson.title,
  titleFr: lesson.titleFr,
  description: lesson.description,
  videoUrl: lesson.videoUrl || '',
  learningObjectives: lesson.learningObjectives,
  estimatedMinutes: lesson.estimatedMinutes,
  sections: lesson.sections.map(({ id: _id, ...section }) => ({
    ...section,
    conjugationTable: section.conjugationTable
      ? {
          verb: section.conjugationTable.verbName,
          tense: section.conjugationTable.auxiliaryNote || '',
          rows: section.conjugationTable.rows,
        }
      : undefined,
  })),
  quiz: lesson.quiz.map(({ id: _id, ...question }) => question),
});

const toLesson = (lesson: ApiLesson): Lesson => ({
  ...lesson,
  id: lesson.id || lesson._id,
  sections: (lesson.sections || []).map(section => ({
    ...section,
    id: section.id || section._id || `${lesson._id}-${section.title}`,
    conjugationTable: section.conjugationTable
      ? {
          verbName: section.conjugationTable.verbName || section.conjugationTable.verb || '',
          auxiliaryNote: section.conjugationTable.auxiliaryNote || section.conjugationTable.tense || '',
          rows: section.conjugationTable.rows || [],
        }
      : undefined,
  })),
  quiz: (lesson.quiz || []).map((question, index) => ({
    ...question,
    id: question.id || question._id || `${lesson._id}-quiz-${index}`,
  })),
});

const toVocabularyWord = (word: ApiVocabularyWord): VocabularyWord => ({
  ...word,
  id: word.id || word._id,
  srsBox: word.srsBox || 'today',
  reviewCount: word.reviewCount || 0,
});

export const apiService = {
  async login(email: string, password: string): Promise<UserProfile> {
    const result = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem(TOKEN_KEY, result.token);
    return toUserProfile(result.user);
  },

  async register(name: string, email: string, password: string): Promise<UserProfile> {
    const result = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    localStorage.setItem(TOKEN_KEY, result.token);
    return toUserProfile(result.user);
  },

  async getCurrentUser(): Promise<UserProfile> {
    const result = await request<{ user: ApiUser }>('/users/me');
    return toUserProfile(result.user);
  },

  async updateMyProfile(updates: Partial<Pick<UserProfile, 'name' | 'preferredLanguage' | 'learningGoals'>>): Promise<UserProfile> {
    const result = await request<{ user: ApiUser }>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return toUserProfile(result.user);
  },

  async submitLevelExam(level: UserProfile['italianLevel'], answers: Array<number | null>): Promise<{
    passed: boolean;
    percentage: number;
    user: UserProfile;
  }> {
    const result = await request<{ passed: boolean; percentage: number; user: ApiUser }>('/users/level-exam', {
      method: 'POST',
      body: JSON.stringify({ level, answers }),
    });
    return { ...result, user: toUserProfile(result.user) };
  },

  async getPreferences(): Promise<{ isDarkMode: boolean }> {
    const result = await request<{ preferences: { isDarkMode: boolean } }>('/preferences');
    return result.preferences;
  },

  async updatePreferences(preferences: { isDarkMode: boolean }): Promise<{ isDarkMode: boolean }> {
    const result = await request<{ preferences: { isDarkMode: boolean } }>('/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
    return result.preferences;
  },

  aiRequest<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    return request<T>(`/ai/${path}`, body
      ? { method: 'POST', body: JSON.stringify(body) }
      : { method: 'GET' });
  },

  async getAdminUsers(): Promise<UserProfile[]> {
    const result = await request<{ users: ApiUser[] }>('/users');
    return result.users.map(toUserProfile);
  },

  async updateAdminUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const result = await request<{ user: ApiUser }>(`/users/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return toUserProfile(result.user);
  },

  async deleteAdminUser(id: string): Promise<void> {
    await request(`/users/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async getLessons(): Promise<Lesson[]> {
    const result = await request<{ lessons: ApiLesson[] }>('/lessons');
    return result.lessons.map(toLesson);
  },

  async getExercises(): Promise<Exercise[]> {
    const result = await request<{ exercises: Exercise[] }>('/content/exercises');
    return result.exercises;
  },

  async getReadingTexts(): Promise<ReadingText[]> {
    const result = await request<{ readingTexts: ReadingText[] }>('/content/reading-texts');
    return result.readingTexts;
  },

  async getConversationScenarios(): Promise<ConversationScenario[]> {
    const result = await request<{ conversationScenarios: ConversationScenario[] }>('/content/conversation-scenarios');
    return result.conversationScenarios;
  },

  async getVideos(): Promise<LearningVideo[]> {
    const result = await request<{ videos: LearningVideo[] }>('/content/videos');
    return result.videos;
  },

  async getMusicTracks(): Promise<MusicTrack[]> {
    const result = await request<{ musicTracks: MusicTrack[] }>('/content/music');
    return result.musicTracks;
  },

  async getDynamicContent(kind: DynamicContentKind): Promise<DynamicContentRecord[]> {
    const property = dynamicContentProperties[kind];
    const result = await request<Partial<Record<DynamicContentProperty, DynamicContentRecord[]>>>(`/content/${kind}`);
    const items = result[property];
    if (!items) throw new Error(`Réponse API invalide pour ${kind}.`);
    return items;
  },

  async uploadVideo(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('video', file);
    const result = await request<{ videoUrl: string }>('/content/videos/upload', {
      method: 'POST',
      body: formData,
    });
    return result.videoUrl;
  },

  async uploadMusic(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('audio', file);
    const result = await request<{ audioUrl: string }>('/content/music/upload', {
      method: 'POST',
      body: formData,
    });
    return result.audioUrl;
  },

  async createDynamicContent(kind: DynamicContentKind, data: Record<string, unknown>): Promise<DynamicContentRecord> {
    const result = await request<{ item: DynamicContentRecord }>(`/content/${kind}`, {
      method: 'POST',
      body: JSON.stringify({ id: data.id, data }),
    });
    return result.item;
  },

  async updateDynamicContent(kind: DynamicContentKind, id: string, data: Record<string, unknown>): Promise<DynamicContentRecord> {
    const result = await request<{ item: DynamicContentRecord }>(`/content/${kind}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ data }),
    });
    return result.item;
  },

  async deleteDynamicContent(kind: DynamicContentKind, id: string): Promise<void> {
    await request(`/content/${kind}/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  async createLesson(lesson: Lesson): Promise<Lesson> {
    const result = await request<{ lesson: ApiLesson }>('/lessons', {
      method: 'POST',
      body: JSON.stringify(toApiLesson(lesson)),
    });
    return toLesson(result.lesson);
  },

  async updateLesson(lesson: Lesson): Promise<Lesson> {
    const result = await request<{ lesson: ApiLesson }>(`/lessons/${encodeURIComponent(lesson.id)}`, {
      method: 'PATCH',
      body: JSON.stringify(toApiLesson(lesson)),
    });
    return toLesson(result.lesson);
  },

  async deleteLesson(id: string): Promise<void> {
    await request(`/lessons/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  async getVocabulary(): Promise<VocabularyWord[]> {
    const result = await request<{ vocabulary: ApiVocabularyWord[] }>('/vocabulary');
    const words = result.vocabulary.map(toVocabularyWord);
    if (!localStorage.getItem(TOKEN_KEY)) return words;
    const progressResult = await request<{
      progress: Array<{
        vocabularyId: string;
        srsBox: number;
        reviewCount: number;
        lastReviewedAt?: string;
        nextReviewAt?: string;
      }>;
    }>('/vocabulary/progress');
    const progressByWord = new Map(progressResult.progress.map(progress => [
      progress.vocabularyId,
      {
        srsBox: (['today', 'learning', 'mastered'][progress.srsBox - 1] || 'today') as VocabularyWord['srsBox'],
        reviewCount: progress.reviewCount,
        lastReviewedAt: progress.lastReviewedAt,
        nextReviewAt: progress.nextReviewAt,
      },
    ]));
    return words.map(word => ({ ...word, ...progressByWord.get(word.id) }));
  },

  async updateVocabularyProgress(id: string, srsBox: VocabularyWord['srsBox']): Promise<void> {
    await request(`/vocabulary/progress/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ srsBox }),
    });
  },

  async createVocabulary(word: VocabularyWord): Promise<VocabularyWord> {
    const result = await request<{ word: ApiVocabularyWord }>('/vocabulary', {
      method: 'POST',
      body: JSON.stringify({ ...word, _id: word.id }),
    });
    return toVocabularyWord(result.word);
  },

  async updateVocabulary(word: VocabularyWord): Promise<VocabularyWord> {
    const { id, srsBox: _srsBox, reviewCount: _reviewCount, lastReviewedAt: _lastReviewedAt,
      nextReviewAt: _nextReviewAt, ...fields } = word;
    const result = await request<{ word: ApiVocabularyWord }>(`/vocabulary/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(fields),
    });
    return toVocabularyWord(result.word);
  },

  async deleteVocabulary(id: string): Promise<void> {
    await request(`/vocabulary/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  async updateProgress(progress: {
    xpPoints: number;
    gems: number;
    studiedMinutes: number;
    lessonId?: string;
  }): Promise<UserProfile> {
    const result = await request<{ user: ApiUser }>('/users/progress', {
      method: 'PATCH',
      body: JSON.stringify(progress),
    });
    return toUserProfile(result.user);
  },
};
