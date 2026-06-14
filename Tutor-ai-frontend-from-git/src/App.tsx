import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
//landing


// Pages
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import QuizPage from "./pages/QuizPage";
import ChatPage from "./pages/ChatPage";
import CoursesPage from "./pages/CoursesPage";
import ProgressPage from "./pages/ProgressPage";
import NotFound from "./pages/NotFound";
import SettingsPage from "./pages/SettingsPage";
import CoursDetailPage from "./pages/CoursDetailPage";
// new
import ResetPasswordPage from '@/pages/ResetPasswordPage';

// Layouts
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                 
                
                {/* Guest Only Routes */}
                <Route path="/login" element={<ProtectedRoute guestOnly><LoginPage /></ProtectedRoute>} />
                <Route path="/register" element={<ProtectedRoute guestOnly><RegisterPage /></ProtectedRoute>} />
                <Route path="/forgot-password" element={<ProtectedRoute guestOnly><ForgotPasswordPage /></ProtectedRoute>} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                
                
                {/* <Route path="/reset-password" element={<ProtectedRoute guestOnly><ResetPasswordPage /></ProtectedRoute>} /> */}
                {/* Protected Routes with Dashboard Layout */}
                <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/courses" element={<CoursesPage />} />
                  <Route path="/courses/:id" element={<CoursDetailPage />} />
                  <Route path="/progress" element={<ProgressPage />} />
                  <Route path="/quizzes" element={<QuizPage />} />
                  <Route path="/planner" element={<DashboardPage />} />
                  <Route path="/achievements" element={<ProgressPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
