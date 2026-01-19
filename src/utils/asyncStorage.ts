export const setAccessToken = (value: string): void => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", value);
    }
  } catch (e) {
    console.error("Error saving access token:", e);
  }
};

export const getAccessToken = (): string | null => {
  try {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  } catch (e) {
    console.error("Error retrieving access token:", e);
    return null;
  }
};
