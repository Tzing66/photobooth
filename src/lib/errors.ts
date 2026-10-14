import type { NavigateFunction } from "react-router-dom";

export interface ErrorState {
  title: string;
  message: string;
}

export const showError = (navigate: NavigateFunction, title: string, message: string) =>
  navigate("/error", { state: { title, message } satisfies ErrorState });
