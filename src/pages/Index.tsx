import { Navigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { isAdmin, isManager, isUser, id } = useAuth();

  if (!id) return <Navigate to="/login" replace />;

  if (isAdmin) return <Navigate to="/admin" replace />;
  if (isManager) return <Navigate to="/manager" replace />;
  if (isUser) return <Navigate to="/user" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-card">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  );
};

export default Index;
