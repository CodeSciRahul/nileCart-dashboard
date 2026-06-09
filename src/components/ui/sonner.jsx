import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => (
  <Sonner
    position="top-right"
    richColors
    closeButton
    toastOptions={{
      classNames: {
        toast: "font-sans",
      },
    }}
    {...props}
  />
);

export { Toaster };
