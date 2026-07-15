export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isPremium: boolean;
};

export type ImageTool = {
  id: string;
  title: string;
  description: string;
  iconName: string;
  path: string;
};
