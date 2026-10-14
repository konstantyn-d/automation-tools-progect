import { createContext, useContext, useState } from 'react';

// Session state on the client. In production the session is an httpOnly cookie set by
// the auth webhook (passwords hashed with bcrypt server side); here we only keep the user.
const AuthCtx = createContext(null);
const KEY = 'lc_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
  });
  const signIn = (u) => { setUser(u); try { localStorage.setItem(KEY, JSON.stringify(u)); } catch { /* ignore */ } };
  const signOut = () => { setUser(null); try { localStorage.removeItem(KEY); } catch { /* ignore */ } };
  return <AuthCtx.Provider value={{ user, signIn, signOut }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
