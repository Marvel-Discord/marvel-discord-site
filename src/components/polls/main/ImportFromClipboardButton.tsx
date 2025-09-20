import { useState } from "react";
import { Dialog, Button, Text, Flex } from "@radix-ui/themes";
import styled from "styled-components";
import { Import } from "lucide-react";
import type { Poll } from "@jocasta-polls-api";
import { toast } from "sonner";

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
  const [open, setOpen] = useState(false);
  const [clipboardData, setClipboardData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<Array<Partial<Poll>> | null>(null);
  const [parseErrors, setParseErrors] = useState<string[] | null>(null);

  const handleImport = async () => {
    setLoading(true);
    try {
      const text = await navigator.clipboard.readText();
      setClipboardData(text);
      onImported?.(text);
      try {
        const { polls, errors } = parsePollsFromClipboard(text);
        setParsed(polls.length ? polls : []);
        setParseErrors(errors.length ? errors : []);
        if (errors.length) {
          toast.error(`Parse errors: ${errors.join("; ")}`);
        } else {
          // success: close dialog and notify parent with parsed polls
          setOpen(false);
          onParsed?.(polls);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setParsed([]);
        setParseErrors([msg]);
        toast.error(msg);
      }
    } catch {
      // Clipboard API may be unavailable or denied; store empty string
      setClipboardData("");
      onImported?.("");
      setParsed([]);
      const msg = "Clipboard read failed";
      setParseErrors([msg]);
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

        {clipboardData !== null && (
          <div style={{ marginTop: "1rem" }}>
            <Text as="div" size="2">
              Stored clipboard contents (preview):
            </Text>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                maxHeight: 200,
                overflow: "auto",
              }}
            >
              {clipboardData}
            </pre>
          </div>
        )}

        {parsed !== null && (
          <div style={{ marginTop: "1rem" }}>
            <Text as="div" size="2">
              Parsed polls:
            </Text>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                maxHeight: 200,
                overflow: "auto",
              }}
            >
              {JSON.stringify(
                parsed,
                (_key, value) =>
                  typeof value === "bigint" ? value.toString() : value,
                2
              )}
            </pre>
          </div>
        )}

        {parseErrors !== null && parseErrors.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <Text as="div" size="2">
              Parse errors:
            </Text>
            <ul>
              {parseErrors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog.Root>
  );
}

// Parser for clipboard poll data. Returns parsed polls and an array of error messages.
export function parsePollsFromClipboard(input: string): {
  polls: Array<Partial<Poll>>;
  errors: string[];
} {
  const errors: string[] = [];
  if (!input || !input.trim()) return { polls: [], errors };

  // Try to parse as JSON array or single object
  let raw: unknown;
  try {
    raw = JSON.parse(input);
  } catch {
    // Try to parse as newline-delimited JSON objects
    const lines = input
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return { polls: [], errors };

    const parsedLines: unknown[] = [];
    for (const line of lines) {
      try {
        parsedLines.push(JSON.parse(line));
      } catch {
        throw new Error(`invalid JSON`);
      }
    }
    raw = parsedLines;
  }

  const candidates: unknown[] = Array.isArray(raw) ? raw : [raw];

  const polls: Array<Partial<Poll>> = [];

  candidates.forEach((c, idx) => {
    if (!c || typeof c !== "object") {
      errors.push(`item ${idx + 1}: not an object`);
      return;
    }
    const obj = c as Record<string, unknown>;

    // question (required string)
    const question =
      typeof obj.question === "string"
        ? obj.question
        : String(obj.question ?? "");
    if (!question) errors.push(`item ${idx + 1}: missing question`);

    // guild_id (required bigint or number/string)
    let guild_id: bigint | null = null;
    if (typeof obj.guild_id === "bigint") guild_id = obj.guild_id as bigint;
    else if (typeof obj.guild_id === "number")
      guild_id = BigInt(obj.guild_id as number);
    else if (typeof obj.guild_id === "string" && obj.guild_id.trim() !== "") {
      try {
        guild_id = BigInt(obj.guild_id as string);
      } catch {
        errors.push(`item ${idx + 1}: guild_id invalid`);
      }
    } else {
      errors.push(`item ${idx + 1}: missing guild_id`);
    }

    // choices (required string[])
    let choices: string[] = [];
    if (Array.isArray(obj.choices)) {
      choices = (obj.choices as unknown[])
        .map((v) => String(v ?? ""))
        .filter(Boolean);
      if (choices.length === 0) errors.push(`item ${idx + 1}: choices empty`);
    } else if (typeof obj.choices === "string") {
      // perhaps a comma-separated list
      choices = (obj.choices as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (choices.length === 0) errors.push(`item ${idx + 1}: choices empty`);
    } else {
      errors.push(`item ${idx + 1}: missing choices`);
    }

    // time (optional ISO string or Date)
    let time: Date | null = null;
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
    let tag: number | null = null;
    if (obj.tag != null) {
      const n = Number(obj.tag as unknown);
      if (!Number.isNaN(n)) tag = n;
      else errors.push(`item ${idx + 1}: invalid tag`);
    }

    // image, description, thread_question (optional strings)
    const image = obj.image != null ? String(obj.image) : null;
    const description =
      obj.description != null ? String(obj.description) : null;
    const thread_question =
      obj.thread_question != null ? String(obj.thread_question) : null;

    if (guild_id !== null && question) {
      const item: Partial<Poll> = {
        question,
        guild_id: guild_id as unknown as Poll["guild_id"],
        choices,
        time: time ?? null,
        tag: tag ?? undefined,
        image: image ?? null,
        description: description ?? null,
        thread_question: thread_question ?? null,
      };
      polls.push(item);
    }
  });

  return { polls, errors };
}

// [{
//   "question": string,
//   "guild_id": bigint,
//   "choices": string[],
//   "time": Date?, // like "2025-09-20T12:00:00Z"
//   "tag": number,
//   "image": string?,
//   "description": string?,
//   "thread_question": string?,
// }, {...}]
