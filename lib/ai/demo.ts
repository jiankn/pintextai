import type { GeneratedItem, GenerationRequest } from "@/lib/ai/schemas";
import type { SourceSnapshot } from "@/lib/source/schemas";

function cleanSubject(value: string) {
  return value.replace(/^https?:\/\//u, "").replace(/\s+/gu, " ").trim().slice(0, 86) || "Your next idea";
}

function titleCase(value: string) {
  return value.replace(/\b\w/gu, (character) => character.toUpperCase());
}

export function createDemoResults(input: GenerationRequest, source?: SourceSnapshot): GeneratedItem[] {
  const subject = cleanSubject(source?.title || input.topic || "Your next idea");
  const keyword = input.keyword || source?.keywords[0] || "";
  const label = titleCase(subject);
  const angles = [
    "Clear benefit", "Quick win", "Fresh perspective", "Practical guide", "Curiosity", "Problem–solution", "Lifestyle", "Beginner-friendly", "Save for later", "Direct action",
  ];
  const titleTemplates = [
    `${label}: A Simple Way to Get Better Results`,
    `The Practical Guide to ${label}`,
    `Try This Fresh Take on ${label}`,
    `${label} Ideas Worth Saving for Later`,
    `What Most People Miss About ${label}`,
    `A Better Approach to ${label}`,
    `${label} for Real, Everyday Life`,
    `New to ${label}? Start Here`,
    `Save These ${label} Ideas for Your Next Project`,
    `Ready for ${label}? See the Details`,
  ];
  const descriptionTemplates = [
    `Discover a clear, practical approach to ${subject}. Explore the key details and save this idea for when you are ready to put it to use.`,
    `Looking for a more useful way to think about ${subject}? This breaks the idea into approachable details you can act on today.`,
    `A fresh take on ${subject}, created for ${input.audience || "people who value practical ideas"}. Read through the details and keep your favorite points close.`,
    `Turn interest in ${subject} into a realistic next step. This overview keeps the focus on what matters and leaves out the noise.`,
    `Planning around ${subject}? Start with the essentials, compare the useful details, and save this Pin for your next session.`,
    `If ${subject} has felt complicated, this is the simpler path. Get the important context and decide what fits your goals.`,
    `${subject} can feel more approachable with the right angle. Use these practical details as a starting point for your own plan.`,
    `A beginner-friendly look at ${subject}, with clear ideas you can revisit whenever you need a little direction.`,
    `Save this guide to ${subject} for later. It is designed to help you move from inspiration to a concrete next step.`,
    `Explore ${subject} with a clear goal in mind. Review the useful details, choose what fits, and take the next step when you are ready.`,
  ];
  const captionTemplates = [
    `${label}, made easier to understand and use. Save this for your next planning session.`,
    `A practical new angle on ${subject}—without the extra noise.`,
    `Keep this ${subject} idea close for the moment you need it.`,
    `Simple details. Clear next steps. A better way into ${subject}.`,
    `Curious about ${subject}? Start with what matters most.`,
    `When ${subject} feels complicated, come back to this simpler approach.`,
    `${label} inspiration for real life, not just the mood board.`,
    `New to ${subject}? This is a friendly place to begin.`,
    `Save now, revisit later, and make ${subject} work for you.`,
    `Ready to explore ${subject}? Take a closer look.`,
  ];
  const baseTags = [
    keyword, ...subject.toLowerCase().replace(/[^a-z0-9\s]/gu, "").split(/\s+/u).filter((word) => word.length > 3), "pinterestideas", "contentinspiration", "creativebusiness",
  ].filter(Boolean);

  return angles.map((angle, index) => {
    let text: string;
    if (input.type === "description") text = descriptionTemplates[index];
    else if (input.type === "caption") text = captionTemplates[index];
    else if (input.type === "hashtag") {
      const rotated = [...baseTags.slice(index % Math.max(baseTags.length, 1)), ...baseTags.slice(0, index % Math.max(baseTags.length, 1))];
      const angleTag = angle.replace(/[^a-z0-9]/giu, "").toLowerCase();
      text = [...new Set([angleTag, ...rotated])].slice(0, 7).map((tag) => `#${tag.replace(/[^a-z0-9]/giu, "")}`).join(" ");
    } else text = titleTemplates[index];
    return { text, keyword, angle };
  });
}
