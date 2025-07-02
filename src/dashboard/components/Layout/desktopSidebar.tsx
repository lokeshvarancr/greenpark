import React from 'react';
import PropTypes from 'prop-types';
import { SignOut, CaretDown, CaretRight } from "@phosphor-icons/react";
import type { IconProps } from "@phosphor-icons/react";
import Logo from '../../../assets/Logo_Inzighted.svg';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarItem from './sidebarItem';

/**
 * Interface for a single navigation item or child item.
 */
interface SidebarNavItem {
  to?: string;
  icon: React.ElementType<IconProps>;
  text: string;
  activePattern?: RegExp;
  isParent?: boolean;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
  children?: SidebarNavItem[];
  onClick?: () => void;
}

/**
 * Interface for the user information object.
 */
interface UserInfo {
  name?: string;
  inst?: string;
}

/**
 * Props for the DesktopSidebar component.
 */
interface DesktopSidebarProps {
  items: SidebarNavItem[];
  additionalItems?: SidebarNavItem[];
  isCollapsed: boolean;
  onLogout: () => void;
  userInfo?: UserInfo;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ items, additionalItems, isCollapsed, onLogout, userInfo }) => {
  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white z-40 transition-all duration-300 flex flex-col shadow-md\n        ${isCollapsed ? "w-20" : "w-64"}`}
      aria-label="Main sidebar navigation"
    >
      {/* Header section with logo and app name */}
      <div className={`flex items-center h-20 mb-2 border-b border-gray-100 ${!isCollapsed ? 'justify-start px-6' : 'justify-center'}`}>
        {!isCollapsed ? (
          // Expanded state: Full logo and app name
          <AnimatePresence mode="wait">
            <motion.div
              key="logo-expanded"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center space-x-4"
            >
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-md">
                <span className="font-semibold text-white text-xl">
                  IE
                </span>
              </div>
              <img
                src={Logo}
                alt="InzightEd Logo"
                className="h-7 pt-1"
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          // Collapsed state: Only "IE" initials
          <AnimatePresence mode="wait">
            <motion.div
              key="logo-collapsed"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-md"
            >
              <span className="font-semibold text-white text-xl">
                IE
              </span>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Main navigation section, takes remaining vertical space and allows scrolling */}
      <nav className="flex-1 flex flex-col justify-between overflow-y-auto py-4">
        <div className={isCollapsed ? "px-2" : "px-3"}>
          {/* "Main Menu" section title */}
          <div className="px-3 mb-4">
            {!isCollapsed ? (
              <AnimatePresence>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium text-gray-500 uppercase tracking-wider"
                >
                  Main Menu
                </motion.span>
              </AnimatePresence>
            ) : (
              <span className="text-md font-extrabold text-gray-400 uppercase tracking-wider flex justify-center">
                ...
              </span>
            )}
          </div>

          {/* List of main navigation items */}
          <ul className={` ${isCollapsed ? "flex flex-col items-center space-y-4" : "space-y-2"}`} role="menu">
            {items.map((item, index) => (
              <SidebarItem
                key={item.to || `item-${index}`}
                to={typeof item.to === 'string' ? item.to : ''}
                icon={<item.icon />}
                text={item.text}
                isSidebarOpen={!isCollapsed}
                onClick={item.onClick}
                activePattern={item.activePattern}
              />
            ))}
          </ul>

          {/* Additional items section (e.g., Reports & Tools) */}
          {additionalItems && additionalItems.length > 0 && (
            <>
              {/* "Reports & Tools" section title */}
              <div className="px-3 mt-8 mb-4">
                {!isCollapsed ? (
                  <AnimatePresence>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Reports & Tools
                    </motion.span>
                  </AnimatePresence>
                ) : (
                  <span className="text-md font-extrabold text-gray-400 uppercase tracking-wider flex justify-center">
                    ...
                  </span>
                )}
              </div>

              {/* List of additional items */}
              <ul className={`${isCollapsed ? "mt-4 flex flex-col items-center" : "space-y-1"}`} role="menu">
                {additionalItems.map((item, index) => (
                  <li key={`additional-${index}`} className={`relative group ${isCollapsed ? "w-10 h-10 flex justify-center" : "w-full"}`} role="none">
                    <button
                      onClick={item.onClick}
                      className={`w-full flex items-center rounded-lg transition-all duration-200
                                  ${!isCollapsed ? 'px-4 py-3 text-left' : 'p-3 justify-center'}
                                  hover:bg-blue-50 text-gray-700 group
                                  ${isCollapsed ? 'justify-center items-center' : 'px-4 py-3 text-left w-full'}`}
                      aria-label={item.text}
                      role="menuitem"
                    >
                      <div className="relative flex items-center">
                        <div className={`flex items-center justify-center text-gray-600 group-hover:text-blue-600
                                        ${!isCollapsed ? 'mr-3' : ''}`}>
                          <item.icon size={20} />
                        </div>
                        <AnimatePresence>
                          {!isCollapsed && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="font-medium text-base"
                            >
                              {item.text}
                            </motion.span>
                          )}
                        </AnimatePresence>
                        <AnimatePresence>
                          {!isCollapsed && item.isParent && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="absolute right-0 -mr-6"
                            >
                              {item.isCollapsed ?
                                <CaretRight size={16} className="text-gray-500" /> :
                                <CaretDown size={16} className="text-gray-500" />
                              }
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </button>
                    <AnimatePresence>
                      {!isCollapsed && item.isParent && !item.isCollapsed && item.children && (
                        <motion.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-1 ml-6 space-y-1 border-l-2 border-blue-100 pl-4"
                          role="group"
                        >
                          {item.children.map((child, childIndex) => (
                            <motion.li
                              key={`child-${childIndex}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: childIndex * 0.05 }}
                              role="none"
                            >
                              <button
                                onClick={child.onClick}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                  text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors text-base"
                                aria-label={child.text}
                                role="menuitem"
                              >
                                <div className="flex items-center justify-center">
                                  {child.icon && <child.icon size={20} />}
                                </div>
                                <span>{child.text}</span>
                              </button>
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        {/* User profile section (only visible when sidebar is expanded) */}
        {!isCollapsed && userInfo && (
          <div className="mt-auto mb-4 px-3">
            <div className="flex items-center p-3 bg-blue-50 rounded-xl">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
                {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-700">{userInfo.name || 'User'}</div>
                <div className="text-sm text-gray-500">{userInfo.inst || 'Role/Institution'}</div>
              </div>
            </div>
          </div>
        )}
        {/* Logout section */}
        <div className={`pt-4 ${!isCollapsed ? 'px-3' : 'px-2'} mt-2 border-t border-gray-100`}>
          <button
            onClick={onLogout}
            className={`w-full flex items-center rounded-xl hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors group relative
              ${!isCollapsed ? 'px-4 py-3 justify-start' : 'p-3 justify-center'}`}
            aria-label="Logout"
            role="menuitem"
          >
            <SignOut size={20} className="text-gray-600 group-hover:text-red-600" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3 font-medium text-sm"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
            {isCollapsed && (
              <div
                className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-sm rounded
                opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap"
                role="tooltip"
              >
                Logout
              </div>
            )}
          </button>
        </div>
      </nav>
    </aside>
  );
};

DesktopSidebar.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      to: PropTypes.string,
      icon: PropTypes.elementType.isRequired,
      text: PropTypes.string.isRequired,
      activePattern: PropTypes.instanceOf(RegExp),
      isParent: PropTypes.bool,
      isCollapsed: PropTypes.bool,
      toggleCollapse: PropTypes.func,
      children: PropTypes.array,
      onClick: PropTypes.func,
    })
  ).isRequired,
  additionalItems: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.elementType.isRequired,
      text: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      isParent: PropTypes.bool,
      isCollapsed: PropTypes.bool,
      children: PropTypes.array,
    })
  ),
  isCollapsed: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
  userInfo: PropTypes.shape({
    name: PropTypes.string,
    inst: PropTypes.string,
  }),
};

export default DesktopSidebar;
