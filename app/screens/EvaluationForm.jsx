import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RadioButton } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";


const RATING_OPTIONS = [
  { value: 5, label: "Excellent" },
  { value: 4, label: "Very Good" },
  { value: 3, label: "Good" },
  { value: 2, label: "Fair" },
  { value: 1, label: "Poor" },
];


const EvaluationForm = () => {
  const params = useLocalSearchParams();
  const course = params.course ? JSON.parse(params.course) : null;
  const router = useRouter();


  const [formData, setFormData] = useState({
    teaching: null,
    preparedness: null,
    courseContent: null,
    availability: null,
    communication: null,
    comments: "",
  });

  const [formErrors, setFormErrors] = useState({
    teaching: false,
    preparedness: false,
    courseContent: false,
    availability: false,
    communication: false,
  });

  const updateRating = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    // Clear error for this field if set
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: false,
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Check if all ratings are selected
    Object.keys(formData).forEach((key) => {
      if (key !== "comments" && formData[key] === null) {
        errors[key] = true;
        isValid = false;
      }
    });

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert(
        "Incomplete Form",
        "Please provide ratings for all questions before submitting."
      );
      return;
    }

    // Show confirmation dialog
    Alert.alert(
      "Submit Evaluation",
      "Are you sure you want to submit this evaluation? You won't be able to edit it after submission.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Submit",
          onPress: () => {
            // In a real app, you would send this data to your API
            console.log("Submitting evaluation:", formData);

            Alert.alert(
              "Success",
              "Your evaluation has been submitted successfully!",
              [
                {
                  text: "OK",
                  onPress: () => {
                    // Mark the course as evaluated in parent component
                    if (course && course.id) {
                      // Update the parent's state
                      router.navigate({
                        pathname: "LectureEvaluation",
                        params: { evaluatedCourseId: course.id },
                      });
                    } else {
                      router.back();
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const renderRatingOptions = (field) => (
    <View style={styles.ratingContainer}>
      {RATING_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.ratingOption,
            formData[field] === option.value && styles.selectedRating,
            formErrors[field] && styles.errorBorder,
          ]}
          onPress={() => updateRating(field, option.value)}
        >
          <RadioButton
            value={option.value}
            status={formData[field] === option.value ? "checked" : "unchecked"}
            onPress={() => updateRating(field, option.value)}
            color="#004080"
          />
          <Text style={styles.ratingLabel}>{option.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#003366" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Course Evaluation</Text>
      </View>

      <ScrollView style={styles.formContainer}>
        <View style={styles.courseInfoCard}>
          <Text style={styles.courseCode}>{course.courseCode}</Text>
          <Text style={styles.courseName}>{course.courseName}</Text>
          <Text style={styles.lecturerName}>Lecturer: {course.lecturer}</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.formTitle}>
            Please rate the following aspects:
          </Text>

          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>
              1. How would you rate the lecturer's teaching effectiveness?
            </Text>
            {renderRatingOptions("teaching")}
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>
              2. How well-prepared was the lecturer for classes?
            </Text>
            {renderRatingOptions("preparedness")}
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>
              3. How relevant and organized was the course content?
            </Text>
            {renderRatingOptions("courseContent")}
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>
              4. How accessible was the lecturer for questions outside class?
            </Text>
            {renderRatingOptions("availability")}
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>
              5. How clear was the lecturer's communication?
            </Text>
            {renderRatingOptions("communication")}
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>
              6. Additional comments or suggestions (optional):
            </Text>
            <TextInput
              style={styles.commentInput}
              multiline
              numberOfLines={4}
              placeholder="Enter your comments here..."
              value={formData.comments}
              onChangeText={(text) =>
                setFormData({ ...formData, comments: text })
              }
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Evaluation</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#003366",
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight || 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  courseInfoCard: {
    backgroundColor: "#e6f2ff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#004080",
  },
  courseCode: {
    fontSize: 14,
    fontWeight: "700",
    color: "#003366",
  },
  courseName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 4,
  },
  lecturerName: {
    fontSize: 16,
    color: "#333",
    marginTop: 4,
  },
  formSection: {
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
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: "column",
  },
  ratingOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  selectedRating: {
    backgroundColor: "#e6f2ff",
    borderColor: "#004080",
  },
  errorBorder: {
    borderColor: "#ff6b6b",
  },
  ratingLabel: {
    fontSize: 16,
    marginLeft: 8,
    color: "#333",
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#004080",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EvaluationForm;
