import axios from '@/app/api/axios';

export const calculateGrade = (score, totalQuestions) => {
  if (totalQuestions <= 0) {
    return "Invalid total questions! It must be greater than zero.";
  }

  let percentage = (score / totalQuestions) * 100;

  if (percentage >= 90 && percentage <= 100) {
    return `A (Excellent) - ${percentage.toFixed(2)}%`;
  } else if (percentage >= 80) {
    return `B (Good) - ${percentage.toFixed(2)}%`;
  } else if (percentage >= 70) {
    return `C (Average) - ${percentage.toFixed(2)}%`;
  } else if (percentage >= 60) {
    return `D (Below Average, but still passing) - ${percentage.toFixed(2)}%`;
  } else if (percentage < 60 && percentage >= 0) {
    return `F (Failing) - ${percentage.toFixed(2)}%`;
  } else {
    return "Invalid score! Please enter a valid number.";
  }
};

export function getOrdinalSuffix(number) {
  const ordinalRules = new Intl.PluralRules("en", { type: "ordinal" });
  const suffixes = { one: "st", two: "nd", few: "rd", other: "th" };

  return number + (suffixes[ordinalRules.select(number)] || "th");
}

export const allCategories = async () => {
  try {
    const response = await axios.get('/api/courseCategory');

    if (response.data) {
      return { success: true, categories: response.data };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.errors
          ? error.response.data.errors.join(', ')
          : 'Something went wrong. Please try again.',
    };
  }
};

export const AllCourse = async (paramsData = {}) => {
  try {
    const response = await axios.get('/api/allCourse', {
      params: paramsData,
    });

    if (response.data) {
      return { success: true, courses: response.data };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.errors
          ? error.response.data.errors.join(', ')
          : 'Something went wrong. Please try again.',
    };
  }
};

export const MyAllCourse = async (paramsData = {}) => {
  try {
    const response = await axios.get('/api/myAllCourse', {
      params: paramsData,
    });

    if (response.data) {
      return { success: true, courses: response.data };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.errors
          ? error.response.data.errors.join(', ')
          : 'Something went wrong. Please try again.',
    };
  }
};

export const addCategory = async (newData) => {
  try {
    const response = await axios.post('/api/courseCategory', newData);

    if (response.data) {
      return { success: true, categories: response.data };
    }
    return { success: false };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.errors
          ? error.response.data.errors.join(', ')
          : 'Something went wrong. Please try again.',
    };
  }
};

export const updateCategory = async (newData) => {
  try {
    const response = await axios.put(`/api/courseCategory/${newData.id}`, newData);

    if (response.data.category) {
      return { success: true, categories: response.data.category };
    }
    return { success: false };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.errors
          ? error.response.data.errors.join(', ')
          : 'Something went wrong. Please try again.',
    };
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await axios.delete(`/api/courseCategory/${categoryId}`);

    if (response.status == 200) {
      return { success: true };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.errors
          ? error.response.data.errors.join(', ')
          : 'Something went wrong. Please try again.',
    };
  }
};

export const enrollCourseTrial = async (courseId) => {
  try {
    const response = await axios.post('/api/enrollCourseTrial', { courseId });
    if (response.data) {
      return { success: true, data: response.data };
    }
    return { success: false, message: "Enrollment failed." };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.errors
          ? error.response.data.errors.join(', ')
          : 'Something went wrong. Please try again.',
    };
  }
};

export const enrollFreeCourse = async (courseId) => {
  try {
    const response = await axios.post('/api/enroll-free-course', { courseId });
    if (response.data) {
      return { success: true, data: response.data, message: response.data.message };
    }
    return { success: false, message: "Enrollment failed." };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.errors?.join(', ') ||
        'Something went wrong. Please try again.',
    };
  }
};


// --- Subcategories ---
export const allSubcategories = async () => {
  try {
    const response = await axios.get('/api/course-subcategories');
    if (response.data) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to fetch subcategories' };
  }
};

export const addSubcategory = async (data) => {
  try {
    const response = await axios.post('/api/course-subcategories', data);
    if (response.data) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to add subcategory' };
  }
};

export const updateSubcategory = async (data) => {
  try {
    const response = await axios.put(`/api/course-subcategories/${data.id}`, data);
    if (response.data) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to update subcategory' };
  }
};

export const deleteSubcategory = async (id) => {
  try {
    const response = await axios.delete(`/api/course-subcategories/${id}`);
    if (response.status === 200) {
      return { success: true };
    }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to delete subcategory' };
  }
};

// --- Languages ---
export const allLanguages = async () => {
  try {
    const response = await axios.get('/api/course-languages');
    if (response.data) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to fetch languages' };
  }
};

export const addLanguage = async (data) => {
  try {
    const response = await axios.post('/api/course-languages', data);
    if (response.data) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to add language' };
  }
};

export const updateLanguage = async (data) => {
  try {
    const response = await axios.put(`/api/course-languages/${data.id}`, data);
    if (response.data) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to update language' };
  }
};

export const deleteLanguage = async (id) => {
  try {
    const response = await axios.delete(`/api/course-languages/${id}`);
    if (response.status === 200) {
      return { success: true };
    }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to delete language' };
  }
};

// --- Subtitle Languages ---
export const allSubtitleLanguages = async () => {
  try {
    const response = await axios.get('/api/subtitle-languages');
    if (response.data) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to fetch subtitle languages' };
  }
};

export const addSubtitleLanguage = async (data) => {
  try {
    const response = await axios.post('/api/subtitle-languages', data);
    if (response.data) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to add subtitle language' };
  }
};

export const updateSubtitleLanguage = async (data) => {
  try {
    const response = await axios.put(`/api/subtitle-languages/${data.id}`, data);
    if (response.data) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to update subtitle language' };
  }
};

export const deleteSubtitleLanguage = async (id) => {
  try {
    const response = await axios.delete(`/api/subtitle-languages/${id}`);
    if (response.status === 200) {
      return { success: true };
    }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to delete subtitle language' };
  }
};

export const getStudentCourseProgress = async (search = '') => {
  try {
    const response = await axios.get('/api/student/analytics/course-progress', {
      params: { search }
    });
    if (response.data) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to fetch course progress' };
  }
};

export const getPopularCourses = async () => {
  try {
    const response = await axios.get('/api/popularCourses');
    if (response.data) {
      return { success: true, courses: response.data };
    }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to fetch popular courses' };
  }
};

export const getAvailableCourses = async (search = '', includePurchased = false) => {
  try {
    const response = await axios.get('/api/availableCourses', {
      params: { search, includePurchased }
    });
    if (response.data) {
      return { success: true, courses: response.data };
    }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to fetch available courses' };
  }
};

export const getAllAssignments = async () => {
  try {
    const response = await axios.get('/api/getAllAssignments');
    if (response.data) {
      return { success: true, assignments: response.data };
    }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to fetch assignments' };
  }
};

export const getAllPublicCourses = async () => {
  try {
    const response = await axios.get('/api/allPublicCourses');
    if (response.data) {
      return { success: true, courses: response.data };
    }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to fetch public courses' };
  }
};

export const markContentAsComplete = async (courseId, contentId, isCompleted) => {
  try {
    const response = await axios.post('/api/courses/progress', {
      courseId,
      contentId,
      isCompleted
    });
    if (response.data) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to update progress' };
  }
};

