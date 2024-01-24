import { useContext } from "react";
import { AuthContext } from "../Contexts";

function useUserAccessLevel(permissionTypeId) {
  const sessionData = useContext(AuthContext);
  if (!sessionData || !sessionData.user) return null;
  if (!permissionTypeId) return null;

  if (!sessionData.user.role.permissions[permissionTypeId]) return null;

  return sessionData.user.role.permissions[permissionTypeId].accessLevel;
}

export default useUserAccessLevel;
