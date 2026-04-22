import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Provider, useSelector } from "react-redux";
import { store } from "./app/store"; // Redux store
import { selectCurrentToken } from "./services/authSlice";
import AppRoutes from "./AppRoutes";
import PublicRoutes from "./routes/PublicRoutes";
import useAuth from "@/hooks/useAuth";

const AppContent = () => {
  const { id } = useAuth(); 
  const token = useSelector(selectCurrentToken);
  const isAuthenticated = !!id && !!token;

  return isAuthenticated ? <AppRoutes /> : <PublicRoutes />;
};

const App = () => (
  <Provider store={store}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </Provider>
);

export default App;
