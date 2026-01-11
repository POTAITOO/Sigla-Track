import React, { createContext, useContext, useState } from 'react';

type Event = {
  id: string;
  title: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  location?: string;
  category: 'work' | 'personal' | 'meeting' | 'deadline' | 'other';
  color: string;
  reminder: number;
};

interface EventModalContextType {
  isVisible: boolean;
  isHabitModalVisible: boolean;
  selectedEvent: Event | null;
  openCreateModal: () => void;
  openEditModal: (event: Event) => void;
  closeModal: () => void;
  setHabitModalVisible: (visible: boolean) => void;
}

const EventModalContext = createContext<EventModalContextType | undefined>(undefined);

export const EventModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHabitModalVisible, setIsHabitModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const openCreateModal = () => {
    setSelectedEvent(null);
    setIsVisible(true);
  };

  const openEditModal = (event: Event) => {
    setSelectedEvent(event);
    setIsVisible(true);
  };

  const closeModal = () => {
    setIsVisible(false);
    setSelectedEvent(null);
  };

  const setHabitModalVisibleFn = (visible: boolean) => {
    setIsHabitModalVisible(visible);
  };

  return (
    <EventModalContext.Provider value={{ isVisible, isHabitModalVisible, selectedEvent, openCreateModal, openEditModal, closeModal, setHabitModalVisible: setHabitModalVisibleFn }}>
      {children}
    </EventModalContext.Provider>
  );
};

export const useEventModal = () => {
  const context = useContext(EventModalContext);
  if (!context) {
    throw new Error('useEventModal must be used within EventModalProvider');
  }
  return context;
};
