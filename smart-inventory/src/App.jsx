import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { InventoryProvider } from '@/context/InventoryContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
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

function ThemedToaster() {
  const { dark } = useTheme();
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: dark ? '#1e1d1a' : '#fdfbf5',
          color: dark ? '#f0ede6' : '#353430',
          border: dark ? '1px solid #2a2925' : '1px solid #ece5d3',
          borderRadius: '12px',
          fontSize: '13px',
          fontFamily: 'Manrope, sans-serif',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 16px 48px rgba(0,0,0,0.12)',
        },
        success: {
          iconTheme: { primary: '#059669', secondary: dark ? '#1e1d1a' : '#fdfbf5' },
        },
        error: {
          iconTheme: { primary: '#dc2626', secondary: dark ? '#1e1d1a' : '#fdfbf5' },
        },
      }}
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
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

          <ThemedToaster />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
