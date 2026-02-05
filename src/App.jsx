import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Resources from "./pages/Resources"
import Header from "./components/Header"
import './index.css';

function App() {
  return (
    <BrowserRouter>
   
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recursos" element={<Resources />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
