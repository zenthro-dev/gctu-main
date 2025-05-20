import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Pressable,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "./context/AuthContext";

const LoginScreen = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, loading } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert(
        "Login Failed",
        "Please enter both index number/email and password"
      );
      return;
    }

    setIsLoading(true);
    try {
      const success = await signIn(identifier, password);
      if (success) {
        router.replace("/tabs/home");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/screens/ForgotPassword");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image
            source={require("../assets/images/splash-icon.webp")}
            style={styles.headerImg}
          />
          <Text style={styles.title}>
            Ghana Communication Technology University(GCTU)
          </Text>
        </View>
        <View style={styles.LoginWrapper}>
          <Text style={styles.loginTitle}>Student Portal</Text>
          <Text style={styles.greetings}>
            Welcome to the official student portal for Ghana Communication
            Technology University (GCTU)
          </Text>
          <View style={styles.LoginContainer}>
            <TextInput
              placeholder="Index Number or Email"
              style={styles.credentials}
              autoCapitalize="none"
              value={identifier}
              onChangeText={setIdentifier}
            />
            <TextInput
              placeholder="Password"
              style={styles.credentials}
              secureTextEntry={true}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
            <Pressable onPress={handleForgotPassword}>
              <Text style={{ color: "rgb(252, 59, 59)" }}>
                Forgot Password?
              </Text>
            </Pressable>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={isLoading || loading}
            >
              {isLoading || loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>Log In</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 8,
  },

  StatusBar: {
    backgroundColor: "rgb(15, 95, 169)",
  },

  headerImg: {
    position: "relative",
    width: "25%",
    height: 100,
    objectFit: "contain",
  },

  header: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-evenly",
  },

  title: {
    position: "relative",
    width: "70%",
    fontSize: 19,
    fontFamily: "calibri",
    marginTop: 30,
    fontWeight: "600",
  },

  LoginWrapper: {
    position: "relative",
    margin: "auto",
    width: "95%",
    marginTop: 40,
    paddingVertical: 50,
    paddingHorizontal: 20,
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: "400",
    color: "rgb(3, 9, 79)",
  },

  greetings: {
    fontSize: 16,
    color: "rgba(78, 78, 79, 0.86)",
    fontFamily: "calibri",
    marginTop: 20,
  },

  LoginContainer: {
    position: "relative",
    width: "100%",
    margin: "auto",
    marginTop: 20,
    paddingTop: 30,
    paddingBottom: 50,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: "rgba(179, 179, 183, 0.86)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 1,
  },

  credentials: {
    borderWidth: 0.5,
    marginVertical: 10,
    height: 55,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderColor: "rgba(179, 179, 183, 0.86)",
    fontSize: 18,
  },

  loginBtn: {
    backgroundColor: "rgb(3, 9, 79)",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },

  loginBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
