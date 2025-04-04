export interface User {
    id: number;
    username: string;
    email: string;
    // add any other fields your app uses
  }
  
  export function getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem("user");
      if (!stored || stored === "undefined") return null;
      return JSON.parse(stored) as User;
    } catch (err) {
      console.error("Failed to parse user JSON", err);
      return null;
    }
  }
  