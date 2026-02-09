import { Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Templates from './pages/Templates';
import TemplateDetail from './pages/TemplateDetail';
import ActiveWorkout from './pages/ActiveWorkout';
import History from './pages/History';
import Progress from './pages/Progress';

export default function App() {
  return (
    <div className="min-h-full bg-slate-950">
      <Routes>
        <Route path="/workout/:id" element={<ActiveWorkout />} />
        <Route
          path="*"
          element={
            <>
              <div className="pb-20">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/templates" element={<Templates />} />
                  <Route path="/templates/:id" element={<TemplateDetail />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/progress" element={<Progress />} />
                </Routes>
              </div>
              <BottomNav />
            </>
          }
        />
      </Routes>
    </div>
  );
}
