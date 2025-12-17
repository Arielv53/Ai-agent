import { API_BASE } from '@/constants/config';
import React, { createContext, useContext, useEffect, useState } from 'react';

type UserProgress = {
  level: number;
  prestige: number;
  postsTowardNextLevel: number;
  postsRequiredForNextLevel: number;
};

type UserProgressContextType = {
  progress: UserProgress;
  refreshProgress: () => Promise<void>;
  setProgress: React.Dispatch<React.SetStateAction<UserProgress>>;
};

const UserProgressContext = createContext<UserProgressContextType | null>(null);

export function UserProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>({
    level: 1,
    prestige: 0,
    postsTowardNextLevel: 0,
    postsRequiredForNextLevel: 1,
  });

  const refreshProgress = async () => {
    const userId = 1;
    const res = await fetch(`${API_BASE}/users/${userId}/profile`);
    const data = await res.json();

    setProgress({
      level: data.level,
      prestige: data.prestige,
      postsTowardNextLevel: data.posts_toward_next_level,
      postsRequiredForNextLevel: data.posts_required_for_next_level,
    });
  };

  useEffect(() => {
    refreshProgress();
  }, []);

  return (
    <UserProgressContext.Provider value={{ progress, refreshProgress, setProgress }}>
      {children}
    </UserProgressContext.Provider>
  );
}

export function useUserProgress() {
  const ctx = useContext(UserProgressContext);
  if (!ctx) throw new Error('useUserProgress must be used within UserProgressProvider');
  return ctx;
}
