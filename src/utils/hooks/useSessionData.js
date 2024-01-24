import { useContext } from "react";
import { AuthContext } from "../Contexts";

function useSessionData() {
  const sessionData = useContext(AuthContext);
  if (!sessionData) return null;

  return sessionData;
}

export default useSessionData;
