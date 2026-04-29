import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { InventoryProvider } from '@/context/InventoryContext';
import ProtectedRoute, { PublicOnlyRoute } from '@/features/auth/ProtectedRoute';
import LoginPage from '@/features/auth/LoginPage';
import SignupPage from '@/features/auth/SignupPage';
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage';
import AppShell from '@/layouts/AppShell';
import DashboardPage from '@/features/dashboard/DashboardPage';
import InventoryPage from '@/features/inventory/InventoryPage';
import RoomsPage from '@/features/rooms/RoomsPage';
import Chatbot from '@/features/chatbot/Chatbot';

function ProtectedShell() {
  return (
    <InventoryProvider>
      <AppShell />
      <Chatbot />
    </InventoryProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public auth routes */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <SignupPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicOnlyRoute>
                <ForgotPasswordPage />
              </PublicOnlyRoute>
            }
          />

          {/* Protected app */}
          <Route
            element={
              <ProtectedRoute>
                <ProtectedShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#fdfbf5',
              color: '#353430',
              border: '1px solid #ece5d3',
              borderRadius: '12px',
              fontSize: '13px',
              fontFamily: 'Manrope, sans-serif',
              boxShadow: '0 4px 12px rgba(60, 50, 30, 0.08), 0 16px 48px rgba(60, 50, 30, 0.10)',
            },
            success: {
              iconTheme: { primary: '#059669', secondary: '#fdfbf5' },
            },
            error: {
              iconTheme: { primary: '#dc2626', secondary: '#fdfbf5' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
