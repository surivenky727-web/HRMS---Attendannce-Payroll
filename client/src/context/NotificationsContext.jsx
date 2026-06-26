import { createContext, useContext, useMemo, useState } from 'react';

const NotificationsContext = createContext(null);

const initialNotifications = [
  {
    id: 'n1',
    type: 'success',
    title: 'Employee added successfully',
    description: 'A new employee record has been created for Dana White.',
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    read: false,
  },
  {
    id: 'n2',
    type: 'warning',
    title: 'Leave request approved',
    description: 'A leave request from Kevin was approved for next week.',
    timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    read: false,
  },
  {
    id: 'n3',
    type: 'error',
    title: 'Payroll processing issue',
    description: 'One payroll batch failed validation and needs review.',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    read: false,
  },
  {
    id: 'n4',
    type: 'info',
    title: 'Attendance reminder',
    description: 'Don’t forget to submit today’s attendance before 6 PM.',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    read: true,
  },
  {
    id: 'n5',
    type: 'success',
    title: 'New department created',
    description: 'The Customer Success department has been added.',
    timestamp: new Date(Date.now() - 1000 * 60 * 840).toISOString(),
    read: true,
  },
];

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const markAllAsRead = () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const addNotification = (notification) => {
    setNotifications((current) => [{ ...notification, id: `n_${Date.now()}` }, ...current]);
  };

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAllAsRead, markAsRead, addNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
}
