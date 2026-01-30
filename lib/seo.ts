import type { Metadata } from "next";

type SeoInput = {
    title: string;
    description: string;
};

export function buildMetadata({ title, description }: SeoInput): Metadata {
    return {
        title,
        description,
    };
}
