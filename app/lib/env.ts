export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
export const delay = (ms = 350) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
