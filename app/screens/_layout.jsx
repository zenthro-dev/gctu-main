import { Stack } from "expo-router";
import { StatusBar } from "react-native";

function ScreensLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen
          name="LectureEvaluation"
          options={{
            headerShown: false,
          }}
        ></Stack.Screen>
        <Stack.Screen
          name="EvaluationForm"
          options={{
            headerShown: false,
          }}
        ></Stack.Screen>
        <Stack.Screen
          name="ForgotPassword"
          options={{
            headerShown: false,
          }}
        ></Stack.Screen>
        <Stack.Screen
          name="notifications"
          options={{
            headerShown: false,
          }}
        ></Stack.Screen>
      </Stack>
    </>
  );
}

export default ScreensLayout;
