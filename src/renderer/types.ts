export interface Blog {
  name: string;
  title: string;
  url: string;
  image?: string;
  description?: string;
  primary?: boolean;
}

export interface Auth {
  uuid: string;
  provider: string;
}

export interface User {
  name: string;
}

export interface Account {
  auth: Auth;
  user: User;
  blogs: Blog[];
}

export interface Provider {
  name: string;
  label: string;
  logo: string;
}

export interface Preferences {
  appTheme?: string;
  [key: string]: any;
}

export interface Post {
  id: string | number;
  title: string;
  content: string;
  contentJson?: string;
  categoryId: string;
  tags: string[];
}

export interface PostData {
  title: string;
  content: any;
  categoryId: string;
  tags: string[];
}
