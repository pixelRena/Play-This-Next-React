export type ContextValue = {
  open: boolean;
  modalAttrs: ModalDetails;
  setModalVisibility: () => void;
  // Todo: refactor fn
  setModalDetails: (attr: string, value: string | string[] | boolean) => void;
};

export type ModalType = {
  attr: string;
  value: string | string[] | boolean;
};

export type ModalDetails = {
  text?: string;
  games?: any;
  results?: string[];
  filtered?: boolean;
};
