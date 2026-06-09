import { toast } from "sonner";

export const getErrorMessage = (error) => {
  if (!error) return "Something went wrong. Please try again.";
  if (typeof error === "string") return error;

  const status = error.status ?? error.response?.status;
  const serverMessage = error.message || error.response?.data?.message;

  if (!status && error.message === "Network Error") {
    return "Unable to connect. Check your internet connection.";
  }

  if (status === 401) {
    return serverMessage || "Session expired. Please sign in again.";
  }

  if (status === 403) {
    return serverMessage || "You don't have permission to perform this action.";
  }

  if (status === 404) {
    return serverMessage || "Resource not found.";
  }

  if (status >= 500) {
    return serverMessage || "Server error. Please try again later.";
  }

  return serverMessage || "Something went wrong. Please try again.";
};

export const showErrorToast = (error, fallbackMessage) => {
  toast.error(fallbackMessage || getErrorMessage(error));
};

export const showSuccessToast = (message) => {
  toast.success(message);
};

export const showInfoToast = (message) => {
  toast.info(message);
};
