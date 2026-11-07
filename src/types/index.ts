export type ThemeMode = 'classic-gold' | 'royal-purple' | 'cyber-neon' | 'eco-green';

export interface GreetingData {
  receiverName: string;
  senderName: string;
  message: string;
  tone: 'heartfelt' | 'traditional' | 'funny' | 'corporate' | 'shayari' | 'poetic';
  language: 'English' | 'Hindi' | 'Hinglish' | 'Bengali' | 'Tamil' | 'Telugu' | 'Marathi' | 'Gujarati';
  relationship: 'friend' | 'family' | 'teacher' | 'colleague' | 'partner';
  theme: ThemeMode;
  userPhotoUrl?: string;
  rangoliDataUrl?: string;
}

export interface WishItem {
  id: string;
  name: string;
  wish: string;
  location?: string;
  color: string;
  createdAt: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
