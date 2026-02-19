"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "custillano_visitor_name";

interface UserNameContextValue {
  name: string | null;
  hydrated: boolean;
  setName: (name: string) => void;
}

const UserNameContext = createContext<UserNameContextValue>({
  name: null,
  hydrated: false,
  setName: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [name, setNameState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setNameState(stored);
    }
    setHydrated(true);
  }, []);

  const setName = useCallback((newName: string) => {
    localStorage.setItem(STORAGE_KEY, newName);
    setNameState(newName);
  }, []);

  return (
    <UserNameContext.Provider value={{ name, hydrated, setName }}>
      {children}
    </UserNameContext.Provider>
  );
}

export function useUserName() {
  return useContext(UserNameContext);
}
