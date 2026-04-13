export interface RouteHandle {
  title?: string;
  parent?: string;
}

export type FetchReturn = {
  ok: boolean;
  status: number;
  msg: string;
  data?: any;
};
