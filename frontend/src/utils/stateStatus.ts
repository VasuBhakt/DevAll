export interface StateStatus {
  type?: "success" | "error" | "warning" | "info" | null;
  message?: string | null;
}
