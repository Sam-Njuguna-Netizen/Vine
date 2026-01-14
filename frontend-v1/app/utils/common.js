/**
 * Checks if all fields in an object have values, skipping specified fields.
 * @param {Object} obj - The object to check.
 * @param {Array} skipFields - Array of fields to skip during the check.
 * @returns {Object} - Returns `{ success: true }` if valid, otherwise `{ success: false, message: "Data is required" }`.
 */
import axios from "../api/axios";

// export const checkObjectFields = (obj, skipFields = []) => {
//     if (!obj || typeof obj !== 'object') {
//       return { success: false, message: "Invalid input, object is required" };
//     }

//     for (const key in obj) {
//       if (skipFields?.includes(key)) {
//         continue; // Skip checking for fields in skipFields
//       }

//       const value = obj[key];

//       // Check if the value is null, undefined, or an empty string
//       if (value === null || value === undefined || value === '') {
//         return { success: false, message: `${key} is required` };
//       }

//       // Check if the value is an empty array
//       if (Array.isArray(value) && value.length === 0) {
//         return { success: false, message: `${key} cannot be empty` };
//       }

//       // If the value is an object, recursively check its fields
//       if (typeof value === 'object' && !Array.isArray(value)) {
//         const nestedCheck = checkObjectFields(value);
//         if (!nestedCheck.success) {
//           return nestedCheck;
//         }
//       }
//     }

//     return { success: true };
//   };

export const checkObjectFields = (obj, requiredFieldsMap = []) => {
  // Iterate over the fields that are specified as required.
  const objectKeys = Object.keys(obj);
  for (const field of requiredFieldsMap) {
    if (!objectKeys.includes(field)) {
      return {
        success: false,
        message: `${field} is required.`,
      };
    }
  }
  for (const key of objectKeys) {
    const value = obj[key];
    if (value === null || value === undefined || value === "") {
      return {
        success: false,
        message: `${key} is required.`,
      };
    }
  }
  // 3. If the loop completes without returning, all checks passed.
  return {
    success: true,
    message: "All required fields are present.",
  };
};
export const deleteFile = async (path) => {
  try {
    const response = await axios.delete(`/api/deleteFile?fileName=${path}`);
    console.log("File deleted successfully", response);
  } catch (error) {
    console.log("errro deleting file");
    if (isAxiosError(error)) {
      console.log(error.response);
    }
  }
};

export const handleMultipleDocumentUpload = async (
  files,
  folder = "Default"
) => {
  const formData = new FormData();

  Array.from(files).forEach((file) => {
    formData.append("files", file); // 'files' matches Adonis request.files('files')
  });

  formData.append("folder", folder);

  try {
    const response = await axios.post("/api/uploadMultiple", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status === 200) {
      // Axios automatically parses JSON response
      return { success: true, files: response.data.files };
    } else {
      console.error("Error uploading files");
      return { success: false };
    }
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, error };
  }
};
