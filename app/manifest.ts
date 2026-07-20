import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PinTextAI",
    short_name: "PinTextAI",
    description: "A source-first AI writing workspace for Pinterest creators.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF8F4",
    theme_color: "#C51F3A",
    categories: ["productivity", "business"],
  };
}
