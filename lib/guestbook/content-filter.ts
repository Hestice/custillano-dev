const URL_PATTERN =
  /https?:\/\/|www\.|\.com\b|\.net\b|\.org\b|\.io\b|\.xyz\b|\.ru\b|\.cn\b|\[url\]/i;

const EXCESSIVE_CAPS_PATTERN = /[A-Z]{20,}/;

const REPEATED_CHARS_PATTERN = /(.)\1{5,}/;

const SPAM_KEYWORDS = [
  "buy now",
  "cheap",
  "casino",
  "viagra",
  "crypto",
  "forex",
  "earn money",
  "make money",
  "free money",
  "click here",
  "act now",
  "limited time",
  "work from home",
  "weight loss",
  "order now",
  "subscribe",
  "unsubscribe",
  "SEO",
  "backlink",
];

const SPAM_KEYWORD_PATTERN = new RegExp(
  SPAM_KEYWORDS.map((kw) => kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(
    "|"
  ),
  "i"
);

export function filterContent(
  name: string,
  message: string
): { blocked: boolean; reason?: string } {
  if (URL_PATTERN.test(name)) {
    return { blocked: true, reason: "Names cannot contain URLs or links." };
  }

  if (URL_PATTERN.test(message)) {
    return { blocked: true, reason: "Messages cannot contain URLs or links." };
  }

  if (EXCESSIVE_CAPS_PATTERN.test(message)) {
    return {
      blocked: true,
      reason: "Please avoid excessive use of capital letters.",
    };
  }

  if (REPEATED_CHARS_PATTERN.test(name) || REPEATED_CHARS_PATTERN.test(message)) {
    return {
      blocked: true,
      reason: "Please avoid repeating characters excessively.",
    };
  }

  if (SPAM_KEYWORD_PATTERN.test(message)) {
    return {
      blocked: true,
      reason:
        "Your message was flagged as potential spam. Please rephrase and try again.",
    };
  }

  return { blocked: false };
}
