import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import { StrictMode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "./lib/query/query-client";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./styles.css";

const router = getRouter();
const queryClient = getQueryClient();
const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" enableSystem>
          <RouterProvider router={router} />
          <Toaster position="top-center" richColors />
        </ThemeProvider>
        <ReactQueryDevtools buttonPosition="top-right" initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>,
  );
}
