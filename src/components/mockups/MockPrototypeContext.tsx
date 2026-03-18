import { createContext, useContext, useState, type ReactNode } from "react";

interface MockPrototypeCtx {
  showHotspots: boolean;
  toggleHotspots: () => void;
}

const Ctx = createContext<MockPrototypeCtx>({ showHotspots: false, toggleHotspots: () => {} });

export function MockPrototypeProvider({ children }: { children: ReactNode }) {
  const [showHotspots, setShow] = useState(false);
  return (
    <Ctx.Provider value={{ showHotspots, toggleHotspots: () => setShow((p) => !p) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useMockPrototype() {
  return useContext(Ctx);
}
