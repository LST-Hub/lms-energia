import { useContext } from "react";
import { AuthContext } from "../Contexts";

function useUser() {
  const sessionData = useContext(AuthContext);
  if (!sessionData || !sessionData.user) return null;

  return sessionData.user;
}

export default useUser;
