import { useState } from "react";
import { Dialog, Button, Flex } from "@radix-ui/themes";
import styled from "styled-components";
import { Import } from "lucide-react";
import type { Poll } from "@/types/jocasta";
import { useTagContext } from "@/contexts/TagContext";
import { toast } from "sonner";
import { createLogger } from "@/utils";

const logger = createLogger("ImportFromClipboardButton");

const DialogContent = styled(Dialog.Content)`
  max-width: 600px;
`;

const NewPollButtonContainer = styled(Button)`
  align-items: center;
  cursor: pointer;
  height: 100%;
  justify-content: center;
  padding-block: 1rem;
  padding-inline: 1rem;
  transition: box-shadow 0.2s ease-in-out;
`;

const NewPollButtonImport = styled(NewPollButtonContainer)`
  flex: 0 0 auto;
`;

export default function ImportFromClipboardButton({
  onImported,
  onParsed,
}: {
  onImported?: (data: string) => void;
  onParsed?: (polls: Array<Partial<Poll>>) => void;
}) {
  const { tags } = useTagContext();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    setLoading(true);
    try {
      const text = await navigator.clipboard.readText();
      onImported?.(text);
      try {
        const { polls, errors } = parsePollsFromClipboard(text, tags);
        if (errors.length) {
          toast.error(`Parse errors: ${errors.join("; ")}`);
        } else {
          // success: close dialog and notify parent with parsed polls
          setOpen(false);
          onParsed?.(polls);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(msg);
      }
    } catch {
      // Clipboard API may be unavailable or denied; store empty string
      onImported?.("");
      const msg = "Clipboard read failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <NewPollButtonImport
        variant="surface"
        size="3"
        onClick={() => setOpen(true)}
      >
        <Import />
      </NewPollButtonImport>

      <DialogContent maxWidth="550px">
        <Dialog.Title>Import polls from clipboard</Dialog.Title>
        <Dialog.Description>
          Import poll data that you have copied to your clipboard.
        </Dialog.Description>

        <Flex gap="2" style={{ marginTop: "1rem" }}>
          <Button
            variant="surface"
            color="green"
            onClick={handleImport}
            disabled={loading}
          >
            {loading ? "Reading…" : "Import from clipboard"}
          </Button>

          <Button variant="surface" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </Flex>
      </DialogContent>
    </Dialog.Root>
  );
}

// Parser for clipboard poll data. Returns parsed polls and an array of error messages.
export function parsePollsFromClipboard(
  input: string,
  knownTags?: Record<number, unknown>,
): {
  polls: Array<Partial<Poll>>;
  errors: string[];
} {
  const errors: string[] = [];

  if (!input || !input.trim()) return { polls: [], errors };

  // helper: normalize strings coming from Google Sheets copy/paste
  // - strip surrounding double-quotes if present
  // - replace repeated double-quotes "" with a single double-quote
  function normalizeString(s: string): string {
    // strip surrounding quotes (only if both ends are ")
    if (s.length >= 2 && s.startsWith('"') && s.endsWith('"')) {
      s = s.slice(1, -1);
    }
    // replace double double-quotes with single quote
    // e.g. She said ""Hello"" -> She said "Hello"
    s = s.replace(/""/g, '"');
    return s;
  }

  // Try to parse as JSON array or single object
  let raw: unknown;
  let initialParseError: unknown;
  try {
    // Prefer parsing the raw input first to avoid over-normalizing valid JSON.
    raw = JSON.parse(input);
  } catch (err) {
    initialParseError = err;
    try {
      raw = JSON.parse(normalizeString(input));
    } catch {
      // Try to parse as newline-delimited JSON objects.
      // If a line parses to an array, spread it so we do not produce nested arrays.
      const lines = input
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length === 0) return { polls: [], errors };

      const parsedLines: unknown[] = [];
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (Array.isArray(parsed)) {
            parsedLines.push(...parsed);
          } else {
            parsedLines.push(parsed);
          }
        } catch {
          const message =
            initialParseError instanceof Error
              ? initialParseError.message
              : "invalid JSON";
          throw new Error(`invalid JSON: ${message}`);
        }
      }
      raw = parsedLines;
    }
  }

  logger.debug("Parsed raw clipboard data:", raw);

  const candidates: unknown[] = (Array.isArray(raw) ? raw : [raw]).flatMap(
    (item) => (Array.isArray(item) ? item : [item]),
  );

  const polls: Array<Partial<Poll>> = [];

  candidates.forEach((c, idx) => {
    if (!c || typeof c !== "object") {
      errors.push(`item ${idx + 1}: not an object`);
      return;
    }
    const obj = c as Record<string, unknown>;

    // question (optional string)
    const question =
      obj.question == null
        ? undefined
        : typeof obj.question === "string"
          ? obj.question
          : String(obj.question);

    // guild_id (optional bigint or number/string)
    let guild_id: bigint | undefined = undefined;
    if (obj.guild_id != null) {
      if (typeof obj.guild_id === "bigint") guild_id = obj.guild_id as bigint;
      else if (typeof obj.guild_id === "number")
        guild_id = BigInt(obj.guild_id as number);
      else if (typeof obj.guild_id === "string") {
        const s = (obj.guild_id as string).trim();
        if (s !== "") {
          try {
            guild_id = BigInt(s);
          } catch {
            errors.push(`item ${idx + 1}: guild_id invalid`);
          }
        }
      } else {
        errors.push(`item ${idx + 1}: guild_id invalid`);
      }
    }

    // choices (optional string[])
    let choices: string[] | undefined = undefined;
    if (Array.isArray(obj.choices)) {
      const c = (obj.choices as unknown[])
        .map((v) => String(v ?? ""))
        .filter(Boolean);
      if (c.length > 0) choices = c;
    } else if (typeof obj.choices === "string") {
      // perhaps a comma-separated list
      const c = (obj.choices as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (c.length > 0) choices = c;
    }

    // time (optional ISO string or Date)
    let time: Date | undefined = undefined;
    if (obj.time != null) {
      if (typeof obj.time === "string") {
        const d = new Date(obj.time);
        if (!isNaN(d.getTime())) time = d;
        else errors.push(`item ${idx + 1}: invalid time`);
      } else if (typeof obj.time === "number") {
        const d = new Date(obj.time);
        if (!isNaN(d.getTime())) time = d;
        else errors.push(`item ${idx + 1}: invalid time`);
      } else if (obj.time instanceof Date) {
        time = obj.time as Date;
      } else {
        errors.push(`item ${idx + 1}: invalid time`);
      }
    }

    // tag (optional number)
    let tag: number | undefined = undefined;
    if (obj.tag != null) {
      const n = Number(obj.tag as unknown);
      if (!Number.isNaN(n)) {
        // validate against known tags if provided
        if (!knownTags || Object.prototype.hasOwnProperty.call(knownTags, n)) {
          tag = n;
        } else {
          // tag id doesn't match known tags -> null it (leave undefined)
          tag = undefined;
        }
      } else errors.push(`item ${idx + 1}: invalid tag`);
    }

    // image, description, thread_question (optional strings)
    const image = obj.image != null ? String(obj.image) : undefined;
    const description =
      obj.description != null ? String(obj.description) : undefined;
    const thread_question =
      obj.thread_question != null ? String(obj.thread_question) : undefined;

    // accept item even if some fields are missing; only skip if it's not an object
    const item: Partial<Poll> = {
      question,
      guild_id: guild_id as unknown as Poll["guild_id"],
      choices: choices as unknown as Poll["choices"],
      time: time,
      tag: tag as unknown as Poll["tag"],
      image: image as unknown as Poll["image"],
      description: description as unknown as Poll["description"],
      thread_question: thread_question as unknown as Poll["thread_question"],
    };
    polls.push(item);
  });

  return { polls, errors };
}

// [{
//   "question": string?,
//   "guild_id": bigint?,
//   "choices": string[]?,
//   "time": Date?, // like "2025-09-20T12:00:00Z"
//   "tag": number,
//   "image": string?,
//   "description": string?,
//   "thread_question": string?,
// }, {...}]
