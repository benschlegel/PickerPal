export interface CreateChoice {
  // message id
  _id: string;
  choiceTitle: string;
  isComplete?: boolean;
  finalChoice?: string;
  choices?: string[];
}

export interface Choice {
  updateId: string;
  name: string;
}
