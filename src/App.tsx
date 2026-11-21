import { Component, lazy, Suspense, type ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { FixturesResultsPage } from './pages/FixturesResultsPage';
import { WebGLFallback } from './scene/WebGLFallback';

// Lazy-load the 3D scene bundle so initial critical DOM & typography paint instantaneously
const ChampionshipCanvas = lazy(() =>
  import('./scene/ChampionshipCanvas').then((m) => ({
    default: m.ChampionshipCanvas,
  }))
);

class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <WebGLFallback />;
    }
    return this.props.children;
  }
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative z-10"
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/fixtures-results" element={<FixturesResultsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <HashRouter>
      <div className="relative min-h-screen bg-[#090909] text-white selection:bg-[#D4AF37]/30 selection:text-[#F5D77A]">
        {/* Persistent Root-Level 3D Canvas — remains mounted across all route changes */}
        <CanvasErrorBoundary>
          <Suspense fallback={<WebGLFallback />}>
            <ChampionshipCanvas />
          </Suspense>
        </CanvasErrorBoundary>

        {/* Fixed Top Navigation */}
        <Navbar />

        {/* Page Routes */}
        <AnimatedRoutes />

        {/* Shared Championship Footer */}
        <Footer />
      </div>
    </HashRouter>
  );
}
