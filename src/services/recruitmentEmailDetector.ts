import type {
  GmailMessageMetadata,
  RecruitmentEmailCategory,
  RecruitmentEmailDetection,
} from "../types/emailIntegration";

type DetectorInput = {
  metadata: GmailMessageMetadata;
  bodyText?: string | null;
};

type WeightedPattern = {
  pattern: RegExp;
  weight: number;
};

const PATTERNS: Record<
  Exclude<
    RecruitmentEmailCategory,
    "UNKNOWN"
  >,
  WeightedPattern[]
> = {
  APPLICATION_RECEIVED: [
    {
      pattern:
        /thank you for your application/i,
      weight: 6,
    },
    {
      pattern:
        /we (?:have|'ve) received your application/i,
      weight: 6,
    },
    {
      pattern:
        /application (?:has been )?received/i,
      weight: 6,
    },
    {
      pattern:
        /thank you for applying/i,
      weight: 5,
    },
    {
      pattern:
        /thanks for applying/i,
      weight: 5,
    },
  ],

  ASSESSMENT: [
    {
      pattern:
        /assessment invitation/i,
      weight: 6,
    },
    {
      pattern:
        /online assessment/i,
      weight: 5,
    },
    {
      pattern:
        /complete (?:the |your )?assessment/i,
      weight: 5,
    },
    {
      pattern:
        /coding challenge/i,
      weight: 5,
    },
    {
      pattern:
        /online test/i,
      weight: 4,
    },
  ],

  INTERVIEW: [
    {
      pattern:
        /interview invitation/i,
      weight: 6,
    },
    {
      pattern:
        /invite you to (?:an )?interview/i,
      weight: 6,
    },
    {
      pattern:
        /schedule (?:an |your )?interview/i,
      weight: 5,
    },
    {
      pattern:
        /interview availability/i,
      weight: 5,
    },
    {
      pattern:
        /available (?:times|slots).{0,40}interview/i,
      weight: 4,
    },
  ],

  OFFER: [
    {
      pattern:
        /offer of employment/i,
      weight: 6,
    },
    {
      pattern:
        /pleased to offer you/i,
      weight: 6,
    },
    {
      pattern:
        /employment offer/i,
      weight: 6,
    },
    {
      pattern:
        /job offer/i,
      weight: 5,
    },
  ],

  REJECTION: [
    {
      pattern:
        /not (?:be )?progressing/i,
      weight: 6,
    },
    {
      pattern:
        /not moving forward/i,
      weight: 6,
    },
    {
      pattern:
        /application (?:has been |was )?unsuccessful/i,
      weight: 6,
    },
    {
      pattern:
        /unsuccessful (?:on|with|in) (?:this |your )?application/i,
      weight: 5,
    },
    {
      pattern:
        /decided to proceed with other candidates/i,
      weight: 5,
    },
    {
      pattern:
        /unfortunately.{0,120}(?:not|unsuccessful|other candidates)/i,
      weight: 4,
    },
  ],

  FOLLOW_UP: [
    {
      pattern:
        /next steps/i,
      weight: 3,
    },
    {
      pattern:
        /further information/i,
      weight: 2,
    },
    {
      pattern:
        /we(?:'|’)ll be in touch/i,
      weight: 2,
    },
  ],
};

const RECRUITMENT_HINT =
  /\b(application|applying|candidate|recruitment|recruiter|assessment|interview|offer|unfortunately|unsuccessful|next steps)\b/i;

const CATEGORY_REASON: Record<
  Exclude<
    RecruitmentEmailCategory,
    "UNKNOWN"
  >,
  string
> = {
  APPLICATION_RECEIVED:
    "Application receipt language detected.",
  ASSESSMENT:
    "Assessment or testing language detected.",
  INTERVIEW:
    "Interview invitation language detected.",
  OFFER:
    "Employment offer language detected.",
  REJECTION:
    "Recruitment rejection language detected.",
  FOLLOW_UP:
    "Recruitment follow-up language detected.",
};

function scoreCategory(
  text: string,
  category: Exclude<
    RecruitmentEmailCategory,
    "UNKNOWN"
  >,
): number {
  return PATTERNS[category].reduce(
    (score, weightedPattern) =>
      weightedPattern.pattern.test(text)
        ? score + weightedPattern.weight
        : score,
    0,
  );
}

export function detectRecruitmentEmail({
  metadata,
  bodyText,
}: DetectorInput): RecruitmentEmailDetection {
  const hasBody =
    Boolean(bodyText?.trim());

  const text = [
    metadata.subject,
    metadata.snippet,
    bodyText ?? "",
  ]
    .join("\n")
    .replace(/\s+/g, " ")
    .trim();

  const categories =
    Object.keys(
      PATTERNS,
    ) as Array<
      Exclude<
        RecruitmentEmailCategory,
        "UNKNOWN"
      >
    >;

  const scored = categories
    .map((category) => ({
      category,
      score: scoreCategory(
        text,
        category,
      ),
    }))
    .sort(
      (left, right) =>
        right.score - left.score,
    );

  const best =
    scored[0];

  if (!best || best.score === 0) {
    return {
      category: "UNKNOWN",
      confidence: "LOW",
      score: 0,
      reason:
        "No reliable recruitment pattern detected.",
      requiresBody:
        !hasBody &&
        RECRUITMENT_HINT.test(text),
    };
  }

  if (!hasBody && best.score < 6) {
    return {
      category: best.category,
      confidence: "LOW",
      score: best.score,
      reason:
        "Recruitment language needs more context.",
      requiresBody: true,
    };
  }

  if (best.score >= 6) {
    return {
      category: best.category,
      confidence: "HIGH",
      score: best.score,
      reason:
        CATEGORY_REASON[
          best.category
        ],
      requiresBody: false,
    };
  }

  if (best.score >= 4) {
    return {
      category: best.category,
      confidence: "MEDIUM",
      score: best.score,
      reason:
        CATEGORY_REASON[
          best.category
        ],
      requiresBody: false,
    };
  }

  return {
    category: "UNKNOWN",
    confidence: "LOW",
    score: best.score,
    reason:
      "Recruitment wording remained ambiguous.",
    requiresBody: false,
  };
}