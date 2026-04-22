import { Route } from "react-router-dom";
import {
  Dashboard,
  UserManagement,
  StaffManagement,
  CreateStaff,
  CreateUser,
  EditUser,
  UserDetails,
  KYCManagement,
  KYCDetails,
  Warehouses,
  CreateWarehouse,
  EditWarehouse,
  WarehouseDetail,
  CropManagement as Crops,
  CreateCrop,
  EditCrop,
  CropDetails,
  StorageOperations,
  TokenTrading,
  WalletFinance,
  Investors,
  InvestorDetails,
  StaffDetails,
  EditStaff,
  StorageDetails,
  Settings,
} from "../pages/admin";

const adminRoutes = (
  <>
    <Route path="/" element={<Dashboard />} />
    {/* Users */}
    <Route path="/users" element={<UserManagement />} />
    <Route path="/staff" element={<StaffManagement />} />
    <Route path="/staff/create" element={<CreateStaff />} />
    <Route path="/users/create" element={<CreateUser />} />
    <Route path="/users/edit/:id" element={<EditUser />} />
    <Route path="/users/:id" element={<UserDetails />} />
    <Route path="/staff/:id" element={<StaffDetails />} />
    <Route path="/staff/edit/:id" element={<EditStaff />} />
    {/* KYC */}
    <Route path="/kyc" element={<KYCManagement />} />
    <Route path="/kyc/:id" element={<KYCDetails />} />
    {/* Warehouses */}
    <Route path="/warehouses" element={<Warehouses />} />
    <Route path="/warehouses/create" element={<CreateWarehouse />} />
    <Route path="/warehouses/edit/:id" element={<EditWarehouse />} />
    <Route path="/warehouses/:id" element={<WarehouseDetail />} />
    {/* Crops */}
    <Route path="/crops" element={<Crops />} />
    <Route path="/crops/create" element={<CreateCrop />} />
    <Route path="/crops/:id" element={<CropDetails />} />
    <Route path="/crops/edit/:id" element={<EditCrop />} />
    {/* Storage */}
    <Route path="/storage" element={<StorageOperations />} />
    <Route path="/storage/:id" element={<StorageDetails />} />
    {/* Trading */}
    <Route path="/trading" element={<TokenTrading />} />
    {/* Finance */}
    <Route path="/finance" element={<WalletFinance />} />
    {/* Investors */}
    <Route path="/investors" element={<Investors />} />
    <Route path="/investors/:id" element={<InvestorDetails />} />
    {/* Settings */}
    <Route path="/settings" element={<Settings />} />
  </>
);

export default adminRoutes;
