import './App.css';
import Section1Dashboard from './Section1Dashboard';
import IndividualQuestions from './IndividualQuestions';
import Performancetab from './Performancetab';
import ManagementDrilldownPage from './ManagementDrillDown';
import PerformanceInsights from './PerformanceInsights';
import Sidebar from './components/sidebar';
import Footer from './components/footer';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FilterProvider } from '@/lib/DashboardFilterContext';

function App() {
  return (
    <Router>
      <FilterProvider>
        <div className="flex h-screen w-full overflow-hidden">
          <Sidebar />
          <div className="ml-64 flex-1 flex flex-col">
            <main className="flex-1 overflow-y-auto p-6 pb-20 bg-slate-50">
              <Routes>
                <Route path="/" element={<Section1Dashboard />} />
                <Route path="/individual-questions" element={<IndividualQuestions />} />
                <Route path="/performance" element={<Performancetab />} />
                <Route path="/management-drilldown" element={<ManagementDrilldownPage />} />
                <Route path="/performance-insights" element={<PerformanceInsights />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </div>
      </FilterProvider>
    </Router>
  );
}

export default App;