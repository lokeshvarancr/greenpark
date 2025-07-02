import { UserCircle, SignOut } from "@phosphor-icons/react";
import React from "react";

/**
 * UserDropdown Component
 * Displays a dropdown menu for user-related actions, typically found in a header/navbar.
 * Shows user initials, name, and type-specific information, along with a logout option.
 */
export interface UserDropdownProps {
  userInfo: {
    name?: string;
    inst?: string;
    student_id?: string | number;
  };
  onLogout: () => void;
  type: "student" | "educator";
}

const UserDropdown: React.FC<UserDropdownProps> = ({ userInfo, onLogout, type }) => {
  // Get the first letter of the user's name, or 'U' as a fallback
  const initials = userInfo?.name?.charAt(0)?.toUpperCase() || "U";

  // Determine the secondary text based on user type
  const secondaryInfo =
    type === "educator"
      ? `Institution: ${userInfo.inst || "N/A"}`
      : `Student ID: #${userInfo.student_id || "N/A"}`;

  return (
    <div className="dropdown dropdown-end">
      {/* Dropdown Trigger Button (User Icon) */}
      <label
        tabIndex={0}
        className="btn btn-ghost btn-circle hover:bg-gray-100 transition-colors"
        aria-label="Open user menu"
      >
        <UserCircle size={32} className="text-gray-600" />
      </label>

      {/* Dropdown Content */}
      <ul
        tabIndex={0}
        className="menu dropdown-content mt-2 p-2 shadow-lg bg-white rounded-box w-64 border border-gray-200 z-10"
        role="menu"
        aria-orientation="vertical"
      >
        {/* User Information Display */}
        <div className="flex items-center p-4 border-b border-gray-100">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-xl flex-shrink-0">
            {initials}
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="font-semibold text-gray-900 truncate" title={userInfo.name}>
              {userInfo.name}
            </p>
            <p className="text-sm text-gray-500 truncate" title={secondaryInfo}>
              {secondaryInfo}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-2">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full py-2 px-3 hover:bg-gray-50 rounded-lg text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            role="menuitem"
          >
            <SignOut size={18} aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </ul>
    </div>
  );
};

export default UserDropdown;
