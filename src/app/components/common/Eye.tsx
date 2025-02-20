import { useState } from "react";
import { Eye as EyeIcon, EyeOff } from "lucide-react";
interface EyeProps {
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Eye = ({ showPassword, setShowPassword }: EyeProps) => {
  return (
    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
    >
      {showPassword ? (
        <EyeOff className="h-5 w-5" />
      ) : (
        <EyeIcon className="h-5 w-5" />
      )}
      <span className="sr-only">
        {showPassword ? "Hide password" : "Show password"}
      </span>
    </button>
  );
};

interface EyeConfirmProps {
  showConfirmPassword: boolean;
  setShowConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>;
}

export const EyeConfirm = ({
  showConfirmPassword,
  setShowConfirmPassword,
}: EyeConfirmProps) => {
  return (
    <button
      type="button"
      onClick={() => setShowConfirmPassword((prev) => !prev)}
      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
    >
      {showConfirmPassword ? (
        <EyeOff className="h-5 w-5" />
      ) : (
        <EyeIcon className="h-5 w-5" />
      )}
      <span className="sr-only">
        {showConfirmPassword ? "Hide password" : "Show password"}
      </span>
    </button>
  );
};
