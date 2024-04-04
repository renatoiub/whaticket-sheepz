import React, { useState, useEffect } from "react";

import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "react-query";

import { ptBR } from "@material-ui/core/locale";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { useMediaQuery } from "@material-ui/core";
import ColorModeContext from "./layout/themeContext";

import Routes from "./routes";

const queryClient = new QueryClient();

const App = () => {
    const [locale, setLocale] = useState();

    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const preferredTheme = window.localStorage.getItem("preferredTheme");
    const [mode, setMode] = useState(preferredTheme ? preferredTheme : prefersDarkMode ? "dark" : "light");

    const colorMode = React.useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
            },
        }),
        []
    );

    const theme = createTheme(
        {
            scrollbarStyles: {
                "&::-webkit-scrollbar": {
                    width: '8px',
                    height: '8px',
                },
                "&::-webkit-scrollbar-thumb": {
                    boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.3)',
                    backgroundColor: mode === "light" ? "#00BFFF" : "#FFFFFF",
                },
            },
            scrollbarStylesSoft: {
                "&::-webkit-scrollbar": {
                    width: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                    backgroundColor: mode === "light" ? "#F3F3F3" : "#212124",
                },
            },
            palette: {
                type: mode,
                primary: { main: "#083A5E" },
                textPrimary: mode === "light" ? "#083A5E" : "#FFFFFF",
                borderPrimary: mode === "light" ? "#083A5E" : "#FFFFFF",
                dark: { main: mode === "light" ? "#2f2f33" : "#F3F3F3" },
                light: { main: mode === "light" ? "#F3F3F3" : "#2f2f33" },
                tabHeaderBackground: mode === "light" ? "#EEE" : "#666",
                optionsBackground: mode === "light" ? "#fafafa" : "#333",
				options: mode === "light" ? "#fafafa" : "#666",
				fontecor: mode === "light" ? "#00BFFF" : "#fff",
                fancyBackground: mode === "light" ? "#fafafa" : "#333",
				bordabox: mode === "light" ? "#eee" : "#333",
				newmessagebox: mode === "light" ? "#eee" : "#333",
				inputdigita: mode === "light" ? "#fff" : "#333",
				contactdrawer: mode === "light" ? "#fff" : "#333",
				announcements: mode === "light" ? "#ededed" : "#333",
				login: mode === "light" ? "#fff" : "#1C1C1C",
				announcementspopover: mode === "light" ? "#fff" : "#333",
				chatlist: mode === "light" ? "#eee" : "#333",
				boxlist: mode === "light" ? "#ededed" : "#333",
				boxchatlist: mode === "light" ? "#ededed" : "#333",
                total: mode === "light" ? "#fff" : "#222",
                messageIcons: mode === "light" ? "grey" : "#F3F3F3",
                inputBackground: mode === "light" ? "#FFFFFF" : "#333",
                barraSuperior: mode === "light" ? "#083A5E" : "#333",
				boxticket: mode === "light" ? "#EEE" : "#333",
				campaigntab: mode === "light" ? "#ededed" : "#333",
            },
            mode,
        },
        locale
    );

    useEffect(() => {
        const i18nlocale = localStorage.getItem("i18nextLng");
        const browserLocale =
            i18nlocale.substring(0, 2) + i18nlocale.substring(3, 5);

        if (browserLocale === "ptBR") {
            setLocale(ptBR);
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem("preferredTheme", mode);
    }, [mode]);



    return (
        <ColorModeContext.Provider value={{ colorMode }}>
            <ThemeProvider theme={theme}>
                <QueryClientProvider client={queryClient}>
                    <Routes />
                </QueryClientProvider>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};

export default App;
