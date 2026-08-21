Frontend — Pages & Components
src/App.jsx — Router
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import { RoomieAuthProvider, useRoomieAuth } from '@/lib/roomieAuth';
import ScrollToTop from './components/ScrollToTop';
import Landing from '@/pages/Landing';
import Onboarding from '@/pages/Onboarding';
import Swipe from '@/pages/Swipe';
import Matches from '@/pages/Matches';

const RequireAuth = ({ children }) => {
  const { token } = useRoomieAuth();
  if (!token) return <Navigate to="/" replace />;
  return children;
};

const RequireProfile = ({ children }) => {
  const { account } = useRoomieAuth();
  if (!account?.profileCompleted) return <Navigate to="/onboarding" replace />;
  return children;
};

const AuthenticatedApp = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
      <Route path="/swipe" element={<RequireAuth><RequireProfile><Swipe /></RequireProfile></RequireAuth>} />
      <Route path="/matches" element={<RequireAuth><RequireProfile><Matches /></RequireProfile></RequireAuth>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <RoomieAuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </RoomieAuthProvider>
    </AuthProvider>
  );
}

export default App;