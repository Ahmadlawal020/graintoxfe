import { Routes, Route, Navigate } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import MainLayout from "@/layout/MainLayout";
import adminRoutes from "./routes/AdminRoutes";
import managerRoutes from "./routes/ManagerRoutes";
import userRoutes from "./routes/UserRoutes";


const AppRoutes = () => {
  return (
    <MainLayout>
      <Routes>
        {adminRoutes}
        {managerRoutes}
        {userRoutes}

        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route
          path="/unauthorized"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">403</h1>
                <p className="text-xl text-muted-foreground">Access Denied</p>
              </div>
            </div>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
};

export default AppRoutes;
