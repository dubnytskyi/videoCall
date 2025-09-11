export type DrawOp = {
  type: "draw";
  page: number;
  path: Array<[number, number]>;
  color: string;
  strokeWidth: number;
};

export type TextOp = {
  type: "text";
  page: number;
  x: number;
  y: number;
  value: string;
  fontSize: number;
  color: string;
};

export type ClearOp = {
  type: "clear";
  page: number;
};

export type CollabOp = DrawOp | TextOp | ClearOp;

export type Participant = {
  identity: string;
  role: "notary" | "client";
  isConnected: boolean;
  isReady: boolean;
};


