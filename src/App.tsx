import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { HelmetProvider } from 'react-helmet-async';
import { DEMO_VERIFY_URL } from '@/lib/demo';
import Index from './pages/Index';
import Login from './pages/Login';
import AuthLanding from './pages/AuthLanding';
import Profile from './pages/Profile';
import SessionSettings from './pages/SessionSettings';
import BatchRegistration from './pages/BatchRegistration';
import BatchTokenize from './pages/BatchTokenize';
import BatchVerify from './pages/BatchVerify';
import TestHedera from './pages/TestHedera';
import Dashboard from './pages/Dashboard';

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/welcome" element={<AuthLanding />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/session-settings" element={<ProtectedRoute><SessionSettings /></ProtectedRoute>} />
              <Route path="/register" element={<ProtectedRoute><BatchRegistration /></ProtectedRoute>} />
              <Route path="/tokenize" element={<ProtectedRoute><BatchTokenize /></ProtectedRoute>} />
              <Route path="/verify" element={<BatchVerify />} />
              <Route path="/verify/:tokenId/:serialNumber" element={<BatchVerify />} />
              <Route path="/demo" element={<Navigate to={DEMO_VERIFY_URL} replace />} />
              <Route path="/test-hedera" element={<ProtectedRoute><TestHedera /></ProtectedRoute>} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
