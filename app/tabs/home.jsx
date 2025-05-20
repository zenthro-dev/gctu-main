import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  Platform,
  Pressable,
  Dimensions,
  Image,
  RefreshControl,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BellIcon from "../../assets/SVG/bell";
import GpaIcon from "../../assets/SVG/GpaIcon";
import CreditsIcon from "../../assets/SVG/CreditsIcon";
import ConfirmationModal from "../components/ConfirmationModal";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationsContext";
import { Credits } from "./academics";

const { width } = Dimensions.get("window");

const AcademicYear = () => {
  const currentYear = new Date().getFullYear();
  return (
    <Text>
      {currentYear}/{currentYear + 1}
    </Text>
  );
};

const getProgramWithAbbreviation = (program, type) => {
  const degreeAbbreviations = {
    Degree: "BSc",
    Diploma: "Dip",
    Masters: "MSc",
    PhD: "PhD",
  };
  const abbreviation = degreeAbbreviations[type] || "";
  return abbreviation ? `${abbreviation}. ${program}` : program;
};

const QuickAccess = React.memo(({ title, icon, BgColor, color }) => {
  const router = useRouter();

  const handleNavigation = useCallback(() => {
    if (title === "Course Registration") {
      router.push({
        pathname: "/tabs/academics",
        params: { section: "Courses" },
      });
    } else if (title === "Results") {
      router.push({
        pathname: "/tabs/academics",
        params: { section: "Results" },
      });
    } else if (title === "Fee Payment") {
      router.push("/tabs/finance");
    }
  }, [title, router]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.courseCard,
        pressed && styles.pressedCard,
      ]}
      android_ripple={{ color: "rgba(0,0,0,0.1)" }}
      onPress={handleNavigation}
    >
      <View style={styles.courseCardContent}>
        <View
          style={[styles.courseIconContainer, { backgroundColor: BgColor }]}
        >
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.courseCardTitle}>{title}</Text>
        <View style={styles.courseCardArrow}>
          <Ionicons name="chevron-forward" size={20} color="RGBA(0,0,0,0.5)" />
        </View>
      </View>
    </Pressable>
  );
});

const StatCard = React.memo(({ icon, label, value, bgColor }) => (
  <View style={[styles.statCard, { backgroundColor: bgColor }]}>
    <View style={styles.statContent}>
      <View style={styles.statIconContainer}>{icon}</View>
      <View style={styles.statTextContainer}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}:</Text>
      </View>
    </View>
  </View>
));

export default function HomeScreen() {
  const {
    signOut,
    user,
    studentProfile,
    fetchStudentProfile,
    mountedCourses,
    profileImage,
  } = useAuth();
  const { notifications, announcements, unreadCount, fetchNotifications } =
    useNotifications();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user, router]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (user) {
        await Promise.all([fetchStudentProfile(user.id), fetchNotifications()]);
      }
    } catch (error) {
      console.error("Error refreshing data:", error.message);
    } finally {
      setRefreshing(false);
    }
  }, [user, fetchStudentProfile, fetchNotifications]);

  const quickAccessContents = useMemo(
    () => [
      {
        title: "Course Registration",
        icon: "book-outline",
        color: "rgba(133, 42, 244, 0.98)",
        BgColor: "rgba(217, 115, 245, 0.45)",
      },
      {
        title: "Results",
        icon: "document-text-outline",
        color: "rgba(246, 199, 28, 0.98)",
        BgColor: "rgba(243, 220, 139, 0.69)",
      },
      {
        title: "Fee Payment",
        icon: "card-outline",
        color: "rgba(242, 47, 57, 0.94)",
        BgColor: "rgba(239, 110, 116, 0.55)",
      },
    ],
    []
  );

  const handleLogout = () => setModalVisible(true);

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

  const cancelLogout = () => setModalVisible(false);

  const displayName = useMemo(() => {
    if (studentProfile?.first_name) return studentProfile.first_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return `Student ${user.email.split("@")[0]}`;
    return "Student";
  }, [user, studentProfile]);

  const userTitle = useMemo(() => {
    if (studentProfile?.gender === "Male") return "Mr.";
    if (studentProfile?.gender === "Female") return "Ms.";
    return "";
  }, [studentProfile]);

  const fullDisplayName = useMemo(() => {
    return userTitle ? `${userTitle} ${displayName}` : displayName;
  }, [userTitle, displayName]);

  const fallbackName = useMemo(() => {
    return (
      (studentProfile?.first_name && studentProfile?.last_name
        ? `${studentProfile.first_name} ${studentProfile.last_name}`
        : null) ||
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "Student"
    );
  }, [studentProfile, user]);

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    fallbackName
  )}&background=0D8ABC&color=fff&size=128`;

  const formattedProgram = useMemo(() => {
    return getProgramWithAbbreviation(
      studentProfile?.program || "Information Technology",
      studentProfile?.type
    );
  }, [studentProfile?.program, studentProfile?.type]);

  return (
    <View style={{ flex: 1, backgroundColor: "#1075E9" }}>
      <StatusBar backgroundColor="#1075E9" barStyle="light-content" />
      <SafeAreaView style={styles.wrapper}>
        <LinearGradient
          colors={["#1075E9", "rgba(25, 46, 235, 0.9)"]}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.leftHeader}>
              <View style={styles.profileImageContainer}>
                <Image
                  source={
                    profileImage ? { uri: profileImage } : { uri: avatarUrl }
                  }
                  style={styles.profileImage}
                />
              </View>
              <View style={styles.greetings}>
                <Text style={styles.mainGreetings}>Welcome</Text>
                <Text style={styles.userName}>{fullDisplayName}</Text>
              </View>
            </View>
            <View style={styles.rightHeader}>
              <Pressable
                style={styles.iconButton}
                onPress={() => router.push("/screens/notifications")}
              >
                <View>
                  <BellIcon />
                  {unreadCount > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationCount}>
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
              <Pressable style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons
                  name="power-outline"
                  size={22}
                  color="rgb(219, 3, 43)"
                />
              </Pressable>
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#3372EF"]}
            />
          }
        >
          <View style={styles.programCard}>
            <View style={styles.programHeader}>
              <View>
                <Text style={styles.programLabel}>PROGRAM</Text>
                <Text style={styles.programTitle}>{formattedProgram}</Text>
              </View>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>
                  Level {studentProfile?.level || "200"}
                </Text>
              </View>
            </View>
            <View style={styles.semesterInfo}>
              <View style={styles.semesterDetail}>
                <Text style={styles.semesterLabel}>Current Semester</Text>
                <Text style={styles.semesterText}>
                  <AcademicYear /> - Semester{" "}
                  {studentProfile?.current_semester || "1"}
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {studentProfile?.status || "Active"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatCard
              icon={<GpaIcon />}
              label="CGPA"
              value={studentProfile?.cgpa || "3.75"}
              bgColor="#e0e7ff"
            />
            <StatCard
              icon={<CreditsIcon />}
              label="Credits"
              value={<Credits mountedCourses={mountedCourses} />}
              bgColor="#d1fae5"
            />
          </View>

          <View style={styles.quickAccessSection}>
            <Text style={styles.sectionTitle}>Quick access</Text>
            <View style={styles.coursesContainer}>
              {quickAccessContents.map((quickAccessContent, index) => (
                <QuickAccess key={index} {...quickAccessContent} />
              ))}
            </View>
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
}

// Styles remain unchanged
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#1075E9",
  },
  headerGradient: {
    paddingBottom: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  greetings: {
    marginLeft: 16,
  },
  mainGreetings: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 4,
  },
  rightHeader: {
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
  logoutButton: {
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
    borderTopRightRadius: 24,
    backgroundColor: "#f9fafb",
    marginTop: -15,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  programCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.1)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  programHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  programLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(0, 0, 0, 0.5)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginTop: 4,
  },
  levelBadge: {
    backgroundColor: "#e0e7ff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4338ca",
  },
  semesterInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  semesterDetail: {},
  semesterLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(0, 0, 0, 0.5)",
  },
  semesterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: "rgba(5, 150, 105, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgb(5, 150, 105)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    width: width * 0.43,
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.05)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  statContent: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    height: 90,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statTextContainer: {
    position: "relative",
    width: "100%",
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: 5,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 2,
  },
  quickAccessSection: {
    marginBottom: 20,
  },
  coursesContainer: {
    marginBottom: 45,
  },
  courseCard: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.05)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  courseCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 0.3,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  courseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  courseCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
  },
  courseCardArrow: {
    marginLeft: 12,
  },
  pressedCard: {
    opacity: 0.8,
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationCount: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
