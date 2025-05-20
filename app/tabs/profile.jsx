import React, { useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  RefreshControl,
  Dimensions,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import BellIcon from "../../assets/SVG/bell";
import ConfirmationModal from "../components/ConfirmationModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationsContext";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const Profile = () => {
  const {
    signOut,
    user,
    studentProfile,
    fetchStudentProfile,
    profileImage,
    setProfileImage,
  } = useAuth();
  const [expandedCard, setExpandedCard] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    announcements,
    fetchNotifications,
    fetchAnnouncements,
  } = useNotifications();

  const scrollViewRef = useRef(null);

  const displayName =
    studentProfile?.first_name && studentProfile?.last_name
      ? `${studentProfile.first_name} ${studentProfile.last_name}`
      : user?.email
        ? user.email.split("@")[0]
        : "Student";

  const avatarName =
    studentProfile?.first_name && studentProfile?.last_name
      ? `${studentProfile.first_name}+${studentProfile.last_name}`
      : studentProfile?.first_name
        ? studentProfile.first_name
        : displayName;

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    avatarName
  )}&background=298CFE&color=fff&size=128`;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (user?.id) {
        await Promise.all([
          fetchStudentProfile(user.id),
          fetchNotifications(),
          fetchAnnouncements(),
        ]);
      }
    } catch (error) {
      console.error("Error refreshing data:", error.message);
    } finally {
      setRefreshing(false);
    }
  }, [user, fetchStudentProfile, fetchNotifications, fetchAnnouncements]);

  const toggleCard = (cardName) => {
    if (expandedCard === cardName) {
      setExpandedCard(null);
    } else {
      setExpandedCard(cardName);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: cardName === "Student Info" ? 0 : 150,
          animated: true,
        });
      }, 100);
    }
  };

  const handleLogout = () => {
    setModalVisible(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut();
      await AsyncStorage.removeItem("authToken");
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

  const renderCardContent = (title) => {
    switch (title) {
      case "Student Info":
        return (
          <View style={styles.cardContent}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{displayName}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoValue}>
                {studentProfile?.date_of_birth || "Not set"}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Program</Text>
              <Text style={styles.infoValue}>
                {studentProfile?.program || "Not set"}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Session</Text>
              <Text style={styles.infoValue}>
                {studentProfile?.session || "Not set"}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Personal Email</Text>
              <Text style={styles.infoValue}>
                {studentProfile?.personal_email || user?.email || "Not set"}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Phone number</Text>
              <Text style={styles.infoValue}>
                {studentProfile?.phone_number || "Not set"}
              </Text>
            </View>
          </View>
        );
      case "Documents":
        return (
          <View style={styles.cardContent}>
            <TouchableOpacity style={styles.documentItem}>
              <MaterialCommunityIcons
                name="certificate"
                size={22}
                color="#298CFE"
              />
              <Text style={styles.documentText}>Official Admission Letter</Text>
              <Feather name="download" size={18} color="#298CFE" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.documentItem}>
              <MaterialCommunityIcons
                name="book-open-variant"
                size={22}
                color="#298CFE"
              />
              <Text style={styles.documentText}>Matriculation Oath</Text>
              <Feather name="download" size={18} color="#298CFE" />
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  const renderCard = (title, icon) => {
    const isExpanded = expandedCard === title;
    return (
      <View style={styles.cardWrapper} key={title}>
        <TouchableOpacity
          style={[styles.cardHeader, isExpanded && styles.cardHeaderActive]}
          onPress={() => toggleCard(title)}
          activeOpacity={0.7}
        >
          <View style={styles.cardTitleContainer}>
            {icon}
            <Text style={[styles.cardTitle, isExpanded && { color: "#FFF" }]}>
              {title}
            </Text>
          </View>
          <Feather
            name="chevron-down"
            size={22}
            color={isExpanded ? "#fff" : "#298CFE"}
            style={{ transform: [{ rotate: isExpanded ? "180deg" : "0deg" }] }}
          />
        </TouchableOpacity>
        {isExpanded && renderCardContent(title)}
      </View>
    );
  };

  const cards = [
    {
      title: "Student Info",
      icon: (
        <MaterialCommunityIcons
          name="account-details"
          size={22}
          color={expandedCard === "Student Info" ? "#fff" : "#298CFE"}
        />
      ),
    },
    {
      title: "Documents",
      icon: (
        <MaterialCommunityIcons
          name="file-document-multiple-outline"
          size={22}
          color={expandedCard === "Documents" ? "#fff" : "#298CFE"}
        />
      ),
    },
  ];

  const statsItems = [
    {
      title: "Courses",
      value: studentProfile?.courses_count || "0",
      icon: "book-outline",
    },
    {
      title: "GPA",
      value: studentProfile?.cgpa || "0.0",
      icon: "school-outline",
    },
    {
      title: "Attendance",
      value: studentProfile?.attendance || "0%",
      icon: "time-outline",
    },
  ];

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.profileName}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <LinearGradient
          colors={["#2563EB", "#3B82F6", "#60A5FA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileHeader}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push("/screens/notifications")}
              >
                <BellIcon />
                {unreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationCount}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Text>
                  </View>
                )}
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

          <View style={styles.profileImageContainer}>
            <Image
              source={profileImage ? { uri: profileImage } : { uri: avatarUrl }}
              style={styles.profileImage}
            />
          </View>
          <Text style={styles.profileName}>{displayName}</Text>
          <View style={styles.profileBadge}>
            <Text style={styles.profileBadgeText}>
              {studentProfile?.program || "Not set"}
            </Text>
          </View>
          <Text style={styles.profileId}>
            ID: {studentProfile?.index_number || "Not set"}
          </Text>
        </LinearGradient>

        <View style={styles.statsContainer}>
          {statsItems.map((item, index) => (
            <View key={index} style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name={item.icon} size={22} color="#298CFE" />
              </View>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statTitle}>{item.title}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        style={styles.scrollableContent}
        contentContainerStyle={styles.scrollContentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3372EF"]}
          />
        }
      >
        <View style={styles.cardsContainer}>
          {cards.map((card) => renderCard(card.title, card.icon))}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("./change-password")}
          >
            <Feather name="lock" size={18} color="#FFF" />
            <Text style={styles.actionButtonText}>Change Password</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 30 }} />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  profileSection: {
    width: "100%",
  },
  profileHeader: {
    position: "relative",
    paddingTop: Platform.OS === "ios" ? 45 : 40,
    paddingBottom: 30,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    height: Platform.OS === "ios" ? "63%" : "64%",
  },
  header: {
    height: 50,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  notificationCount: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  profileImageContainer: {
    position: "relative",
    marginTop: 0,
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.8)",
    resizeMode: "cover",
  },
  profileName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFF",
    bottom: 10,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  profileBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  profileBadgeText: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "500",
  },
  profileId: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: -20,
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0,0,0,0.1)",
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 15,
        shadowOpacity: 1,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(41, 140, 254, 0.1)",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    color: "#666",
  },
  scrollableContent: {
    flex: 1,
    marginTop: -115,
    backgroundColor: "#F9FAFB",
  },
  scrollContentContainer: {
    paddingTop: 10,
    paddingBottom: 60,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  cardWrapper: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#FFF",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0,0,0,0.1)",
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 10,
        shadowOpacity: 1,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFF",
  },
  cardHeaderActive: {
    backgroundColor: "#298CFE",
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
    color: "#333",
  },
  cardContent: {
    padding: 16,
    backgroundColor: "#F9FAFB",
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  infoValue: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "500",
    maxWidth: width * 0.5,
    textAlign: "right",
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  documentText: {
    fontSize: 14,
    flex: 1,
    marginLeft: 10,
    color: "#1E293B",
  },
  actionsContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 5,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#298CFE",
    borderRadius: 12,
    paddingVertical: 12,
    flex: 0.48,
  },
  actionButtonText: {
    color: "#FFF",
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default Profile;
