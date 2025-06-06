import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { About } from './pages/About';
import { Features } from './pages/Features';
import { Pricing } from './pages/Pricing';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { FAQ } from './pages/FAQ';
import { Contact } from './pages/Contact';
import { Legal } from './pages/Legal';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Company } from './pages/Company';
import { Careers } from './pages/Careers';
import { CareerPost } from './pages/CareerPost';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { Platform } from './pages/Platform';
import { Settings } from './pages/Settings';
import { Account } from './pages/Account';
import { NotFound } from './pages/NotFound';
import { PrivacySettings } from './pages/PrivacySettings';
import { Opportunities } from './pages/Opportunities';
import { SkillsAnalytics } from './pages/SkillsAnalytics';
import { ProjectCollaboration } from './pages/ProjectCollaboration';
import { MentorshipManagement } from './pages/MentorshipManagement';
import { MentorProfile } from './pages/MentorProfile';

function App() {
  console.log("Rendering application root component");
  
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/company" element={<Company />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/careers/:slug" element={<CareerPost />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/platform" element={<Platform />} />
          
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          
          <Route path="/privacy-settings" element={<PrivacySettings />} />
          <Route path="/opportunities" element={<ProtectedRoute><Opportunities /></ProtectedRoute>} />
          <Route path="/skills-analytics" element={<ProtectedRoute><SkillsAnalytics /></ProtectedRoute>} />
          <Route path="/project-collaboration" element={<ProtectedRoute><ProjectCollaboration /></ProtectedRoute>} />
          <Route path="/mentorship" element={<ProtectedRoute><MentorshipManagement /></ProtectedRoute>} />
          <Route path="/mentor-profile" element={<ProtectedRoute><MentorProfile /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;