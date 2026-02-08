import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";

import PageLoader from "./components/PageLoader";

// Lazy pages
const Home = lazy(() => import("./pages/Home"));
const SaludMental = lazy(() => import("./pages/SaludMental"));
const Trastornos = lazy(() => import("./pages/Trastornos"));
const TrastornoDetalle = lazy(() => import("./pages/TrastornoDetalle"));
const Autocuidado = lazy(() => import("./pages/Autocuidado"));
const Help = lazy(() => import("./pages/Help"));

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/salud-mental" element={<SaludMental />} />
          <Route path="/trastornos" element={<Trastornos />} />
          <Route path="/trastornos/:slug" element={<TrastornoDetalle />} />
          <Route path="/autocuidado" element={<Autocuidado />} />
          <Route path="/ayuda" element={<Help />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default App;
