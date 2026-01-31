import { useAuthQuery } from "./useAuthQuery";

export function useAuth() {
  const authQuery = useAuthQuery();
  return authQuery;
}