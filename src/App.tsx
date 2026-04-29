import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ConfigProvider, App as AntApp, theme } from "antd";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Editor from "./pages/Editor.tsx";
import { useTheme } from "@/hooks/use-theme";

const queryClient = new QueryClient();

const App = () => {
  const { theme: appTheme } = useTheme();
  const isDark = appTheme === "dark";
  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#243958",
          colorInfo: "#243958",
          borderRadius: 8,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        },
      }}
    >
      <AntApp>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <HashRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/editor/:id" element={<Editor />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </HashRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
