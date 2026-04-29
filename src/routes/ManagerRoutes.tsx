import { Route } from "react-router-dom";
import {
  ManagerDashboard,
  MyWarehouse,
  StockManagement,
  QualityControl,
  InventoryReports,
  RecordStock,
  ProcessWithdrawal,
  QCDetails,
} from "@/pages/manager";

const managerRoutes = (
  <>
    <Route path="/manager" element={<ManagerDashboard />} />
    <Route path="/manager/warehouse" element={<MyWarehouse />} />
    <Route path="/manager/stock" element={<StockManagement />} />
    <Route path="/manager/stock/record" element={<RecordStock />} />
    <Route path="/manager/stock/withdraw" element={<ProcessWithdrawal />} />
    <Route path="/manager/qc" element={<QualityControl />} />
    <Route path="/manager/qc/:id" element={<QCDetails />} />
    <Route path="/manager/deposits" element={<QualityControl />} />
    <Route path="/manager/deposits/:id" element={<QCDetails />} />
    <Route path="/manager/reports" element={<InventoryReports />} />
  </>
);

export default managerRoutes;
