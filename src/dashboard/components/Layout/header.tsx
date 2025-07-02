import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextAlignLeft,
  House,
  Bell,
  List,
  ListChecks,
  ChartBar,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from 'framer-motion';
//import { useUserData } from '../../../../hooks/z_header/z_useUserData';
import HeaderBase from './headerbase';
import UserDropdown from './UserDropdown';
import DesktopSidebar from './desktopSidebar';


interface HeaderProps {
  isSidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
}

interface Notification {
  id: number;
  text: string;
  time: string;
  read: boolean;
}

const Header: React.FC<HeaderProps> = ({ isSidebarCollapsed, toggleSidebarCollapse }) => {
  // const { userData: educatorInfo, isLoading } = useUserData<UserInfo>(fetcheducatordetail, { name: '', inst: '' });
  // Hardcoded educator info
  const educatorInfo = { name: 'Sachin', inst: 'Green Park' };
  const isLoading = false;
  // Remove unused state and variables
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    setNotifications([
      { id: 1, text: 'New student assessment uploaded', time: '10m ago', read: false },
      { id: 2, text: 'Monthly reports are ready for review', time: '1h ago', read: false },
      { id: 3, text: 'Staff meeting scheduled for tomorrow', time: '2h ago', read: true }
    ]);
  }, []);

  const unreadCount: number = notifications.filter(n => !n.read).length;

  // Fix sidebarItems to use icon components, not JSX elements
  const sidebarItems = [
    { to: "/", icon: House, text: "Dashboard" },
    { to: "/individual-questions", icon: ListChecks, text: "Question Insights" },
    { to: "/performance", icon: ChartBar, text: "Student Performance" },
    { to: "/performance-insights", icon: ChartBar, text: "Performance Insights" },
    { to: "/upload", icon: ListChecks, text: "Uploads" },
  ];

  const handleLogout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("first_time_login");
    navigate("/auth");
  };

  const markAllAsRead = (): void => {
    setNotifications(notifications.map((n: Notification) => ({ ...n, read: true })));
  };

  const getGreeting = (): string => {
    const hour: number = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <>
      <HeaderBase isMobile>
        <div className="flex items-center justify-between w-full px-4 py-3">
          <button
            onClick={toggleSidebarCollapse}
            className="btn btn-ghost flex items-center justify-center rounded-xl p-2 hover:bg-gray-100 transition-colors"
            aria-label="Open sidebar"
          >
            <List size={24} className="text-gray-700" />
          </button>
          <div className="flex-1 text-center">
            <span className="font-semibold text-gray-800 text-lg">
              Inzight<span className="bg-gradient-to-br from-blue-600 to-blue-400 text-transparent bg-clip-text">Ed</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                className="btn btn-ghost rounded-xl relative hover:bg-gray-100 transition-colors"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label={unreadCount > 0 ? `Notifications - ${unreadCount} unread` : "No new notifications"}
              >
                <Bell size={22} className="text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    <div className="flex justify-between items-center p-3 border-b">
                      <h3 className="font-medium">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification: Notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 border-b hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                            role="menuitem"
                          >
                            <p className="text-sm">{notification.text}</p>
                            <p className="text-sm text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No notifications
                        </div>
                      )}
                    </div>
                    <div className="p-2 text-center border-t">
                      <button
                        className="text-sm text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/educator/notifications');
                        }}
                        role="menuitem"
                      >
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <UserDropdown
              userInfo={educatorInfo}
              onLogout={handleLogout}
              type="educator"
            />
          </div>
        </div>
      </HeaderBase>
      <div className="hidden md:flex">
        <DesktopSidebar
          items={sidebarItems}
          isCollapsed={isSidebarCollapsed}
          onLogout={handleLogout}
          userInfo={educatorInfo}
        />
        <header
          className="bg-white fixed top-0 right-0 z-30 h-20 flex items-center justify-between transition-all duration-300 px-8 border-b border-gray-200"
          style={{
            left: isSidebarCollapsed ? "5rem" : "16rem",
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebarCollapse}
              className="btn btn-sm h-10 w-10 btn-square bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-colors"
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <TextAlignLeft size={20} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-2xl font-semibold text-gray-800 font-poppins">
                {getGreeting()}, <span className="text-blue-600">{isLoading ? "Educator" : educatorInfo.name.split(' ')[0]}</span>
              </h1>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                className="btn btn-ghost btn-circle relative hover:bg-gray-100 transition-colors"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label={unreadCount > 0 ? `Notifications - ${unreadCount} unread` : "No new notifications"}
              >
                <Bell size={22} className="text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    <div className="flex justify-between items-center p-3 border-b">
                      <h3 className="font-medium">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification: Notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 border-b hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                            role="menuitem"
                          >
                            <p className="text-sm">{notification.text}</p>
                            <p className="text-sm text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No notifications
                        </div>
                      )}
                    </div>
                    <div className="p-2 text-center border-t">
                      <button
                        className="text-sm text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/educator/notifications');
                        }}
                        role="menuitem"
                      >
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="h-8 w-px bg-gray-200 mx-1"></div>
            <div className="relative">
              <UserDropdown
                userInfo={educatorInfo}
                onLogout={handleLogout}
                type="educator"
              />
            </div>
          </div>
        </header>
      </div>
    </>
  );
};

export default Header;
