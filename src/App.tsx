import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FallbackModeNotification, useFallbackMode } from "@/components/FallbackModeNotification";
import Dashboard from "./pages/Dashboard";
import Appliances from "./pages/Appliances";
import AddAppliance from "./pages/AddAppliance";
import ApplianceDetail from "./pages/ApplianceDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const isFallbackMode = useFallbackMode();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {isFallbackMode && <FallbackModeNotification />}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/appliances" element={<Appliances />} />
            <Route path="/add-appliance" element={<AddAppliance />} />
            <Route path="/edit-appliance/:id" element={<AddAppliance />} />
            <Route path="/appliance/:id" element={<ApplianceDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
