import { ReactNode } from "react";
import Image from "next/image";

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  imageUrl?: string;
  align?: "left" | "right";
}

export function FeatureCard({
  title,
  description,
  icon,
  imageUrl,
  align = "left",
}: FeatureCardProps) {
  return (
    <div
      className={`flex flex-col ${
        align === "right" ? "md:flex-row-reverse" : "md:flex-row"
      } gap-8 items-center`}
    >
      <div className="flex-1 space-y-4">
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
      <div className="flex-1 relative">
        {imageUrl && (
          <div className="relative w-full aspect-square max-w-[400px] mx-auto">
            <Image
              src={imageUrl}
              alt={title}
              layout="fill"
              objectFit="contain"
            />
          </div>
        )}
      </div>
    </div>
  );
}
