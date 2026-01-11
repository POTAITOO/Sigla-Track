export interface Event {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startDate: string; // ISO 8601 format
  endDate: string;
  location?: string;
  category?: 'work' | 'personal' | 'meeting' | 'deadline' | 'other';
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category?: 'health' | 'fitness' | 'learning' | 'productivity' | 'other';
  frequency: 'daily' | 'weekly' | 'monthly'; // how often the habit occurs
  daysOfWeek?: number[]; // 0-6 for weekly habits
  dayOfMonth?: number; // 1-31 for monthly habits
  startDate: string; // ISO 8601 format
  endDate?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  completedAt: string;
  notes?: string;
}

export interface EventCreateInput {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  category?: 'work' | 'personal' | 'meeting' | 'deadline' | 'other';
  color?: string;
}

export interface HabitCreateInput {
  title: string;
  description?: string;
  category?: 'health' | 'fitness' | 'learning' | 'productivity' | 'other';
  frequency: 'daily' | 'weekly' | 'monthly';
  daysOfWeek?: number[];
  dayOfMonth?: number;
  startDate: Date;
  endDate?: Date;
  color?: string;
}
