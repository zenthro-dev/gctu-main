import { supabase } from "./supabase";
import { Alert } from "react-native";

/**
 * Custom sign-in function that supports both index number and email
 * @param {string} identifier - Either index number or email
 * @param {string} password - User password
 */
export const customSignIn = async (identifier, password) => {
  try {
    let email = identifier;

    // Check if the identifier is an index number without email domain
    if (!identifier.includes("@")) {
      // Convert index number to email format
      email = `${identifier}@live.gctu.edu.gh`;
    }

    // Attempt to sign in with the email
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign in error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    console.error("Authentication error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Create a new student user in Supabase
 * @param {string} indexNumber - Student index number
 * @param {string} password - User password
 * @param {string} firstName - Student's first name
 * @param {string} lastName - Student's last name
 * @param {string} [otherInfo] - Additional student info
 */
export const createStudent = async (
  indexNumber,
  password,
  firstName,
  lastName,
  otherInfo = {}
) => {
  try {
    // Create the email from the index number
    const email = `${indexNumber}@live.gctu.edu.gh`;

    // Step 1: Create the auth user
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm the email
      });

    if (authError) {
      console.error("User creation error:", authError.message);
      return { success: false, error: authError.message };
    }

    // Step 2: Create a student profile in a custom table
    const { data: profileData, error: profileError } = await supabase
      .from("students")
      .insert([
        {
          id: authData.user.id,
          index_number: indexNumber,
          email,
          first_name: firstName,
          last_name: lastName,
          ...otherInfo,
        },
      ]);

    if (profileError) {
      console.error("Profile creation error:", profileError.message);
      // If profile creation fails, we should ideally delete the auth user
      // but that would require admin privileges
      return { success: false, error: profileError.message };
    }

    return { success: true, user: authData.user };
  } catch (error) {
    console.error("User creation error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Admin function to bulk import students
 * @param {Array} students - Array of student objects
 */
export const bulkImportStudents = async (students) => {
  const results = {
    successful: [],
    failed: [],
  };

  for (const student of students) {
    const { indexNumber, password, firstName, lastName, ...otherInfo } =
      student;

    const result = await createStudent(
      indexNumber,
      password,
      firstName,
      lastName,
      otherInfo
    );

    if (result.success) {
      results.successful.push(indexNumber);
    } else {
      results.failed.push({ indexNumber, error: result.error });
    }
  }

  return results;
};
