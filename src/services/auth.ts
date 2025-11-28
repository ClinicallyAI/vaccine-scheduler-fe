import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "token";
export let TENANT;

interface JwtPayload {
  exp: number; // expiration time in seconds since epoch
  [key: string]: any;
}

export const setToken = (token: string, remember: boolean = false): void => {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    TENANT = decoded.tenant_id;
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  } catch (e) {
    return false;
  }
};

export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
};
