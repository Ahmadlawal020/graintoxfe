import { useSelector } from "react-redux";
import { selectCurrentToken, selectActiveRole } from "../services/authSlice";
import { jwtDecode } from "jwt-decode";

interface UserInfo {
  id: string;
  email: string;
  roles: string[];
  firstName: string;
  lastName: string;
}

interface DecodedToken {
  UserInfo: UserInfo;
}

type UserRole = "Admin" | "User" | "Warehouse_Manager" | "Unknown";

interface AuthResult {
  id: string;
  email: string;
  roles: string[];
  status: UserRole;
  isAdmin: boolean;
  isUser: boolean;
  isManager: boolean;
  firstName: string;
  lastName: string;
  activeRole: string | null;
}

const useAuth = (): AuthResult => {
  const token = useSelector(selectCurrentToken);
  const activeRole = useSelector(selectActiveRole);

  const defaultAuth: AuthResult = {
    id: "",
    email: "",
    roles: [],
    status: "Unknown",
    isAdmin: false,
    isUser: false,
    isManager: false,
    firstName: "",
    lastName: "",
    activeRole: null,
  };

  if (!token) return defaultAuth;

  try {
    const decoded = jwtDecode<DecodedToken>(token);

    if (!decoded?.UserInfo) return defaultAuth;

    const { id, email, roles, firstName, lastName } = decoded.UserInfo;

    const selectedRole = (activeRole || (roles && roles.length > 0 ? roles[0] : "")).toLowerCase();

    const isAdmin = selectedRole === "admin";
    const isUser = selectedRole === "user";
    const isManager = selectedRole === "warehouse_manager" || selectedRole === "manager";

    let status: UserRole = "Unknown";
    if (isAdmin) status = "Admin";
    else if (isUser) status = "User";
    else if (isManager) status = "Warehouse_Manager";

    return {
      id,
      email,
      roles,
      status,
      isAdmin,
      isUser,
      isManager,
      firstName,
      lastName,
      activeRole,
    };
  } catch (error) {
    console.error("Token decode error:", error);
    return defaultAuth;
  }
};


export default useAuth;

