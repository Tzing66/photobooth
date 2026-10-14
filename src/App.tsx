import { AnimatePresence } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import PageTransition from "./components/PageTransition";
import ThemeSwitcher from "./components/ThemeSwitcher";
import { useSessionGuard } from "./hooks/useSessionGuard";
import About from "./pages/About";
import ErrorPage from "./pages/ErrorPage";
import Faq from "./pages/Faq";
import Features from "./pages/Features";
import FrameSelection from "./pages/FrameSelection";
import Home from "./pages/Home";
import Pickup from "./pages/Pickup";
import PrintStrip from "./pages/PrintStrip";
import Select from "./pages/Select";
import TakePicture from "./pages/TakePicture";
import Upload from "./pages/Upload";
import { BoilDefs } from "./themes/shared";

// Flow: / → /frameSelection → /select → /takePicture | /upload → /printStrip → /pickup
export default function App() {
  const location = useLocation();
  useSessionGuard();

  return (
    <>
      <BoilDefs />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/features" element={<PageTransition><Features /></PageTransition>} />
          <Route path="/faq" element={<PageTransition><Faq /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/frameSelection" element={<PageTransition mode="out"><FrameSelection /></PageTransition>} />
          <Route path="/select" element={<PageTransition mode="in"><Select /></PageTransition>} />
          <Route path="/takePicture" element={<PageTransition mode="out"><TakePicture /></PageTransition>} />
          <Route path="/upload" element={<PageTransition mode="out"><Upload /></PageTransition>} />
          <Route path="/printStrip" element={<PageTransition><PrintStrip /></PageTransition>} />
          <Route path="/pickup" element={<PageTransition><Pickup /></PageTransition>} />
          <Route path="/error" element={<PageTransition mode="none"><ErrorPage /></PageTransition>} />
          <Route path="*" element={<PageTransition><Home /></PageTransition>} />
        </Routes>
      </AnimatePresence>
      <ThemeSwitcher />
    </>
  );
}
