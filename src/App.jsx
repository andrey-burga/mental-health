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
const Articulos = lazy(() => import("./pages/Articulos"));
const Testimonial = lazy(() => import("./pages/Testimonial"));
const Contact = lazy(() => import("./pages/Contact"));
import NotFound from "./pages/NotFound";

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
          <Route path="/articulos" element={<Articulos />} />
          <Route path="/testimonios" element={<Testimonial />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default App;
