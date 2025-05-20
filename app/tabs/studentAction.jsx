import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import ConfirmationModal from "../components/ConfirmationModal";
import { Alert } from "react-native";

const StudentAction = () => {
  const router = useRouter();
  const { signOut } = useAuth();
  const [clearanceStatus, setClearanceStatus] = useState("Pending");
  const [attendanceStatus, setAttendanceStatus] = useState("Not Scanned");
  const [modalVisible, setModalVisible] = useState(false);

  // Simulate clearance action
  const handleClearance = () => {
    setClearanceStatus("Cleared");
    alert("Clearance completed successfully!");
  };

  // Simulate QR code scanning
  const handleScanQR = () => {
    setAttendanceStatus("Scanned");
    alert("QR code scanned successfully! Attendance recorded.");
  };

  // Navigate to lecture evaluation page
  const navigateToLectureEvaluation = () => {
    router.push("/screens/LectureEvaluation");
  };

  const handleLogout = () => {
    setModalVisible(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut();
      setModalVisible(false);
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error.message);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  const cancelLogout = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <LinearGradient
          colors={["#003366", "#003366"]}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Student Action</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push("/screens/notifications")}
              >
                <Ionicons name="notifications-outline" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleLogout}
              >
                <Ionicons
                  name="power-outline"
                  size={22}
                  color="rgb(219, 3, 43)"
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Lecture Evaluation Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lecture Evaluation</Text>
            <TouchableOpacity
              style={styles.navButton}
              onPress={navigateToLectureEvaluation}
            >
              <Text style={styles.navButtonText}>View Evaluations</Text>
            </TouchableOpacity>
          </View>

          {/* Clearance Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Perform Clearance</Text>
            <Text style={styles.statusText}>Status: {clearanceStatus}</Text>
            {clearanceStatus === "Pending" && (
              <TouchableOpacity style={styles.button} onPress={handleClearance}>
                <Text style={styles.buttonText}>Complete Clearance</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* QR Code Attendance Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scan Attendance QR</Text>
            <Text style={styles.statusText}>Status: {attendanceStatus}</Text>
            {attendanceStatus === "Not Scanned" && (
              <TouchableOpacity style={styles.button} onPress={handleScanQR}>
                <Text style={styles.buttonText}>Scan QR Code</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        <ConfirmationModal
          visible={modalVisible}
          onConfirm={confirmLogout}
          onCancel={cancelLogout}
          title="Logout"
          message="Are you sure you want to logout?"
          confirmText="Logout"
          cancelText="Cancel"
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003366",
  },
  safeArea: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    marginTop: -15,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  statusText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#003366",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  navButton: {
    backgroundColor: "#004080",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default StudentAction;
