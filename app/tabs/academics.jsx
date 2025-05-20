import {
  Pressable,
  StyleSheet,
  Text,
  View,
  FlatList,
  Platform,
  StatusBar,
  RefreshControl,
} from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import ConfirmationModal from "../components/ConfirmationModal";
import { Alert } from "react-native";

export const Credits = ({ mountedCourses = [] }) => {
  const calculateTotalCredits = () => {
    const totalCredits = mountedCourses.reduce((sum, course) => {
      const creditHours = parseInt(course.credit) || 0;
      return sum + creditHours;
    }, 0);
    return totalCredits;
  };

  const totalCredits = calculateTotalCredits();
  return <Text>{totalCredits}</Text>;
};

const Academics = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const {
    user,
    studentProfile,
    fetchStudentProfile,
    mountedCourses,
    loading,
    signOut,
  } = useAuth();
  const initialSection = params.section || "Courses";
  const [activeOption, setActiveOption] = useState(initialSection);
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (params.section) {
      setActiveOption(params.section);
    }
  }, [params.section]);

  useEffect(() => {
    if (user && !studentProfile) {
      fetchStudentProfile(user.id);
    }
  }, [user, studentProfile, fetchStudentProfile]);

  const handleSelect = (option) => {
    setActiveOption(option);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (user) {
        await fetchStudentProfile(user.id);
      }
    } catch (error) {
      console.error("Error refreshing data:", error.message);
    } finally {
      setTimeout(() => setRefreshing(false), 1500);
    }
  }, [user, fetchStudentProfile]);

  const handleRegisterCourse = (courseCode) => {
    if (registeredCourses.includes(courseCode)) {
      setRegisteredCourses(
        registeredCourses.filter((code) => code !== courseCode)
      );
    } else {
      setRegisteredCourses([...registeredCourses, courseCode]);
    }
  };

  const handleSelectAll = () => {
    if (registeredCourses.length === mountedCourses.length) {
      setRegisteredCourses([]);
    } else {
      setRegisteredCourses(mountedCourses.map((course) => course.code));
    }
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

  const areAllCoursesSelected =
    registeredCourses.length === mountedCourses.length;

  const CourseCard = React.memo(({ title, code, credit }) => {
    const isRegistered = registeredCourses.includes(code);

    return (
      <View style={styles.courseCard}>
        <View style={styles.codeContainer}>
          <Text style={styles.courseCode}>{code}</Text>
        </View>
        <View style={styles.courseDetails}>
          <Text style={styles.courseTitle}>{title}</Text>
          <Text style={styles.creditHours}>{credit}</Text>
        </View>
        <Pressable
          style={[
            styles.registerButton,
            isRegistered && styles.registeredButton,
          ]}
          onPress={() => handleRegisterCourse(code)}
        >
          <Ionicons
            name={isRegistered ? "checkmark-circle" : "add-circle-outline"}
            size={24}
            color={isRegistered ? "#fff" : "rgb(71, 131, 235)"}
          />
        </Pressable>
      </View>
    );
  });

  const SelectAllHeader = () => (
    <View style={styles.selectAllContainer}>
      <Text style={styles.selectAllText}>
        {`${registeredCourses.length} of ${mountedCourses.length} Courses Selected`}
      </Text>
      <Pressable
        style={[
          styles.selectAllButton,
          areAllCoursesSelected && styles.selectAllActive,
        ]}
        onPress={handleSelectAll}
      >
        <Text
          style={[
            styles.selectAllButtonText,
            areAllCoursesSelected && styles.selectAllButtonTextActive,
          ]}
        >
          {areAllCoursesSelected ? "Deselect All" : "Select All"}
        </Text>
      </Pressable>
    </View>
  );

  const renderContent = () => {
    switch (activeOption) {
      case "Courses":
        if (loading || !studentProfile) {
          return (
            <View style={styles.emptyContent}>
              <Text style={styles.emptyText}>
                {loading ? "Loading courses..." : "Fetching profile..."}
              </Text>
            </View>
          );
        }
        return (
          <FlatList
            data={mountedCourses}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <CourseCard
                title={item.title}
                code={item.code}
                credit={item.credit}
              />
            )}
            ListHeaderComponent={<SelectAllHeader />}
            ListHeaderComponentStyle={styles.listHeader}
            contentContainerStyle={styles.coursesList}
            showsVerticalScrollIndicator={false}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={5}
            bounces={true}
            overScrollMode="always"
            decelerationRate={Platform.OS === "ios" ? "normal" : 0.98}
            ListFooterComponent={<View style={{ height: 100 }} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["rgb(71, 131, 235)"]}
                tintColor="rgb(71, 131, 235)"
                title="Refreshing..."
                titleColor="rgb(71, 131, 235)"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContent}>
                <Text style={styles.emptyText}>
                  No mounted courses available for your program and level this
                  semester.
                </Text>
              </View>
            }
          />
        );
      case "Exams":
        return (
          <View style={styles.emptyContent}>
            <Text style={styles.emptyText}>
              Exam timetable will appear here
            </Text>
          </View>
        );
      case "Results":
        return (
          <View style={styles.emptyContent}>
            <Text style={styles.emptyText}>Your results will appear here</Text>
          </View>
        );
      default:
        return null;
    }
  };

  if (!user) {
    router.replace("/login");
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <LinearGradient
        colors={["#3E6993", "#3E6993"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Academics</Text>
          <View style={styles.headerIcons}>
            <Pressable
              style={styles.iconButton}
              onPress={() => router.push("/screens/notifications")}
            >
              <Ionicons name="notifications-outline" size={22} color="#fff" />
            </Pressable>
            <Pressable style={styles.iconButton} onPress={handleLogout}>
              <Ionicons
                name="power-outline"
                size={22}
                color="rgb(219, 3, 43)"
              />
            </Pressable>
          </View>
        </View>
        <View style={styles.noteWrapper}>
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color="rgb(254, 178, 0)"
          />
          <Text style={styles.noteText}>
            Register courses, view exams timetable, and results
          </Text>
        </View>
      </LinearGradient>

      <SafeAreaView style={styles.wrapper} edges={["left", "right", "bottom"]}>
        <View style={styles.selectBox}>
          {["Courses", "Exams", "Results"].map((option) => (
            <Pressable
              key={option}
              style={[
                styles.selectOption,
                activeOption === option && styles.active,
              ]}
              onPress={() => handleSelect(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  activeOption === option && styles.activeText,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.content}>{renderContent()}</View>
      </SafeAreaView>

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

export default Academics;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  wrapper: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
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
  noteWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 15,
    left: -5,
  },
  noteText: {
    color: "rgb(255, 255, 255)",
    fontWeight: "300",
    fontSize: 13,
    fontFamily: "calibri",
  },
  selectBox: {
    flexDirection: "row",
    alignSelf: "center",
    width: "80%",
    height: 50,
    backgroundColor: "rgb(214, 219, 227)",
    borderWidth: 0.3,
    borderColor: "rgba(0,0,0,0.4)",
    marginTop: 10,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 2,
  },
  selectOption: {
    flex: 1,
    borderRightWidth: 0.5,
    borderColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: {
    textAlign: "center",
    color: "rgb(71, 131, 235)",
    fontSize: 15,
    fontWeight: "600",
  },
  active: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  activeText: {
    color: "white",
  },
  content: {
    flex: 1,
    backgroundColor: "rgb(241, 241, 241)",
    padding: 16,
  },
  coursesList: {
    paddingBottom: 20,
  },
  selectAllContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  selectAllText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  selectAllButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgb(71, 131, 235)",
  },
  selectAllActive: {
    backgroundColor: "rgba(21, 113, 38, 0.63)",
  },
  selectAllButtonText: {
    color: "rgb(71, 131, 235)",
    fontWeight: "600",
    fontSize: 14,
  },
  selectAllButtonTextActive: {
    color: "#fff",
  },
  listHeader: {
    marginBottom: 8,
  },
  courseCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: "hidden",
    borderLeftWidth: 4,
    borderLeftColor: "rgb(6, 88, 160)",
    height: 80,
  },
  codeContainer: {
    backgroundColor: "rgba(6, 88, 160, 0.1)",
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
  },
  courseCode: {
    fontWeight: "bold",
    color: "rgb(6, 88, 160)",
    textAlign: "center",
    fontSize: 15,
  },
  courseDetails: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  creditHours: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  registerButton: {
    backgroundColor: "#f2f2f2",
    width: 44,
    height: 44,
    borderRadius: 22,
    margin: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  registeredButton: {
    backgroundColor: "rgba(21, 113, 38, 0.63)",
  },
  emptyContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    fontStyle: "italic",
  },
});
