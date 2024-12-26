import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function EyeLogo() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <>
      <p
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
      >
        {showConfirmPassword ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
        <span className="sr-only">
          {showConfirmPassword ? "Hide password" : "Show password"}
        </span>
      </p>
    </>
  );
}
