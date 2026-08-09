import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useEffect, lazy, Suspense } from 'react';

// Lazy load pages for code splitting
const Home = lazy(() => import('@/pages/Home'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));
const Contact = lazy(() => import('@/pages/Contact'));
const AboutFounder = lazy(() => import('@/pages/AboutFounder'));
const Auth = lazy(() => import('@/pages/Auth'));
const AuthCallback = lazy(() => import('@/pages/AuthCallback'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Upgrade = lazy(() => import('@/pages/Upgrade'));
const Browse = lazy(() => import('@/pages/Browse'));
const CourseDetail = lazy(() => import('@/pages/CourseDetail'));
const Learning = lazy(() => import('@/pages/Learning'));
const MyLearning = lazy(() => import('@/pages/MyLearning'));
const FinalExam = lazy(() => import('@/pages/FinalExam'));
const Certificates = lazy(() => import('@/pages/Certificates'));
const CertificateCheckoutPage = lazy(() => import('@/pages/CertificateCheckoutPage'));
const VerifyCertificate = lazy(() => import('@/pages/VerifyCertificate'));

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

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/contact" component={Contact} />
        <Route path="/about-founder" component={AboutFounder} />
        <Route path="/verify" component={VerifyCertificate} />
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
    </Suspense>
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
