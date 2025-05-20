import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { AuthProvider } from "./context/AuthContext";
import { NotificationsProvider } from "./context/NotificationsContext";

function RootLayout() {
  return (
    <>
      <AuthProvider>
        <NotificationsProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="tabs" options={{ headerShown: false }} />
            <Stack.Screen name="screens" options={{ headerShown: false }} />
          </Stack>
        </NotificationsProvider>
      </AuthProvider>
    </>
  );
}

export default RootLayout;
