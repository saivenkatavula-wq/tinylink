export type LinkItem = {
  code: string;
  targetUrl: string;
  shortUrl: string;
  clicks: number;
  lastClicked: string | null;
  createdAt: string;
  updatedAt?: string;
};
