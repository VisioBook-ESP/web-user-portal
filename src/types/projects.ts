// src/types/projects.ts

export interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: "draft" | "processing" | "completed" | "failed";
  sourceText?: string;
  sourceFile?: string;
  config?: ProjectConfig;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectConfig {
  style: "realistic" | "cartoon" | "anime" | "comic";
  audioVoice: "male" | "female" | "neutral";
  duration?: number;
  quality: "low" | "medium" | "high" | "ultra";
  effects: string[];
}

export interface CreateProjectData {
  title: string;
  description?: string;
  sourceText?: string;
  sourceFile?: File;
  config?: Partial<ProjectConfig>;
}

export interface ProjectFilters {
  status?: Project["status"];
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface WorkflowStatus {
  projectId: string;
  status: "queued" | "processing" | "completed" | "failed";
  currentStep: string;
  progress: number;
  steps: WorkflowStep[];
  estimatedTimeRemaining?: number;
  error?: string;
}

export interface WorkflowStep {
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  startedAt?: string;
  completedAt?: string;
}

export interface VisioBook {
  id: string;
  projectId: string;
  title: string;
  videoUrl: string;
  posterUrl?: string;
  duration: number;
  scenes: Scene[];
  createdAt: string;
}

export interface Scene {
  id: string;
  imageUrl: string;
  audioUrl?: string;
  text: string;
  startTime: number;
  endTime: number;
}
