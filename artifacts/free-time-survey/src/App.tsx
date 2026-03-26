import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Survey from "@/pages/Survey";
import Results from "@/pages/Results";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/results" element={<Results />} />
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center text-muted-foreground">
              Page not found.
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
