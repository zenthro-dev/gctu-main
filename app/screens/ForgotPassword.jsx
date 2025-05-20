import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword } = useAuth();
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const success = await forgotPassword(email);
      if (success) {
        setEmail("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.description}>
          Enter your email address and we'll send you a link to reset your
          password.
        </Text>

        <View style={styles.formContainer}>
          <TextInput
            placeholder="Email"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.resetButtonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "rgb(3, 9, 79)",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "rgba(78, 78, 79, 0.86)",
    marginBottom: 30,
  },
  formContainer: {
    backgroundColor: "#f1f1f1",
    padding: 20,
    borderRadius: 10,
  },
  input: {
    borderWidth: 0.5,
    marginVertical: 10,
    height: 55,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderColor: "rgba(179, 179, 183, 0.86)",
    fontSize: 18,
    backgroundColor: "#fff",
  },
  resetButton: {
    backgroundColor: "rgb(3, 9, 79)",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  backButton: {
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
  },
  backButtonText: {
    color: "rgb(3, 9, 79)",
    fontSize: 16,
  },
});

export default ForgotPassword;
