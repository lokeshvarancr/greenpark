// src/components/Layout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = ({ children }) => (
  <div className="flex">
    <Sidebar />
    <div className="flex-1 flex flex-col min-h-screen">
      <main className="flex-grow p-4">{children}</main>
      <Footer />
    </div>
  </div>
);

export default Layout;
