import { View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const TabsLayout = () => {
  return (
    <Tabs
      initialRouteName="home"
      backBehavior="initialRoute"
      screenOptions={{
        tabBarStyle: {
          height: '10%',
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          position:'absolute',
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#1E40AF",
        tabBarInactiveTintColor: "#6B7280",
      }}
    >
      <Tabs.Screen
        name="academics"
        options={{
          title: "Academics",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="book-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="studentAction"
        options={{
          title: "StudentAction",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="create-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <View
              style={{
                width: 56,
                height: 56,
                backgroundColor: "#1E40AF",
                borderRadius: 28,
                marginBottom: 28,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 4,
                borderColor: "#fff",
              }}
            >
              <Ionicons name="home" size={24} color="#fff" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: "Finance",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="card-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
