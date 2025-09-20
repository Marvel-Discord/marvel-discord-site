import type { Poll, PollInfo, Tag } from "@jocasta-polls-api";
import {
  Container,
  Flex,
  Heading,
  Skeleton,
  TextField,
  Button,
  Tooltip,
} from "@radix-ui/themes";
import ImportFromClipboardButton from "./ImportFromClipboardButton";
import styled from "styled-components";
import { Choices, ChoicesSkeleton } from "../forms/choices";
import { PollControls } from "../forms/choices/PollControls";
import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import {
  PollCardHeader,
  PollCardHeaderSkeleton,
  MarkdownDescription,
} from "../ui";
import { useAuthContext } from "@/contexts/AuthProvider";
import { useIsMobile } from "@/utils/isMobile";
import {
  cleanUrlSafeString,
  extractDescriptionWithRegex,
  filterDescriptionWithRegex,
  trimRunningStringMultiLine,
  trimRunningStringSingleLine,
} from "@/utils";
import { AutoGrowingTextAreaStyled } from "../forms/autoGrowingRadixTextArea";
import { Image, ImageOff, MessageSquarePlus, Trash2, Undo } from "lucide-react";
import { EditState } from "@/types/states";

const CardBox = styled(Flex)<{ $color?: string; $state?: EditState }>`
  background-color: var(--gray-a3);
  border-radius: var(--radius-3);
  padding: 1.5rem;
  transition: box-shadow 0.2s ease-in-out, outline 0.2s ease-in-out,
    opacity 0.2s ease-in-out;
  width: 100%;

  ${({ $color, $state }) => {
    const isEdited = $state === EditState.UPDATE || $state === EditState.CREATE;
    const isDeleted = $state === EditState.DELETE;
    const outlineStyle = isDeleted ? "dotted" : isEdited ? "dashed" : "solid";
    const outlineColor = $color
      ? `rgba(${$color}, ${isDeleted || isEdited ? "1" : "0"})`
      : isEdited || isDeleted
      ? "var(--red-9)"
      : "rgba(234, 35, 40, 0)";
    const opacity = isDeleted ? "0.75" : "1";

    return `
      outline: 0.2rem ${outlineStyle} ${outlineColor};
      opacity: ${opacity};
    `;
  }}

  &:hover {
    ${({ $color, $state }) => {
      const isEdited =
        $state === EditState.UPDATE || $state === EditState.CREATE;
      const isDeleted = $state === EditState.DELETE;

      const outlineStyle = isDeleted ? "dotted" : isEdited ? "dashed" : "solid";
      const shadowOpacity = isDeleted ? "0.2" : "0.1";

      const hoverColor = $color ?? "234, 35, 40";

      return `
        box-shadow: 0 0 3rem rgba(${hoverColor}, ${shadowOpacity});
        outline: 0.2rem ${outlineStyle} rgba(${hoverColor}, 1);
      `;
    }}
  }
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

const NewPollButtonManual = styled(NewPollButtonContainer)`
  flex: 1;
`;

// NewPollButtonImport removed — Import button replaced by ImportFromClipboardButton component

const NewPollButtonWrapper = styled(Flex)`
  width: 100%;
`;

const PollImage = styled.img`
  height: auto;
  max-width: 100%;
  object-fit: cover;
  width: 100%;
`;

const PollImageSkeleton = styled(Skeleton)`
  aspect-ratio: 50 / 21;
  border-radius: var(--radius-5);
  display: block;
  height: auto;
  min-height: 0;
  object-fit: cover;
  width: 100%;
`;

const ImageContainer = styled(Container)`
  max-width: var(--container-3);
  width: 100%;
`;

const CardTitleBlock = styled(Flex)`
  width: 100%;
`;

const Question = styled(Heading).attrs<{ $isMobile: boolean }>(
  ({ $isMobile }) => ({
    size: $isMobile ? "5" : "7",
    weight: "medium",
    align: "left",
  })
)``;

const QuestionEditable = styled(AutoGrowingTextAreaStyled)<{
  $isMobile: boolean;
}>`
  flex: 1;

  ${({ $isMobile }) =>
    `
      min-height: var(${
        $isMobile ? "--heading-line-height-5" : "--heading-line-height-7"
      });
    `}

  > textarea {
    font-weight: var(--font-weight-medium);

    ${({ $isMobile }) => `
      font-size: var(${$isMobile ? "--font-size-5" : "--font-size-7"});
      letter-spacing: calc(var(${
        $isMobile ? "--letter-spacing-5" : "--letter-spacing-7"
      }) + var(--heading-letter-spacing));
      `}
`;

const DescriptionEditable = styled(AutoGrowingTextAreaStyled)`
  min-height: var(--line-height-2);

  > textarea {
    letter-spacing: 0.02rem;
  }
`;

const ImageUrlInput = styled(TextField.Root)`
  min-width: 50%;
  background-color: var(--gray-a2);
`;

export function PollCard({
  poll,
  tag,
  guild,
  userVote,
  setUserVote,
  editable = false,
  updatePoll,
}: {
  poll: Poll;
  tag?: Tag;
  guild: PollInfo;
  userVote?: number;
  setUserVote?: (vote: number | undefined) => void;
  editable?: boolean;
  updatePoll?: (poll: Poll, state: EditState) => void;
}) {
  const { user } = useAuthContext();
  const isMobile = useIsMobile();
  const [votes, setVotes] = useState(poll.votes || []);

  // Keep votes state in sync with poll changes
  useEffect(() => {
    setVotes(poll.votes || []);
  }, [poll.votes]);

  // Update showVotes when userVote changes
  useEffect(() => {
    if (!editable) {
      setShowVotes((userVote !== undefined || !user) && poll.show_voting);
    }
  }, [userVote, user, poll.show_voting, editable]);

  const originalPoll = useRef(poll);
  const originalTag = useRef(tag);
  const [isEdited, setIsEdited] = useState(false);
  // TODO: doesn't disappear and reload when search query changes

  const [questionText, setQuestionText] = useState(poll.question);
  const [descriptionText, setDescriptionText] = useState(
    filterDescriptionWithRegex(poll.description) || ""
  );
  const [descriptionAdditionalText, setDescriptionAdditionalText] = useState(
    extractDescriptionWithRegex(poll.description) || ""
  );
  const [imageUrl, setImageUrl] = useState(poll.image || "");
  const [imageError, setImageError] = useState(false);
  const [currentTag, setCurrentTag] = useState(tag);
  const [choices, setChoices] = useState(poll.choices);
  const [dateTime, setDateTime] = useState(poll.time);
  const [willDelete, setWillDelete] = useState(false);
  const [threadQuestion, setThreadQuestion] = useState(
    poll.thread_question || ""
  );
  const [showVotes, setShowVotes] = useState(
    editable
      ? poll.show_voting
      : (userVote !== undefined || !user) && poll.show_voting
  );

  const filteredDescription = filterDescriptionWithRegex(poll.description);

  const state = useMemo(() => {
    return willDelete
      ? EditState.DELETE
      : poll.id < 0
      ? EditState.CREATE
      : isEdited
      ? EditState.UPDATE
      : EditState.NONE;
  }, [willDelete, isEdited, poll.id]);

  const questionRef = useRef(questionText);
  const descriptionRef = useRef(descriptionText);
  const descriptionAdditionalRef = useRef(descriptionAdditionalText);
  const imageUrlRef = useRef(imageUrl);
  const tagRef = useRef(currentTag);
  const choicesRef = useRef(choices);
  const dateTimeRef = useRef(dateTime);
  const threadQuestionRef = useRef(threadQuestion);
  const willDeleteRef = useRef(willDelete);

  const notifyUpdate = useCallback(() => {
    const concatenatedDescription =
      `${descriptionRef.current}\n${descriptionAdditionalRef.current}`.trim();

    const updatedPoll: Poll = {
      ...poll,
      question: questionRef.current.trim(),
      description: concatenatedDescription || null,
      image: imageUrlRef.current.trim() || null,
      tag: tagRef.current?.tag ?? 0,
      choices: choicesRef.current,
      time: dateTimeRef.current,
      thread_question: threadQuestionRef.current || null,
    };

    const questionChanged =
      questionRef.current.trim() !== originalPoll.current.question;
    const descriptionChanged =
      descriptionRef.current.trim() !==
      (filterDescriptionWithRegex(originalPoll.current.description) || "");
    const descriptionAdditionalChanged =
      descriptionAdditionalRef.current.trim() !==
      (extractDescriptionWithRegex(originalPoll.current.description) || "");
    const imageChanged =
      imageUrlRef.current.trim() !== (originalPoll.current.image || "");
    const tagChanged = tagRef.current?.tag !== originalTag.current?.tag;
    const choicesChanged =
      choicesRef.current.length !== originalPoll.current.choices.length ||
      choicesRef.current.some(
        (choice, index) => choice !== originalPoll.current.choices[index]
      );
    const dateTimeChanged = dateTimeRef.current !== originalPoll.current.time;
    const threadQuestionChanged =
      threadQuestionRef.current !==
      (originalPoll.current.thread_question || "");

    const isEditedNow =
      willDeleteRef.current ||
      questionChanged ||
      descriptionChanged ||
      descriptionAdditionalChanged ||
      imageChanged ||
      tagChanged ||
      choicesChanged ||
      dateTimeChanged ||
      threadQuestionChanged;

    setIsEdited(isEditedNow);
    const currentState = willDeleteRef.current
      ? EditState.DELETE
      : poll.id < 0
      ? EditState.CREATE
      : isEditedNow
      ? EditState.UPDATE
      : EditState.NONE;

    console.log("Poll updated:", updatedPoll, currentState);
    updatePoll?.(updatedPoll, currentState);
  }, [poll, updatePoll]);

  const handleQuestionChange = useCallback(
    (question: string) => {
      const trimmed = trimRunningStringSingleLine(question);
      setQuestionText(trimmed);
      questionRef.current = trimmed;
      notifyUpdate();
    },
    [notifyUpdate]
  );

  const handleDescriptionChange = useCallback(
    (description: string) => {
      const trimmed = trimRunningStringMultiLine(description);
      setDescriptionText(trimmed);
      descriptionRef.current = trimmed;
      notifyUpdate();
    },
    [notifyUpdate]
  );

  const handleDescriptionAdditionalChange = useCallback(
    (descriptionAdditional: string) => {
      const trimmed = trimRunningStringMultiLine(descriptionAdditional);
      setDescriptionAdditionalText(trimmed);
      descriptionAdditionalRef.current = trimmed;
      notifyUpdate();
    },
    [notifyUpdate]
  );

  const handleImageUrlChange = useCallback(
    (url: string) => {
      const cleaned = cleanUrlSafeString(url);
      setImageUrl(cleaned);
      imageUrlRef.current = cleaned;
      setImageError(false);
      notifyUpdate();
    },
    [notifyUpdate]
  );

  const handleTagChange = useCallback(
    (tag: Tag | undefined) => {
      setCurrentTag(tag);
      tagRef.current = tag;
      notifyUpdate();
    },
    [notifyUpdate]
  );

  const handleChoicesChange = useCallback(
    (newChoices: Poll["choices"]) => {
      setChoices(newChoices);
      choicesRef.current = newChoices;
      notifyUpdate();
    },
    [notifyUpdate]
  );

  const handleTimeChange = useCallback(
    (newDateTime: Poll["time"]) => {
      setDateTime(newDateTime);
      dateTimeRef.current = newDateTime;
      notifyUpdate();
    },
    [notifyUpdate]
  );

  const handleThreadQuestionChange = useCallback(
    (newThreadQuestion: string) => {
      setThreadQuestion(newThreadQuestion);
      threadQuestionRef.current = newThreadQuestion;
      notifyUpdate();
    },
    [notifyUpdate]
  );

  const handleWillDeleteChange = useCallback(
    (newWillDelete: boolean) => {
      setWillDelete(newWillDelete);
      willDeleteRef.current = newWillDelete;
      notifyUpdate();
    },
    [notifyUpdate]
  );

  const handleVotesChange = useCallback((newVotes: number[] | null) => {
    setVotes(newVotes || []);
  }, []);

  const colorRgb = currentTag?.colour
    ? [
        (currentTag.colour >> 16) & 0xff, // Red
        (currentTag.colour >> 8) & 0xff, // Green
        currentTag.colour & 0xff, // Blue
      ].join(", ")
    : undefined;

  return (
    <CardBox
      direction="column"
      gap="3"
      align="center"
      justify="start"
      $color={colorRgb}
      $state={state}
    >
      <PollCardHeader
        poll={poll}
        tag={editable ? currentTag : tag}
        setTag={editable ? handleTagChange : undefined}
        guild={guild}
        votes={votes}
        editable={editable}
        handleTimeChange={editable ? handleTimeChange : undefined}
        description={descriptionAdditionalText}
        handleDescriptionChange={
          editable ? handleDescriptionAdditionalChange : undefined
        }
      />

      <CardTitleBlock direction="column" gap="1" align="start">
        {editable ? (
          <>
            <Flex
              direction="row"
              gap="2"
              align="start"
              justify="start"
              style={{ width: "100%" }}
            >
              <QuestionEditable
                $isMobile={isMobile}
                placeholder="Question"
                value={questionText}
                onChange={(e) => handleQuestionChange(e.target.value)}
                onBlur={(e) => handleQuestionChange(e.target.value.trim())}
              />
              {!poll.published ? (
                <Button
                  variant="ghost"
                  onClick={() => handleWillDeleteChange(!willDelete)}
                >
                  {!willDelete ? <Trash2 size={30} /> : <Undo />}
                </Button>
              ) : null}
            </Flex>
            <DescriptionEditable
              placeholder="Description"
              value={descriptionText}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              onBlur={(e) => handleDescriptionChange(e.target.value.trim())}
            />
          </>
        ) : (
          <>
            <Question $isMobile={isMobile}>{poll.question}</Question>
            {filteredDescription && (
              <MarkdownDescription
                text={filteredDescription}
                size="2"
                align="left"
                editable={editable}
              />
            )}
          </>
        )}
      </CardTitleBlock>

      <Choices
        poll={poll}
        tag={editable ? currentTag : tag}
        votes={votes}
        setVotes={handleVotesChange}
        userVote={userVote}
        setUserVote={setUserVote}
        editable={editable}
        handleChoicesChange={editable ? handleChoicesChange : undefined}
        showVotes={showVotes}
      />

      <PollControls
        poll={{ ...poll, thread_question: threadQuestion }}
        showVotes={showVotes}
        setShowVotes={setShowVotes}
        editing={editable}
        onThreadQuestionChange={
          editable ? handleThreadQuestionChange : undefined
        }
      />

      {imageUrl && (
        <ImageContainer>
          {!imageError ? (
            <PollImage
              src={imageUrl}
              alt={poll.question}
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
          ) : !editable ? (
            <Flex align="center" justify="center" style={{ padding: "1rem" }}>
              <ImageOff size={48} color="var(--gray-10)" />
            </Flex>
          ) : null}
        </ImageContainer>
      )}

      {editable && (
        <ImageUrlInput
          type="text"
          placeholder="Image URL"
          size="2"
          value={imageUrl}
          onChange={(e) => handleImageUrlChange(e.target.value)}
          onBlur={(e) => handleImageUrlChange(e.target.value.trim())}
        >
          <TextField.Slot>
            {!imageError ? <Image /> : <ImageOff />}
          </TextField.Slot>
        </ImageUrlInput>
      )}
    </CardBox>
  );
}

export function PollCardSkeleton() {
  const isMobile = useIsMobile();

  return (
    <CardBox direction="column" gap="3" align="center" justify="start">
      <PollCardHeaderSkeleton />

      <CardTitleBlock direction="column" gap="1" align="start">
        <Question $isMobile={isMobile}>
          <Skeleton>
            <span style={{ opacity: 0 }}>
              {isMobile
                ? "Loading poll question..."
                : "Loading poll question content..."}
            </span>
          </Skeleton>
        </Question>
        <Skeleton>
          <MarkdownDescription text="Loading..." size="2" align="left" />
        </Skeleton>
      </CardTitleBlock>

      <ChoicesSkeleton />

      <ImageContainer>
        <PollImageSkeleton />
      </ImageContainer>
    </CardBox>
  );
}

export function NewPollButton({
  onClick,
  onImport,
}: {
  onClick?: () => void;
  onImport?: (polls: Array<Partial<Poll>>) => void;
}) {
  return (
    <NewPollButtonWrapper
      direction="row"
      gap="2"
      align="center"
      justify="center"
    >
      <NewPollButtonManual variant="surface" size="3" onClick={onClick}>
        <MessageSquarePlus />
        Create a new poll
      </NewPollButtonManual>

      <Tooltip content="Import from clipboard">
        <ImportFromClipboardButton onParsed={(p) => onImport?.(p)} />
      </Tooltip>
    </NewPollButtonWrapper>
  );
}
