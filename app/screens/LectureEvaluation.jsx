import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Modal,
  Pressable,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const LectureEvaluation = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedYear, setSelectedYear] = useState("2024/2025");
  const [selectedSemester, setSelectedSemester] = useState("First Semester");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(""); // "year" or "semester"
  const router = useRouter();
  const params = useLocalSearchParams();

  // Sample data for courses and lecturers
  const SAMPLE_DATA = [
    {
      id: "1",
      courseCode: "CSC101",
      courseName: "Introduction to Computer Science",
      lecturer: "Dr. John Smith",
      evaluated: false,
      academicYear: "2024/2025",
      semester: "First Semester",
    },
    {
      id: "2",
      courseCode: "MTH201",
      courseName: "Advanced Calculus",
      lecturer: "Prof. Maria Johnson",
      evaluated: false,
      academicYear: "2024/2025",
      semester: "First Semester",
    },
    {
      id: "3",
      courseCode: "PHY102",
      courseName: "Physics for Engineers",
      lecturer: "Dr. Robert Williams",
      evaluated: false,
      academicYear: "2024/2025",
      semester: "First Semester",
    },
    {
      id: "4",
      courseCode: "ENG201",
      courseName: "Technical Communication",
      lecturer: "Dr. Emma Brown",
      evaluated: false,
      academicYear: "2023/2024",
      semester: "Second Semester",
    },
    {
      id: "5",
      courseCode: "CSC202",
      courseName: "Data Structures",
      lecturer: "Prof. Michael Chen",
      evaluated: false,
      academicYear: "2023/2024",
      semester: "Second Semester",
    },
  ];

  const academicYears = ["2023/2024", "2024/2025"];
  const semesters = ["First Semester", "Second Semester"];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      // Deep copy the SAMPLE_DATA to preserve evaluation status
      const initialCourses = JSON.parse(JSON.stringify(SAMPLE_DATA));
      setCourses(initialCourses);
      const filtered = initialCourses.filter(
        (course) =>
          course.academicYear === selectedYear &&
          course.semester === selectedSemester
      );
      setFilteredCourses(filtered);
      setLoading(false);
    }, 1000);
  }, [selectedYear, selectedSemester]);

  // Fixed useEffect for handling course evaluation status
  useEffect(() => {
    if (params.evaluatedCourseId) {
      // Create a deep copy to ensure we're properly updating state
      const updatedCourses = JSON.parse(JSON.stringify(courses));
      const courseIndex = updatedCourses.findIndex(
        (course) => course.id === params.evaluatedCourseId
      );

      if (courseIndex !== -1) {
        updatedCourses[courseIndex].evaluated = true;
        setCourses(updatedCourses);

        // Update filtered courses to reflect the change immediately
        const newFilteredCourses = updatedCourses.filter(
          (course) =>
            course.academicYear === selectedYear &&
            course.semester === selectedSemester
        );

        setFilteredCourses(newFilteredCourses);
      }
    }
  }, [params.evaluatedCourseId, courses]);

  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const selectOption = (value) => {
    if (modalType === "year") {
      setSelectedYear(value);
    } else if (modalType === "semester") {
      setSelectedSemester(value);
    }
    closeModal();
  };

  const navigateToEvaluationForm = (course) => {
    router.push({
      pathname: "/screens/EvaluationForm",
      params: {
        course: JSON.stringify(course),
      },
    });
  };

  const renderCourseItem = ({ item }) => (
    <View style={styles.courseCard}>
      <View style={styles.courseInfo}>
        <Text style={styles.courseCode}>{item.courseCode}</Text>
        <Text style={styles.courseName}>{item.courseName}</Text>
        <Text style={styles.lecturerName}>{item.lecturer}</Text>
      </View>
      <View style={styles.actionContainer}>
        {item.evaluated ? (
          <View style={styles.evaluatedBadge}>
            <Text style={styles.evaluatedText}>Evaluated</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.evaluateButton}
            onPress={() => navigateToEvaluationForm(item)}
          >
            <Text style={styles.evaluateButtonText}>Evaluate</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  function handleBack() {
    router.back();
  }

  // Platform-specific modal rendering
  const renderModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}
      presentationStyle={Platform.OS === "ios" ? "overFullScreen" : "overFullScreen"}
    >
      <TouchableWithoutFeedback onPress={closeModal}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Select {modalType === "year" ? "Academic Year" : "Semester"}
                </Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={24} color="#003366" />
                </TouchableOpacity>
              </View>

              {Platform.OS === "ios" && <View style={styles.modalIndicator} />}

              <View style={styles.modalContent}>
                {modalType === "year"
                  ? academicYears.map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.modalOption,
                          selectedYear === year && styles.selectedOption,
                        ]}
                        onPress={() => selectOption(year)}
                      >
                        <Text
                          style={[
                            styles.modalOptionText,
                            selectedYear === year && styles.selectedOptionText,
                          ]}
                        >
                          {year}
                        </Text>
                        {selectedYear === year && (
                          <Ionicons name="checkmark" size={20} color="#fff" />
                        )}
                      </TouchableOpacity>
                    ))
                  : semesters.map((semester) => (
                      <TouchableOpacity
                        key={semester}
                        style={[
                          styles.modalOption,
                          selectedSemester === semester &&
                            styles.selectedOption,
                        ]}
                        onPress={() => selectOption(semester)}
                      >
                        <Text
                          style={[
                            styles.modalOptionText,
                            selectedSemester === semester &&
                              styles.selectedOptionText,
                          ]}
                        >
                          {semester}
                        </Text>
                        {selectedSemester === semester && (
                          <Ionicons name="checkmark" size={20} color="#fff" />
                        )}
                      </TouchableOpacity>
                    ))}
              </View>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={closeModal}
              >
                <Text style={styles.modalCloseButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#003366" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back-outline" color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lecture Evaluation</Text>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Academic Year:</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => openModal("year")}
          >
            <Text style={styles.pickerButtonText}>{selectedYear}</Text>
            <Ionicons name="chevron-down" size={20} color="#003366" />
          </TouchableOpacity>
        </View>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Semester:</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => openModal("semester")}
          >
            <Text style={styles.pickerButtonText}>{selectedSemester}</Text>
            <Ionicons name="chevron-down" size={20} color="#003366" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#003366" />
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          style={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No courses available for the selected filters.
            </Text>
          }
        />
      )}

      {/* Render the modal with platform-specific adjustments */}
      {renderModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    position: "relative",
    backgroundColor: "#003366",
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    width: "100%",
    justifyContent: "flex-start",
    gap: "14%",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  filterContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterItem: {
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f9f9f9",
  },
  pickerButtonText: {
    fontSize: 16,
    color: "#333",
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 20,
  },
  courseCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  courseInfo: {
    flex: 1,
  },
  courseCode: {
    fontSize: 14,
    fontWeight: "700",
    color: "#003366",
  },
  courseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 4,
  },
  lecturerName: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  actionContainer: {
    marginLeft: 16,
  },
  evaluateButton: {
    backgroundColor: "#004080",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  evaluateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  evaluatedBadge: {
    backgroundColor: "#e6f2ff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#004080",
  },
  evaluatedText: {
    color: "#004080",
    fontSize: 14,
    fontWeight: "600",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 40,
  },
  // Enhanced Modal Styles for iOS compatibility
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "100%",
    maxHeight: "80%",
  },
  modalIndicator: {
    width: 40,
    height: 5,
    backgroundColor: "#e0e0e0",
    borderRadius: 2.5,
    alignSelf: "center",
    marginBottom: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#003366",
  },
  modalContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    maxHeight: Platform.OS === "ios" ? 300 : undefined,
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginVertical: 2,
    borderRadius: 8,
  },
  selectedOption: {
    backgroundColor: "#004080",
    borderRadius: 8,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedOptionText: {
    color: "#fff",
  },
  modalCloseButton: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
    marginHorizontal: 20,
  },
  modalCloseButtonText: {
    color: "#003366",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default LectureEvaluation;