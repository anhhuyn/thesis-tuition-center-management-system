// Avatar.tsx
import { cn } from "../../../../../utils/cn";
import { getInitials } from "./utils";

type AvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
};

export const Avatar = ({ name, size = "md" }: AvatarProps) => {
  const initials = getInitials(name);
  
  return (
    <div className={cn(
      "rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-600 font-semibold shadow-sm",
      sizeClasses[size]
    )}>
      {initials}
    </div>
  );
};