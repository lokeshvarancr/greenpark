// Central export for dashboard pages
export { default as Section1Dashboard } from './Section1Dashboard';
export { default as IndividualQuestions } from './IndividualQuestions';
export { default as Performancetab } from './Performancetab';
export { default as ManagementDrilldownPage } from './ManagementDrillDown';
export { default as PerformanceInsights } from './PerformanceInsights';

// Layout component merged from layout.tsx
import type { ReactNode } from 'react';
import Sidebar from '../components/sidebar';
import Footer from '../components/footer';

export interface LayoutProps {
    children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => (
    <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen">
            <main className="flex-grow p-4">{children}</main>
            <Footer />
        </div>
    </div>
);
    