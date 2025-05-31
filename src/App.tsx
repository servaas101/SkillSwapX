import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { PrivacySettings } from './pages/PrivacySettings';
import { Opportunities } from './pages/Opportunities';
import { SkillsAnalytics } from './pages/SkillsAnalytics';
import { ProjectCollaboration } from './pages/ProjectCollaboration';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/privacy-settings" element={<PrivacySettings />} />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/skills-analytics" element={<SkillsAnalytics />} />
            <Route path="/project-collaboration" element={<ProjectCollaboration />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;