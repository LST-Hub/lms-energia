import { useContext } from "react";
import { AuthContext } from "../Contexts";

function useUserRole() {
  const sessionData = useContext(AuthContext);
  if (!sessionData || !sessionData.user || !sessionData.user.role) return null;

  return sessionData.user.role;
}

export default useUserRole;
