import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FilterProvider } from '@/lib/DashboardFilterContext';
import Layout from './dashboard/components/Layout/Layout';
import {
  Section1Dashboard,
  IndividualQuestions,
  Performancetab,
  PerformanceInsights,
  Upload
} from './dashboard/pages';

function App() {
  return (
    <Router>
      <FilterProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Section1Dashboard />} />
            <Route path="individual-questions" element={<IndividualQuestions />} />
            <Route path="performance" element={<Performancetab />} />
            <Route path="upload" element={<Upload />} />
            <Route path="performance-insights" element={<PerformanceInsights />} />
          </Route>
        </Routes>
      </FilterProvider>
    </Router>
  );
}

export default App;