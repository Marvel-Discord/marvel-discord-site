"use client";

import { PollCardSkeleton } from "@/components/polls/main/poll";
import { PollsLoadingSkeleton, PollsMain } from "@/components/polls";
import { PollDataProvider } from "@/contexts/PollDataProvider";
import { EditProvider } from "@/contexts/EditContext";
import { useAuthContext } from "@/contexts/AuthProvider";
import { Suspense, useMemo, useState } from "react";
import type { Poll } from "@jocasta-polls-api";

export default function PollsHome() {
  const skeletons = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons
        <PollCardSkeleton key={index} />
      )),
    []
  );

  return (
    <Suspense fallback={<PollsLoadingSkeleton skeletons={skeletons} />}>
      <PollDataProvider>
        <PollsContent skeletons={skeletons} />
      </PollDataProvider>
    </Suspense>
  );
}

function PollsContent({ skeletons }: { skeletons?: React.ReactNode[] }) {
  const { user } = useAuthContext();
  const canEdit = user?.isManager ?? false;

  const [polls, setPolls] = useState<Poll[]>([]);

  return (
    <EditProvider polls={polls} canEdit={canEdit}>
      <PollsMain skeletons={skeletons} polls={polls} setPolls={setPolls} />
    </EditProvider>
  );
}
