import type React from "react";

type Variants =
  | "primary"
  | "light"
  | "add"
  | "modalInput"
  | "modalToggle"
  | "modalAdd"
  | "simple"
  | "nextStatus"
  | "completeStatus"
  | "queueStatus"
  | "declinedStatus";

export type ButtonProps = {
  children?: React.ReactNode;
  variant?: Variants;
  [x: string]: any;
};

export const BUTTON_VARIANT_CLASSES = {
  primary: "primary",
  light: "light",
  add: "add",
  modalInput: "modal-input",
  modalToggle: "modal-toggle",
  modalAdd: "modal-add",
  simple: "simple",
  nextStatus: "next-status",
  queueStatus: "queue-status",
  declinedStatus: "declined-status",
  completeStatus: "complete-status",
};
