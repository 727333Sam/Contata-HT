// export type Dependency = { id: number; sourceTaskId: string; targetTaskId: string; validated: boolean; };
export type Dependency = {
  id: number;
  sourceTaskId: string;
  targetTaskId: string;
  validated: boolean;
  suggestedBy: 'user' | 'ai' | string;
  confidence: number;
};