import type { LucideIcon } from "lucide-react";
import { Hash, MessageSquareText, NotepadText, TextCursorInput } from "lucide-react";

export const SITE_URL = "https://pintextai.com";

export const GENERATOR_TYPES = ["title", "description", "caption", "hashtag"] as const;
export type GeneratorType = (typeof GENERATOR_TYPES)[number];

export type ToolConfig = {
  type: GeneratorType;
  name: string;
  shortName: string;
  path: string;
  headline: string;
  description: string;
  cta: string;
  accent: "blush" | "peach" | "sage" | "lavender";
  icon: LucideIcon;
  example: string;
};

export const TOOLS: Record<GeneratorType, ToolConfig> = {
  title: {
    type: "title",
    name: "Pinterest Pin Title Generator",
    shortName: "Pin Titles",
    path: "/pin-title-generator",
    headline: "Turn one idea into 10 scroll-stopping Pin titles",
    description:
      "Paste a product page, article, landing page, or a quick description. PinTextAI finds the usable details and creates distinct title angles you can edit and publish.",
    cta: "Generate 10 Titles — Free",
    accent: "blush",
    icon: TextCursorInput,
    example: "Minimalist weekly meal planner printable for busy parents",
  },
  description: {
    type: "description",
    name: "Pinterest Description Generator",
    shortName: "Descriptions",
    path: "/pin-description-generator",
    headline: "Write useful Pin descriptions without starting from zero",
    description:
      "Create clear, keyword-aware descriptions from content you already have—without inventing product claims or forcing awkward keyword stuffing.",
    cta: "Generate 10 Descriptions — Free",
    accent: "peach",
    icon: NotepadText,
    example: "A beginner-friendly guide to growing herbs on an apartment balcony",
  },
  caption: {
    type: "caption",
    name: "Pinterest Caption Generator",
    shortName: "Captions",
    path: "/pin-caption-generator",
    headline: "Create Pinterest captions that sound like your brand",
    description:
      "Choose a goal and vibe, then get concise caption options for products, posts, offers, and evergreen content.",
    cta: "Generate 10 Captions — Free",
    accent: "sage",
    icon: MessageSquareText,
    example: "Hand-poured soy candle gift set with warm autumn scents",
  },
  hashtag: {
    type: "hashtag",
    name: "Pinterest Hashtag Generator",
    shortName: "Hashtags",
    path: "/pinterest-hashtag-generator",
    headline: "Build relevant Pinterest hashtag sets from your real content",
    description:
      "Generate focused hashtag groups based on your topic and confirmed source—not fake real-time trend claims.",
    cta: "Generate 10 Hashtag Sets — Free",
    accent: "lavender",
    icon: Hash,
    example: "Coastal grandmother summer capsule wardrobe ideas",
  },
};

export function isGeneratorType(value: string): value is GeneratorType {
  return GENERATOR_TYPES.includes(value as GeneratorType);
}

export const GOALS = ["Drive sales", "Get clicks", "Get saves", "Build awareness"] as const;
export type Goal = (typeof GOALS)[number];

export const VIBES = ["Natural", "Modern", "Creative", "Luxury"] as const;
export type Vibe = (typeof VIBES)[number];

export const PRODUCT_ANGLES = [
  "Benefit",
  "Feature",
  "Gift",
  "Seasonal",
  "Problem–solution",
  "Lifestyle",
] as const;

export const ARTICLE_ANGLES = [
  "How-to",
  "Listicle",
  "Curiosity",
  "Common mistake",
  "Quick tip",
  "Beginner guide",
] as const;

export const LANDING_ANGLES = [
  "Outcome",
  "Objection",
  "Quick win",
  "Who it’s for",
  "Transformation",
  "Behind the offer",
] as const;
