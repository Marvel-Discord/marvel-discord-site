import {
  intToColorHex,
  randomText,
  trimRunningStringSingleLine,
} from "@/utils";
import { Spacer } from "@/utils/styled";
import type { Poll, Tag } from "@jocasta-polls-api";
import {
  AlertDialog,
  Button,
  Box,
  Flex,
  Heading,
  Skeleton,
  Text,
  Link,
  Tooltip,
} from "@radix-ui/themes";
import styled, { css, keyframes } from "styled-components";
import { useIsMobile } from "@/utils/isMobile";
import {
  CircleCheckBig,
  Eye,
  EyeClosed,
  Lock,
  LockOpen,
  Plus,
  X,
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthProvider";
import config from "@/app/config/config";
import { useRouter } from "next/navigation";
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { AutoGrowingTextAreaStyled } from "./autoGrowingRadixTextArea";
import { useFirstRenderResetOnCondition } from "@/utils/useFirstRender";
import { postVote } from "@/api/polls/votes";

const ChoiceLabelMap: Record<number, string> = {
  1: "A",
  2: "B",
  3: "C",
  4: "D",
  5: "E",
  6: "F",
  7: "G",
  8: "H",
};

const Container = styled(Flex).attrs({
  gap: "2",
  direction: "column",
  width: "100%",
  align: "end",
})``;

const ChoiceContainerStyle = styled(Box)`
  border-color: var(--gray-a3);
  border-radius: var(--radius-3);
  border-style: solid;
  border-width: 0.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  width: 100%;
`;

const ChoiceContainerButton = styled.button.attrs({
  type: "button",
})`
  align-items: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
`;

const ChoiceContainerInner = styled(Flex).attrs({
  gap: "2",
  align: "center",
})``;

const BarContainer = styled.div`
  background-color: var(--gray-a5);
  border-radius: 100rem;
  height: 0.4rem;
  width: 100%;
`;

const BarLine = styled.div<{
  $percentage: number;
  $color?: string;
  $isChecked?: boolean;
  $canHover?: boolean;
}>`
  background-color: ${({ $color }) => $color || "var(--red-9)"};
  border-radius: 100rem;
  height: 100%;
  opacity: ${({ $isChecked }) => ($isChecked ? 0.95 : 0.75)};
  transition: opacity 0.1s ease-in-out, width 0.3s ease-in-out;
  width: ${({ $percentage }) => `${$percentage}%`};

  ${ChoiceContainerButton}:hover & {
    ${({ $canHover = true }) => ($canHover ? "opacity: 1;" : "")}
  }
`;

const ChoiceLabelButton = styled.button<{ $isDisabled: boolean }>`
  align-items: center;
  background-color: transparent;
  border: none;

  ${({ $isDisabled }) =>
    $isDisabled ? "pointer-events: none;" : "cursor: pointer;"}
`;

const ChoiceLabelDiv = styled.div<{ $isDisabled: boolean }>`
  align-items: center;
  background-color: transparent;

  ${({ $isDisabled }) =>
    $isDisabled ? "pointer-events: none;" : "cursor: pointer;"}
`;

const ChoiceLabel = styled(Heading)<{ $canHover?: boolean }>`
  opacity: 0.4;
  transition: opacity 0.1s ease-in-out;
  width: 1rem;
  text-align: center;
  display: flex;
  align-items: center;

  ${ChoiceContainerButton}:hover & {
    ${({ $canHover = true }) => ($canHover ? "opacity: 1;" : "")}
  }

  ${ChoiceLabelButton}:hover & {
    ${({ $canHover = true }) => ($canHover ? "opacity: 1;" : "")}
  }

  ${ChoiceLabelDiv}:hover & {
    ${({ $canHover = true }) => ($canHover ? "opacity: 1;" : "")}
  }
`;

const ChoiceText = styled(Text)`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  text-align: left;
`;

const ChoiceTextEditable = styled(AutoGrowingTextAreaStyled)<{
  $size: string;
}>`
  min-height: var(--line-height-${({ $size }) => $size});

  > textarea {
    font-size: var(--font-size-${({ $size }) => $size});
    line-height: var(--line-height-${({ $size }) => $size});
  }
`;

const scaleUpDown = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05); /* Slightly bigger */
  }
  100% {
    transform: scale(1); /* Back to normal size */
  }
`;

const ChoiceCheck = styled(CircleCheckBig)<{ $isChecked: boolean }>`
  display: ${({ $isChecked }) => ($isChecked ? "block" : "none")};

  animation: ${({ $isChecked }) =>
    $isChecked
      ? css`
          ${scaleUpDown} 0.15s ease-in-out
        `
      : "none"};
`;

const PercentLabel = styled(Text)`
  color: var(--gray-a11);
`;

const ShowVotesButtonStyle = styled(Button).attrs({
  variant: "ghost",
  color: "gray",
  size: "1",
})`
  width: fit-content;
  margin-inline: 0rem;
`;

type ChoiceContainerProps = {
  choice: string;
  editable?: boolean;
  enticer?: boolean;
  index: number;
  onDelete?: () => void;
  onVote?: () => void;
  percentageVotes?: number[];
  poll: Poll;
  setChoice?: (value: string) => void;
  showVotes?: boolean;
  tag?: Tag;
  userVote?: number;
};

export function ChoiceContainer({
  choice,
  editable = false,
  enticer = false,
  index,
  onDelete,
  percentageVotes = [],
  poll,
  setChoice,
  showVotes = false,
  tag,
  userVote,
}: ChoiceContainerProps) {
  const isMobile = useIsMobile();

  const relativePercentage = (percentage: number) =>
    percentage ? (percentage / Math.max(...percentageVotes)) * 100 : 0;

  const tagColor = tag?.colour ? intToColorHex(tag.colour) : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChoice?.(trimRunningStringSingleLine(e.target.value));
  };

  const canDelete =
    editable &&
    choice.length === 0 &&
    poll.choices.length > 1 &&
    !poll.published;

  return (
    <ChoiceContainerInner>
      {editable ? (
        <ChoiceLabelButton
          $isDisabled={!canDelete || enticer}
          onClick={editable ? onDelete : undefined}
        >
          <ChoiceLabel size="4" $canHover={canDelete && !enticer}>
            {!editable ? (
              ChoiceLabelMap[index + 1]
            ) : !canDelete ? (
              ChoiceLabelMap[index + 1]
            ) : !enticer ? (
              <X strokeWidth={3} />
            ) : (
              <Plus strokeWidth={3} />
            )}
          </ChoiceLabel>
        </ChoiceLabelButton>
      ) : (
        <ChoiceLabelDiv $isDisabled={!canDelete || enticer}>
          <ChoiceLabel size="4" $canHover={canDelete && !enticer}>
            {ChoiceLabelMap[index + 1]}
          </ChoiceLabel>
        </ChoiceLabelDiv>
      )}

      <Flex gap="1" direction="column" width="100%">
        <Flex gap="1" width="100%" align="end">
          {editable ? (
            <ChoiceTextEditable
              $size={isMobile ? "2" : "3"}
              onChange={handleChange}
              onBlur={() => setChoice?.(choice.trim())}
              placeholder={
                !enticer
                  ? `Choice ${ChoiceLabelMap[index + 1]}`
                  : "Add new choice"
              }
              value={choice}
            />
          ) : (
            <ChoiceText size={isMobile ? "2" : "3"}>
              {choice}
              <ChoiceCheck
                size="20"
                $isChecked={userVote !== undefined && userVote === index}
              />
            </ChoiceText>
          )}
          <Spacer />
          {(editable ? percentageVotes.length > index : showVotes) &&
            poll.votes && (
              <Tooltip
                content={`${poll.votes[index]} Vote${
                  poll.votes[index] > 1 ? "s" : ""
                }`}
              >
                <PercentLabel size="1">
                  {percentageVotes[index].toFixed(0)}%
                </PercentLabel>
              </Tooltip>
            )}
        </Flex>

        <BarContainer>
          <BarLine
            $percentage={
              editable || showVotes
                ? relativePercentage(percentageVotes[index])
                : 0
            }
            $color={tagColor}
            $isChecked={!editable && userVote === index}
            $canHover={!editable}
          />
        </BarContainer>
      </Flex>
    </ChoiceContainerInner>
  );
}

function ChoiceAlert({
  trigger,
  title,
  description,
  button,
}: {
  trigger: React.ReactNode;
  title: string;
  description: string;
  button: React.ReactNode;
}) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Title>{title}</AlertDialog.Title>
        <AlertDialog.Description>{description}</AlertDialog.Description>
        <Flex gap="5" justify="end" mt="4">
          <AlertDialog.Action>{button}</AlertDialog.Action>
          <AlertDialog.Cancel>
            <Button variant="ghost" color="gray">
              Cancel
            </Button>
          </AlertDialog.Cancel>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}

function ShowVotesButton({
  editing = false,
  poll,
  setShowVotes,
  showVotes,
}: {
  editing?: boolean;
  poll: Poll;
  setShowVotes: Dispatch<SetStateAction<boolean>>;
  showVotes: boolean;
}) {
  const showVoting = poll?.show_voting;

  return (
    <ShowVotesButtonStyle
      onClick={() => {
        setShowVotes((prev) => !prev);
      }}
      disabled={!showVoting}
    >
      {showVotes ? (
        <>
          Hide Votes
          {editing ? <Lock size="0.8rem" /> : <Eye size="0.8rem" />}
        </>
      ) : (
        <>
          Show Votes
          {editing ? (
            <LockOpen size="0.8rem" />
          ) : !showVoting ? (
            <Lock size="0.8rem" />
          ) : (
            <EyeClosed size="0.8rem" />
          )}
        </>
      )}
    </ShowVotesButtonStyle>
  );
}

function ShowVotesButtonSkeleton() {
  return (
    <ShowVotesButtonStyle disabled>
      <Skeleton>
        <Text size="1">Show Votes</Text>
      </Skeleton>
    </ShowVotesButtonStyle>
  );
}
type ChoicesProps = {
  editable?: boolean;
  poll: Poll;
  setUserVote?: (vote: number | undefined) => void;
  setVotes?: (votes: Poll["votes"]) => void;
  tag?: Tag;
  userVote?: number;
  votes?: Poll["votes"];
  handleChoicesChange?: (choices: string[]) => void;
};

export function Choices({
  editable = false,
  poll,
  setUserVote = () => {},
  setVotes = () => {},
  tag,
  userVote,
  votes = [],
  handleChoicesChange = () => {},
}: ChoicesProps) {
  const { user } = useAuthContext();
  const router = useRouter();

  const voteTimeout = useRef<NodeJS.Timeout | null>(null);
  const DEBOUNCE_DELAY = 500; // ms

  const [choices, setChoices] = useState(() =>
    editable && poll.choices.length < 8 && !poll.published
      ? [...poll.choices, ""]
      : poll.choices
  );

  const [showVotes, setShowVotes] = useState(
    editable
      ? poll.show_voting
      : (userVote !== undefined || !user) && poll.show_voting
  );

  const totalVotes = (votes ?? []).reduce((acc, vote) => acc + vote, 0);

  const percentageVotes =
    votes?.map((vote) =>
      totalVotes === 0 ? 0 : Number((vote / totalVotes) * 100)
    ) || [];

  async function handleVote(index: number) {
    if (!user || editable) return;

    let choice: number | undefined = index;
    if (userVote === index) {
      choice = undefined;
    }

    if (votes) {
      const updatedVotes = [...votes];
      if (choice === undefined || userVote !== undefined) {
        updatedVotes[index]--;
      }

      if (choice !== undefined) {
        updatedVotes[choice]++;
      }

      setVotes(updatedVotes);
    }

    setUserVote(choice);

    if (voteTimeout.current) {
      clearTimeout(voteTimeout.current);
    }

    voteTimeout.current = setTimeout(() => {
      postVote(poll.id, user.id, choice).catch((err) => {
        console.error("Failed to post vote:", err);
      });
    }, DEBOUNCE_DELAY);
  }

  useEffect(() => {
    return () => {
      if (voteTimeout.current) {
        clearTimeout(voteTimeout.current);
      }
    };
  }, []);

  function handleChoiceTextChange(index: number, value: string) {
    if (!editable) return;
    const updatedChoices = [...choices];
    updatedChoices[index] = value;
    handleSetChoices(updatedChoices);
  }

  function handleChoiceDelete(index: number) {
    if (!editable) return;
    const updatedChoices = [...choices];
    updatedChoices.splice(index, 1);
    handleSetChoices(updatedChoices);
  }

  function handleSetChoices(newChoices: string[]) {
    if (!poll.published) {
      const last = newChoices.at(-1);
      const secondLast = newChoices.at(-2);

      if (
        (newChoices.length >= 1 && last !== "" && newChoices.length < 8) ||
        newChoices.length === 0
      ) {
        newChoices.push("");
      } else if (newChoices.length >= 2 && secondLast === "") {
        newChoices.pop();
      }
    }

    setChoices(newChoices);
  }

  const isFirstRender = useFirstRenderResetOnCondition(editable);
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (editable) {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }
      handleChoicesChange(choices.filter((choice) => choice.trim() !== ""));
    }
  }, [editable, choices]);

  const choiceComponents = choices.map((choice, index) => {
    const choiceElement = (
      <ChoiceContainer
        key={ChoiceLabelMap[index + 1]}
        index={index}
        tag={tag}
        choice={choice}
        setChoice={
          editable ? (val) => handleChoiceTextChange(index, val) : undefined
        }
        poll={poll}
        percentageVotes={percentageVotes}
        onDelete={editable ? () => handleChoiceDelete(index) : undefined}
        enticer={editable && index === choices.length - 1 && !poll.published}
        editable={editable}
        userVote={userVote}
        showVotes={showVotes && poll.show_voting}
      />
    );

    if (!editable) {
      const choiceButton = (
        <ChoiceContainerButton
          onClick={async () => await handleVote(index)}
          key={ChoiceLabelMap[index + 1]}
        >
          {choiceElement}
        </ChoiceContainerButton>
      );

      if (!user) {
        return (
          <ChoiceAlert
            key={ChoiceLabelMap[index + 1]}
            trigger={choiceButton}
            title="Sign In Required"
            description="You need to sign in with Discord to vote on this poll."
            button={
              <Button
                variant="ghost"
                onClick={() => {
                  router.push(`${config.apiUrlPolls}/auth`);
                }}
              >
                Sign In
              </Button>
            }
          />
        );
      }

      const inServer = user?.guilds?.some(
        (guild) => guild.id === poll.guild_id.toString()
      );

      if (!inServer) {
        return (
          <ChoiceAlert
            key={ChoiceLabelMap[index + 1]}
            trigger={choiceButton}
            title="Not In Server"
            description="You need to join the Marvel Discord server to be able to vote."
            button={
              <Link href="https://discord.gg/marvel" target="_blank">
                <Button variant="ghost">Join Server</Button>
              </Link>
            }
          />
        );
      }

      return choiceButton;
    }

    return choiceElement;
  });

  return (
    <Container>
      <ChoiceContainerStyle>{choiceComponents}</ChoiceContainerStyle>
      <ShowVotesButton
        poll={poll}
        showVotes={showVotes}
        setShowVotes={setShowVotes}
        editing={editable}
      />
    </Container>
  );
}

export function ChoicesSkeleton() {
  const isMobile = useIsMobile();

  return (
    <Container>
      <ChoiceContainerStyle>
        {Array.from({ length: 4 }, (_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons
          <Flex key={index} gap="2" align="center">
            <Skeleton>
              <ChoiceLabel size="4">{ChoiceLabelMap[index + 1]}</ChoiceLabel>
            </Skeleton>

            <Flex gap="1" direction="column" width="100%">
              <Flex width="100%" align="end">
                <Skeleton>
                  <Text size="2" style={{ opacity: 0 }}>
                    {isMobile ? "Loading choice..." : "Loading choice text..."}
                  </Text>
                </Skeleton>
                <Spacer />
                <Skeleton>
                  <PercentLabel size="1" title="">
                    50%
                  </PercentLabel>
                </Skeleton>
              </Flex>

              <Skeleton>
                <BarContainer />
              </Skeleton>
            </Flex>
          </Flex>
        ))}
      </ChoiceContainerStyle>
      <ShowVotesButtonSkeleton />
    </Container>
  );
}
