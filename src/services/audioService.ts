// Service de synthèse et de reconnaissance vocale Web Speech API pour ITALIANO AI

export interface PronunciationResult {
  transcript: string;
  accuracyScore: number; // 0 to 100
  isMatch: boolean;
  phoneticFeedback: string;
}

class AudioService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSupportedTTS: boolean = typeof window !== 'undefined' && 'speechSynthesis' in window;
  private recognitionInstance: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        this.recognitionInstance = new SpeechRec();
        this.recognitionInstance.lang = 'it-IT';
        this.recognitionInstance.continuous = false;
        this.recognitionInstance.interimResults = false;
      }
    }
  }

  /**
   * Prononce un texte italien avec synthèse vocale naturelle
   */
  public speak(text: string, rate: number = 1.0, onEnd?: () => void): void {
    if (!this.isSupportedTTS) {
      console.warn("La synthèse vocale n'est pas supportée sur ce navigateur.");
      if (onEnd) onEnd();
      return;
    }

    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'it-IT';
    utterance.rate = rate; // 0.75, 1.0, 1.25
    utterance.pitch = 1.0;

    // Tente de sélectionner une voix italienne naturelle si disponible
    const voices = window.speechSynthesis.getVoices();
    const italianVoice = voices.find(v => v.lang.startsWith('it') || v.lang.includes('IT'));
    if (italianVoice) {
      utterance.voice = italianVoice;
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.error("Erreur de synthèse vocale:", e);
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if (this.isSupportedTTS) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return this.isSupportedTTS && window.speechSynthesis.speaking;
  }

  public isSttSupported(): boolean {
    return this.recognitionInstance !== null;
  }

  /**
   * Écoute la voix de l'utilisateur et calcule la ressemblance avec la phrase attendue
   */
  public listenAndScore(
    expectedPhrase: string, 
    onResult: (result: PronunciationResult) => void,
    onError: (err: string) => void
  ): { stop: () => void } {
    if (!this.recognitionInstance) {
      onError("La reconnaissance vocale n'est pas disponible sur ce navigateur. Veuillez utiliser Google Chrome, Edge ou Safari.");
      return { stop: () => {} };
    }

    try {
      this.recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.trim();
        const score = this.calculateSimilarity(transcript, expectedPhrase);
        const isMatch = score >= 75;

        let phoneticFeedback = "";
        if (score >= 90) {
          phoneticFeedback = "Eccellente! Prononciation très claire et naturelle, intonation parfaite.";
        } else if (score >= 75) {
          phoneticFeedback = "Molto bene! Phrase bien comprise, faites attention à l'accentuation des voyelles ouvertes.";
        } else if (score >= 50) {
          phoneticFeedback = "Bon essai ! Insistez sur les consonnes et articulez bien chaque syllabe italienne.";
        } else {
          phoneticFeedback = "Écoutez à nouveau le modèle audio à vitesse 0.75x puis répétez doucement.";
        }

        onResult({
          transcript,
          accuracyScore: score,
          isMatch,
          phoneticFeedback
        });
      };

      this.recognitionInstance.onerror = (event: any) => {
        onError(event.error === 'no-speech' ? "Aucun son détecté. Parlez plus près du micro." : `Erreur micro: ${event.error}`);
      };

      this.recognitionInstance.start();
    } catch (e) {
      onError("Impossible d'activer le microphone.");
    }

    return {
      stop: () => {
        try {
          this.recognitionInstance.stop();
        } catch (_) {}
      }
    };
  }

  /**
   * Calcul de similarité entre la transcription et le texte attendu
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const clean1 = str1.toLowerCase().replace(/[.,!?;:'"]/g, '').trim();
    const clean2 = str2.toLowerCase().replace(/[.,!?;:'"]/g, '').trim();

    if (clean1 === clean2) return 100;
    if (!clean1 || !clean2) return 0;

    const words1 = clean1.split(/\s+/);
    const words2 = clean2.split(/\s+/);

    let matchCount = 0;
    words1.forEach(w => {
      if (words2.includes(w)) matchCount++;
    });

    const wordOverlapScore = (matchCount / Math.max(words1.length, words2.length)) * 100;
    
    // Levenshtein ratio
    const distance = this.levenshtein(clean1, clean2);
    const maxLen = Math.max(clean1.length, clean2.length);
    const charScore = Math.max(0, (1 - distance / maxLen) * 100);

    return Math.round((wordOverlapScore * 0.6) + (charScore * 0.4));
  }

  private levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
}

export const audioService = new AudioService();
