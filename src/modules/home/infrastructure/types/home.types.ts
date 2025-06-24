export type ViewType = 'my-day' | 'my-week' | 'my-month';

export interface FiltersProps {
  selectedView: ViewType;
  setSelectedView: (view: ViewType) => void;
  isCurrentlyStressed: boolean;
  numOfFocusedEmails: number | undefined;
  numOfOtherEmails: number | undefined;
  isLoadingEmails: boolean;
}
