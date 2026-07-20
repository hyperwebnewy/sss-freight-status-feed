// Type contract for status.json. The parser that produces the feed lives in the
// sss-freight-management repo at tools/status-feed/status-feed.ts.

export type WorkStatus =
  | "backlog"
  | "ready-for-dev"
  | "in-progress"
  | "review"
  | "done";

export type RetrospectiveStatus = "optional" | "done";
export type ActionStatus = "open" | "in-progress" | "done";

export interface StoryView {
  key: string;
  title: string;
  status: WorkStatus;
}

export interface EpicView {
  number: number;
  title: string;
  status: "backlog" | "in-progress" | "done";
  done: number;
  total: number;
  stories: StoryView[];
  retrospective?: RetrospectiveStatus;
}

export interface StatusFeed {
  generated: string;
  lastUpdated: string;
  publishedAt: string;
  kpis: {
    overallPercent: number;
    epicsDone: number;
    epicTotal: number;
    storiesInReview: number;
    openActionItems: number;
    currentEpic: number;
  };
  currentFocus: {
    epic: number;
    storyKey: string;
    storyTitle: string;
    status: WorkStatus;
    summary: string;
  };
  epics: EpicView[];
  openActionItems: Array<{
    epic: number;
    action: string;
    owner: string;
    status: Exclude<ActionStatus, "done">;
  }>;
}
