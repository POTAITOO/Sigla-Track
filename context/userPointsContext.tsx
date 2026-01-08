import { userServices } from '@/services/userServices';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './authContext';

const UserPointsContext = createContext<{ points: number; refresh: () => void }>({ points: 0, refresh: () => {} });

export const UserPointsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);

  const fetchPoints = async () => {
    if (user?.uid) {
      const pts = await userServices.getUserPoints(user.uid);
      setPoints(pts);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, [user]);

  return (
    <UserPointsContext.Provider value={{ points, refresh: fetchPoints }}>
      {children}
    </UserPointsContext.Provider>
  );
};

export const useUserPoints = () => useContext(UserPointsContext);
