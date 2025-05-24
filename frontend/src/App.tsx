import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout/Layout';
import HomePage from '@/components/Pages/HomePage';
import RecipeParserPage from '@/components/Pages/RecipeParserPage';
import RecipesPage from '@/components/Pages/RecipesPage';
import RecipeDetailPage from '@/components/Pages/RecipeDetailPage';
import LoginPage from '@/components/Auth/LoginPage';
import RegisterPage from '@/components/Auth/RegisterPage';
import ProfilePage from '@/components/Pages/ProfilePage';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import './App.css';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Green theme for food/nutrition
      light: '#60ad5e',
      dark: '#005005',
    },
    secondary: {
      main: '#f57c00', // Orange accent
      light: '#ffad42',
      dark: '#bb4d00',
    },
    background: {
      default: '#f8f9fa',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to home if already authenticated)
const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

// App Routes Component
const AppRoutes: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } 
      />

      {/* Protected Routes */}
      <Route 
        path="/parse" 
        element={
          <ProtectedRoute>
            <Layout>
              <RecipeParserPage />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/recipes" 
        element={
          <ProtectedRoute>
            <Layout>
              <RecipesPage />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/recipes/:id" 
        element={
          <ProtectedRoute>
            <Layout>
              <RecipeDetailPage />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } 
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;