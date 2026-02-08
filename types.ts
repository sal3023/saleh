
export type StoryMode = 'kids' | 'tourism' | 'adults_tech' | 'marketing' | 'digital_business' | 'history_civ' | 'blog_post';

export interface MonetizationStrategy {
  method: string;
  suggestedProducts: string[];
  estimatedCPM: string;
  affiliateLinks: string[];
}

export interface AIStory {
  id: string;
  title: string;
  mode: StoryMode;
  targetAudience: string;
  moralOrLesson: string;
  scenes: StoryScene[];
  monetization?: MonetizationStrategy;
  youtubeData?: {
    title: string;
    description: string;
    tags: string[];
    category: string;
    thumbnailPrompt: string;
  };
}

export interface StoryScene {
  title: string;
  narration: string;
  imagePrompt: string;
  visualDescription: string;
  videoUrl?: string;
  audioData?: string;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  SCRIPTING = 'SCRIPTING',
  GENERATING_ASSETS = 'GENERATING_ASSETS',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface BlogData {
  title: string;
  content: string;
  tags: string[];
  seo: {
    keywords: string[];
    description: string;
  };
}

export interface SocialLinks {
  blogger?: string;
}
