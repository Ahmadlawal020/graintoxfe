import { Route } from "react-router-dom";
import UserDashboard from "@/pages/user/Dashboard";
import Market from "@/pages/user/Market";
import Portfolio from "@/pages/user/Portfolio";
import Storage from "@/pages/user/Storage";
import Wallet from "@/pages/shared/Wallet";
import UserSettings from "@/pages/shared/UserSettings";
import MyCrops from "@/pages/user/MyCrops";
import CropDetails from "@/pages/user/CropDetails";

const userRoutes = (
  <>
    <Route path="/user" element={<UserDashboard />} />
    <Route path="/user/market" element={<Market />} />
    <Route path="/user/portfolio" element={<Portfolio />} />
    <Route path="/user/storage" element={<Storage />} />
    <Route path="/user/wallet" element={<Wallet />} />
    <Route path="/user/settings" element={<UserSettings />} />
    <Route path="/user/crops" element={<MyCrops />} />
    <Route path="/user/crops/:symbol" element={<CropDetails />} />
  </>
);

export default userRoutes;
