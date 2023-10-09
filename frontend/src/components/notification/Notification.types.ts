export interface ContextValue {
  isVisible: boolean;
  text: string;
  clear: () => void;
  notification: (text: string) => void;
}
