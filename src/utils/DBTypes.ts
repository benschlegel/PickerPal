export interface CreateChoice {
  // message id
  _id: string;
  ownerId: string;
  choiceTitle: string;
  isComplete?: boolean;
  currentChoice?: string;
  finalChoice?: string;
  rerollAmount?: number;
  choices?: string[];
}

export interface Choice {
  updateId: string;
  name: string;
}

export interface Userbase {
  _id: string;
  ids: string[];
}
