// Re-exports the real useAuth hook so any legacy `import useAuth from
// "../hooks/useAuth"` default-import keeps working. The previous version of
// this file imported a named `AuthContext` export that doesn't exist on
// ../context/AuthContext (only `useAuth`/`AuthProvider` are exported there),
// which meant this hook silently returned `undefined` for everything.
import { useAuth } from "../context/AuthContext";

export default useAuth;
