import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Autocuidado from "./pages/Autocuidado";
import FactoresDeRiesgo from "./pages/FactoresDeRiesgo";
import SaludMental from "./pages/SaludMental";
import Trastornos from "./pages/Trastornos";
import TrastornoDetalle from "./pages/TrastornoDetalle";

//import Articulos from "./pages/Articulos";
//import SaludMental from "./pages/SaludMental";
//import Ayuda from "./pages/Ayuda";
/*
      <Route path="/salud-mental" element={<SaludMental />} />
      <Route path="/articulos" element={<Articulos />} />
      <Route path="/ayuda" element={<Ayuda />} />
      */

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/autocuidado" element={<Autocuidado />} />
      <Route path="/factores-de-riesgo" element={<FactoresDeRiesgo />} />
      <Route path="/salud-mental" element={<SaludMental />} />
      <Route path="/trastornos" element={<Trastornos />} />
      <Route path="/trastornos/:slug" element={<TrastornoDetalle />} />
    </Routes>
  );
}

export default App;
