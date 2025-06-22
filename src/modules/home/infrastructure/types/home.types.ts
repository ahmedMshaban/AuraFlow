export interface FiltersProps {
  selectedView: string;
  setSelectedView: (view: string) => void;
  isCurrentlyStressed: boolean;
  numOfFocusedEmails: number | undefined;
  numOfOtherEmails: number | undefined;
  isLoadingEmails: boolean;
}
