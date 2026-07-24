import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Home from '@/pages/Home';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import Contact from '@/pages/Contact';
import AboutFounder from '@/pages/AboutFounder';
import Auth from '@/pages/Auth';
import AuthCallback from '@/pages/AuthCallback';
import Dashboard from '@/pages/Dashboard';
import Upgrade from '@/pages/Upgrade';
import Browse from '@/pages/Browse';
import CourseDetail from '@/pages/CourseDetail';
import Learning from '@/pages/Learning';
import MyLearning from '@/pages/MyLearning';
import FinalExam from '@/pages/FinalExam';
import Certificates from '@/pages/Certificates';
import CertificateCheckoutPage from '@/pages/CertificateCheckoutPage';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.FC }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/auth");
    }
  }, [loading, user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/contact" component={Contact} />
      <Route path="/about-founder" component={AboutFounder} />
      <Route path="/auth" component={Auth} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/upgrade">
        <ProtectedRoute component={Upgrade} />
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/browse">
        <ProtectedRoute component={Browse} />
      </Route>
      <Route path="/course/:id">
        <ProtectedRoute component={CourseDetail} />
      </Route>
      <Route path="/my-learning">
        <ProtectedRoute component={MyLearning} />
      </Route>
      <Route path="/learning/:courseId">
        <ProtectedRoute component={Learning} />
      </Route>
      <Route path="/final-exam/:courseId">
        <ProtectedRoute component={FinalExam} />
      </Route>
      <Route path="/certificate">
        <ProtectedRoute component={Certificates} />
      </Route>
      <Route path="/certificate/:courseId">
        <ProtectedRoute component={CertificateCheckoutPage} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <Router />
            </WouterRouter>
            <Toaster />
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
