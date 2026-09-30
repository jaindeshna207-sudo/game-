export type GameId = 'snake' | 'tetris' | 'bounce' | 'platformer' | 'space';

export type GameCategory = 'arcade' | 'physics' | 'puzzle' | 'platform' | 'topdown';

export type ArcadeTheme = 'synthwave' | 'gameboy' | 'crt-amber' | 'clean-dark';

export interface GameMetadata {
  id: GameId;
  title: string;
  subtitle: string;
  category: GameCategory;
  coverImage: string;
  instructions: string[];
  controls: {
    keyboard: string[];
    mobile: string;
  };
  features: string[];
}

export interface GameIdea {
  id: string;
  title: string;
  classicInspiration: string;
  tagline: string;
  category: GameCategory;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDevTime: string;
  coreLoop: string;
  theTwist: string;
  keyMechanics: string[];
  techStack: string;
  aiStudioPrompt: string;
}
