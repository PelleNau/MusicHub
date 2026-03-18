import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface MockXPCtx {
  xp: number;
  streak: number;
  awardXP: (amount: number) => void;
}

const Ctx = createContext<MockXPCtx>({ xp: 350, streak: 14, awardXP: () => {} });

export function MockXPProvider({ children }: { children: ReactNode }) {
  const [xp, setXp] = useState(350);
  const [streak] = useState(14);

  const awardXP = useCallback((amount: number) => {
    setXp((prev) => prev + amount);
  }, []);

  return (
    <Ctx.Provider value={{ xp, streak, awardXP }}>
      {children}
    </Ctx.Provider>
  );
}

export function useMockXP() {
  return useContext(Ctx);
}
