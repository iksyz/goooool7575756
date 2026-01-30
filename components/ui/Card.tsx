import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement>;

type CardSectionProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-3xl border border-black/10 bg-white shadow-premium",
                className
            )}
            {...props}
        />
    );
}

export function CardHeader({ className, ...props }: CardSectionProps) {
    return <div className={cn("relative p-6", className)} {...props} />;
}

export function CardContent({ className, ...props }: CardSectionProps) {
    return <div className={cn("relative px-6 pb-6", className)} {...props} />;
}
