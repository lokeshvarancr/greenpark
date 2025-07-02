import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import EHeader from './header.jsx';

const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebarCollapse = () => setIsSidebarCollapsed(prev => !prev);

  // Tailwind classes for responsive sidebar margin
  const sidebarMarginClass = isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64';

  return (
    <div className="flex h-screen bg-gray-100 text-text">
      {/* Header includes toggle and sidebar markup */}
      <EHeader
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebarCollapse={toggleSidebarCollapse}
      />

      {/* Main content: full width on mobile, shifted right on md+ */}
      <main
        className={`flex-1 flex flex-col overflow-auto pt-12 px-4 transition-all duration-300 ${sidebarMarginClass}`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
