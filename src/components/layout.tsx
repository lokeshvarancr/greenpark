// src/components/Layout.jsx
import type { ReactNode } from 'react';
import Sidebar from './sidebar';
import Footer from './footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => (
  <div className="flex">
    <Sidebar />
    <div className="flex-1 flex flex-col min-h-screen">
      <main className="flex-grow p-4">{children}</main>
      <Footer />
    </div>
  </div>
);

export default Layout;
