import { Button } from "@/components/ui/button";

type Props = {
  theme: "light" | "dark";
  onToggle: () => void;
};

export function ThemeView({ theme, onToggle }: Props) {
  return (
    <div
      className={`flex min-h-screen flex-col items-center justify-center gap-6 transition-colors ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <p className="text-2xl font-semibold">Current theme: {theme}</p>
      <Button variant={theme === "dark" ? "secondary" : "default"} onClick={onToggle}>
        Switch to {theme === "light" ? "dark" : "light"}
      </Button>
    </div>
  );
}
