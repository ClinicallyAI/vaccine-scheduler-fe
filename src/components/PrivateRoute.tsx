import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/auth";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
