// routes/PublicRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/auth/Login";
import AdminLogin from "@/pages/auth/AdminLogin";
import Signup from "@/pages/auth/Signup";
import Landing from "@/pages/Landing";

const PublicRoutes = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default PublicRoutes;
