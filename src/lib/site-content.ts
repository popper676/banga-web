/**
 * Website content contract.
 *
 * This is mock data for the UI prototype. When Supabase is connected, keep
 * these keys and replace the values with rows from `site_content` and
 * `site_media`. The website and the admin editor can then share one contract.
 */
export const SITE_CONTENT = {
  navigation: [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
    { href: "/story", label: "Our Story" },
    { href: "/locations", label: "Locations" },
  ],
  story: {
    eyebrow: "Korean comfort, made playful",
    title: "TRADITION MEETS TODAY.",
    intro:
      "A Korean couple brought the flavours they missed to Subang Jaya—and built a place where everyone can eat, meet and make memories.",
    originTitle: "NICE TO MEET YOU. NOW, LET’S EAT.",
    originBody:
      "Bang Ga Bang Ga means “nice to meet you.” It is the welcome behind every tray: bold Korean flavour, boneless chicken and complete meals made for everyday dining.",
    promiseTitle: "GOOD FOOD. EASY MOMENTS.",
    promiseBody:
      "Muslim-friendly choices, sauces made in-house and individual sets under RM20.",
    photoBoothTitle: "EAT. SNAP. REMEMBER.",
    photoBoothBody:
      "The photo booth is an in-store experience at our outlets—not an online product. Finish your meal, take a strip and make the visit last.",
  },
  media: {
    storyHero: {
      src: "/images/brand/story-hero.jpg",
      alt: "BANG GA BANG GA restaurant atmosphere",
      status: "placeholder" as const,
    },
    founders: {
      src: "/images/brand/founders.jpg",
      alt: "BANG GA BANG GA founders at the restaurant",
      status: "placeholder" as const,
    },
    restaurant: {
      src: "/images/brand/restaurant.jpg",
      alt: "Customers dining at BANG GA BANG GA",
      status: "placeholder" as const,
    },
    photoBoothLogo: {
      src: "/images/brand/references/bgbg-photo-booth-logo.png",
      alt: "BGBG Beyond Photo Booth logo",
      status: "reference" as const,
    },
    menuArtwork: {
      src: "/images/brand/references/dak-gang-jeong-menu.png",
      alt: "BANG GA BANG GA Dak Gang Jeong menu artwork",
      status: "reference" as const,
    },
  },
} as const;

export const SUPABASE_CONTENT_MODEL = [
  { table: "site_content", purpose: "Headings, descriptions, buttons and navigation labels" },
  { table: "site_media", purpose: "Image URL, alt text, crop position and publishing status" },
  { table: "site_sections", purpose: "Section order, visibility and page assignment" },
  { table: "site_revisions", purpose: "Draft history, published version and audit trail" },
] as const;
