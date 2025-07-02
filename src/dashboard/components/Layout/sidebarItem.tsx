import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  isSidebarOpen: boolean;
  onClick?: () => void;
  activePattern?: RegExp;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  to,
  icon,
  text,
  isSidebarOpen,
  onClick,
  activePattern,
}) => {
  const location = useLocation();

  const isActiveRoute = () => {
    if (activePattern) {
      return activePattern.test(location.pathname);
    }
    return location.pathname === to;
  };

  return (
    <motion.li
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative group"
    >
      <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) => {
          const activeState = activePattern ? isActiveRoute() : isActive;
          return clsx(
            "flex items-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
            {
              'px-4 py-3 text-left': isSidebarOpen,
              'w-10 h-10 justify-center': !isSidebarOpen,
            },
            {
              "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 font-medium shadow-md": activeState,
              "text-gray-700 hover:bg-blue-50 hover:shadow-sm": !activeState,
            }
          );
        }}
      >
        <div
          className={clsx(
            "flex items-center justify-center transition-colors duration-200 group-hover:text-blue-600",
            {
              'mr-3': isSidebarOpen,
            }
          )}
        >
          {icon}
        </div>
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="text-base whitespace-nowrap overflow-hidden"
            >
              {text}
            </motion.span>
          )}
        </AnimatePresence>
        {!isSidebarOpen && (
          <span className="sr-only">{text}</span>
        )}
      </NavLink>
    </motion.li>
  );
};

export default React.memo(SidebarItem);
