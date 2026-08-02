import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import Login from "../pages/Login";
import ProtectedRoute from "../routes/ProtectedRoute";
import Dashboard from "../pages/Dashboard";
import FileExplorer from "../pages/FileExplorer";
import AuditLogs from "../pages/AuditLogs";
import UserManagement from "../pages/UserManagement";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> }, // 🔴 IMPORTANT
      { path: "files", element: <FileExplorer /> },
      { path: "audit", element: <AuditLogs /> },
      { path: "users", element: <UserManagement /> },
    ],
  },
]);

export default router;

