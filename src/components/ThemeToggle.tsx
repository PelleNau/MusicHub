import { Sun, Moon, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeToggle } from "@/hooks/useTheme";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useThemeToggle();
  const Icon = theme === "dark" ? Sun : theme === "light" ? Waves : Moon;
  return (
    <Button
      size="icon"
      variant="ghost"
      className={className ?? "h-8 w-8 text-muted-foreground"}
      onClick={toggleTheme}
      title="Toggle theme"
    >
      <Icon className="h-3.5 w-3.5" />
    </Button>
  );
}
