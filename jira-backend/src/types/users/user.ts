export interface IUser {
  id: number;
  name: string;
  profile_url: string | null;
  email: string;
  password: string;
  roles: {
    role: {
      id: number;
      name: string;
    };
  }[];
}
