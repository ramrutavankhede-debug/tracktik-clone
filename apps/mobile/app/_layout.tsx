import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#1e2530" },
          headerTintColor: "#ffffff",
          contentStyle: { backgroundColor: "#262d38" },
        }}
      />
    </>
  );
}
