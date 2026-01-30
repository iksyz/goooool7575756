import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonSize = "sm" | "md" | "lg";

type ButtonOwnProps = {
    variant?: ButtonVariant;
    size?: ButtonSize;
};

type ButtonProps<T extends ElementType> = {
    as?: T;
} & ButtonOwnProps &
    Omit<ComponentPropsWithoutRef<T>, keyof ButtonOwnProps | "as" | "color">;

export function Button<T extends ElementType = "button">({
    as,
    className,
    variant = "primary",
    size = "md",
    ...props
}: ButtonProps<T>) {
    const Comp = (as ?? "button") as ElementType;

    return (
        <Comp
            className={cn(
                "group relative inline-flex items-center justify-center gap-2 font-semibold transition-shadow",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-referee-yellow/60 focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-60",
                size === "sm" && "h-10 rounded-full px-4 text-sm",
                size === "md" && "h-12 rounded-full px-6 text-sm",
                size === "lg" && "h-14 rounded-full px-7 text-base",
                variant === "primary" &&
                "bg-pitch-green text-stadium-white shadow-premium hover:shadow-premium-strong",
                variant === "secondary" &&
                "border border-emerald-950/10 bg-white/70 text-emerald-950/85 shadow-[0_10px_30px_rgba(2,44,34,0.10)] backdrop-blur hover:shadow-[0_18px_50px_rgba(2,44,34,0.18)]",
                variant === "ghost" &&
                "bg-transparent text-emerald-950/80 hover:bg-emerald-950/[0.04]",
                className
            )}
            {...props}
        />
    );
}
