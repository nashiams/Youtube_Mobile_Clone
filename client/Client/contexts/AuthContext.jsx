import { createContext, useEffect, useState } from "react";
import { getSecure } from "../helpers/secureStone";

// export const
export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [isSignedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await getSecure("token");
      if (token) {
        return setSignedIn(true);
      }
    };
    checkToken();
  }, []);
  return (
    <AuthContext value={{ isSignedIn, setSignedIn }}>{children}</AuthContext>
  );
}
