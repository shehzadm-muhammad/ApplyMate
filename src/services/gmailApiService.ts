import type {
  GmailMessageMetadata,
  GmailMessageReference,
} from "../types/emailIntegration";

const GMAIL_API_BASE =
  "https://gmail.googleapis.com/gmail/v1/users/me";

const FIRST_SYNC_LOOKBACK_MS =
  90 * 24 * 60 * 60 * 1000;

const SYNC_OVERLAP_MS =
  2 * 24 * 60 * 60 * 1000;

const RESULTS_PER_SEARCH = 12;
const MAX_CANDIDATE_MESSAGES = 60;

const MAX_ENCODED_BODY_LENGTH = 120_000;
const MAX_BODY_TEXT_LENGTH = 20_000;

const RECRUITMENT_SEARCH_TERMS = [
  "application",
  "\"thank you for applying\"",
  "interview",
  "assessment",
  "\"online test\"",
  "\"coding challenge\"",
  "\"job offer\"",
  "unfortunately",
  "unsuccessful",
  "recruitment",
] as const;

type GmailListResponse = {
  messages?: Array<{
    id: string;
    threadId: string;
  }>;
  resultSizeEstimate?: number;
};

type GmailHeader = {
  name: string;
  value: string;
};

type GmailMessagePart = {
  mimeType?: string;
  filename?: string;
  headers?: GmailHeader[];
  body?: {
    data?: string;
    attachmentId?: string;
  };
  parts?: GmailMessagePart[];
};

type GmailMessageResponse = {
  id: string;
  threadId: string;
  internalDate?: string;
  snippet?: string;
  payload?: GmailMessagePart;
};

export class GmailApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly reason: string,
    message: string,
  ) {
    super(message);
    this.name = "GmailApiError";
  }
}

async function fetchGmailJson<T>(
  url: string,
  accessToken: string,
  emptySuccessValue?: T,
): Promise<T> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 20_000);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal: controller.signal,
    });

    /*
     * Read the body exactly once as text.
     *
     * React Native's response.json() throws a raw
     * SyntaxError when a successful response body is
     * unexpectedly empty/truncated. Converting it here
     * lets ApplyMate fail safely with a GmailApiError
     * instead of leaking a generic JSON parser error.
     */
    const responseText =
      await response.text();

    if (!response.ok) {
      let reason = "unknown";

      if (responseText.trim()) {
        try {
          const errorPayload =
            JSON.parse(responseText) as {
              error?: {
                status?: string;
                errors?: Array<{
                  reason?: string;
                }>;
              };
            };

          reason =
            errorPayload.error?.errors?.find(
              (item) =>
                typeof item.reason === "string",
            )?.reason ??
            errorPayload.error?.status ??
            "unknown";
        } catch {
          // Keep only the generic machine-readable reason.
        }
      }

      throw new GmailApiError(
        response.status,
        reason,
        "Gmail API request failed.",
      );
    }

    if (!responseText.trim()) {
      if (
        response.status === 204 &&
        emptySuccessValue !== undefined
      ) {
        return emptySuccessValue;
      }

      throw new GmailApiError(
        response.status,
        "emptyResponse",
        "Gmail API returned an empty response.",
      );
    }

    try {
      return JSON.parse(
        responseText,
      ) as T;
    } catch {
      throw new GmailApiError(
        response.status,
        "invalidJson",
        "Gmail API returned an invalid JSON response.",
      );
    }
  } finally {
    clearTimeout(timeout);
  }
}

function buildSearchAfterEpoch(
  lastSyncAt: string | null,
): number {
  const now = Date.now();
  const firstSyncBoundary =
    now - FIRST_SYNC_LOOKBACK_MS;

  if (!lastSyncAt) {
    return Math.floor(
      firstSyncBoundary / 1000,
    );
  }

  const parsedLastSync =
    Date.parse(lastSyncAt);

  if (Number.isNaN(parsedLastSync)) {
    return Math.floor(
      firstSyncBoundary / 1000,
    );
  }

  const incrementalBoundary =
    parsedLastSync - SYNC_OVERLAP_MS;

  return Math.floor(
    Math.max(
      firstSyncBoundary,
      incrementalBoundary,
    ) / 1000,
  );
}

function buildSearchQuery(
  term: string,
  lastSyncAt: string | null,
): string {
  const after =
    buildSearchAfterEpoch(lastSyncAt);

  return [
    `after:${after}`,
    "-in:sent",
    "-in:drafts",
    "-in:spam",
    "-in:trash",
    term,
  ].join(" ");
}

export async function listRecruitmentMessageIds(
  accessToken: string,
  lastSyncAt: string | null,
): Promise<GmailMessageReference[]> {
  const messages =
    new Map<string, GmailMessageReference>();

  for (const term of RECRUITMENT_SEARCH_TERMS) {
    if (
      messages.size >=
      MAX_CANDIDATE_MESSAGES
    ) {
      break;
    }

    const params =
      new URLSearchParams({
        q: buildSearchQuery(
          term,
          lastSyncAt,
        ),
        maxResults:
          RESULTS_PER_SEARCH.toString(),
        fields:
          "messages(id,threadId),resultSizeEstimate",
      });

    const response =
      await fetchGmailJson<GmailListResponse>(
        `${GMAIL_API_BASE}/messages?${params.toString()}`,
        accessToken,
        {
          messages: [],
          resultSizeEstimate: 0,
        },
      );

    for (const message of response.messages ?? []) {
      if (
        messages.size >=
        MAX_CANDIDATE_MESSAGES
      ) {
        break;
      }

      messages.set(message.id, {
        providerMessageId: message.id,
        providerThreadId: message.threadId,
      });
    }
  }

  return [...messages.values()];
}

function getHeader(
  headers: GmailHeader[] | undefined,
  name: string,
): string {
  return (
    headers?.find(
      (header) =>
        header.name.toLowerCase() ===
        name.toLowerCase(),
    )?.value ?? ""
  );
}

function resolveReceivedAt(
  internalDate: string | undefined,
  dateHeader: string,
): string {
  if (internalDate) {
    const numericDate =
      Number(internalDate);

    if (
      Number.isFinite(numericDate) &&
      numericDate > 0
    ) {
      return new Date(
        numericDate,
      ).toISOString();
    }
  }

  const parsedHeaderDate =
    Date.parse(dateHeader);

  if (!Number.isNaN(parsedHeaderDate)) {
    return new Date(
      parsedHeaderDate,
    ).toISOString();
  }

  return new Date(0).toISOString();
}

export async function getGmailMessageMetadata(
  accessToken: string,
  providerMessageId: string,
): Promise<GmailMessageMetadata> {
  const params = new URLSearchParams();

  params.set("format", "metadata");
  params.append("metadataHeaders", "From");
  params.append("metadataHeaders", "Subject");
  params.append("metadataHeaders", "Date");
  params.set(
    "fields",
    "id,threadId,internalDate,snippet,payload(headers)",
  );

  const response =
    await fetchGmailJson<GmailMessageResponse>(
      `${GMAIL_API_BASE}/messages/${encodeURIComponent(
        providerMessageId,
      )}?${params.toString()}`,
      accessToken,
    );

  const headers =
    response.payload?.headers;

  const dateHeader =
    getHeader(headers, "Date");

  return {
    providerMessageId: response.id,
    providerThreadId:
      response.threadId,
    receivedAt: resolveReceivedAt(
      response.internalDate,
      dateHeader,
    ),
    sender: getHeader(
      headers,
      "From",
    ).trim(),
    subject: getHeader(
      headers,
      "Subject",
    ).trim(),
    snippet:
      response.snippet?.trim() ?? "",
  };
}

function decodeBase64Url(
  encoded: string,
): string {
  let limited = encoded.slice(
    0,
    MAX_ENCODED_BODY_LENGTH,
  );

  const remainder =
    limited.length % 4;

  if (remainder !== 0) {
    limited = limited.slice(
      0,
      limited.length - remainder,
    );
  }

  const normalized = limited
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const decoder = (
    globalThis as typeof globalThis & {
      atob?: (value: string) => string;
    }
  ).atob;

  if (!decoder) {
    return "";
  }

  const binary =
    decoder(normalized);

  let percentEncoded = "";

  for (
    let index = 0;
    index < binary.length;
    index += 1
  ) {
    percentEncoded += `%${binary
      .charCodeAt(index)
      .toString(16)
      .padStart(2, "0")}`;
  }

  try {
    return decodeURIComponent(
      percentEncoded,
    );
  } catch {
    return binary;
  }
}

function stripHtml(
  html: string,
): string {
  return html
    .replace(
      /<(script|style)[^>]*>[\s\S]*?<\/\1>/gi,
      " ",
    )
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function collectTextParts(
  part: GmailMessagePart | undefined,
  plainText: string[],
  htmlText: string[],
): void {
  if (!part) {
    return;
  }

  /*
   * Never process a MIME part with a filename.
   * That keeps attachments outside this feature.
   */
  if (part.filename?.trim()) {
    return;
  }

  const data =
    part.body?.data;

  if (data) {
    if (
      part.mimeType === "text/plain"
    ) {
      plainText.push(
        decodeBase64Url(data),
      );
    } else if (
      part.mimeType === "text/html"
    ) {
      htmlText.push(
        stripHtml(
          decodeBase64Url(data),
        ),
      );
    }
  }

  for (const child of part.parts ?? []) {
    collectTextParts(
      child,
      plainText,
      htmlText,
    );
  }
}

export async function getGmailMessageTextBody(
  accessToken: string,
  providerMessageId: string,
): Promise<string> {
  /*
   * FULL is used only after metadata classification
   * decides more context is required.
   *
   * RAW is never requested and attachment content is
   * never fetched through users.messages.attachments.
   */
  const response =
    await fetchGmailJson<GmailMessageResponse>(
      `${GMAIL_API_BASE}/messages/${encodeURIComponent(
        providerMessageId,
      )}?format=full`,
      accessToken,
    );

  const plainText: string[] = [];
  const htmlText: string[] = [];

  collectTextParts(
    response.payload,
    plainText,
    htmlText,
  );

  const text =
    plainText.length > 0
      ? plainText.join("\n")
      : htmlText.join("\n");

  return text
    .replace(/\s+/g, " ")
    .trim()
    .slice(
      0,
      MAX_BODY_TEXT_LENGTH,
    );
}