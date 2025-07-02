import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Admin Login
 */
export const adminLogin = async (email: string, password: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/login/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    return data;
} catch (error) {
    return { error: 'Network error, please try again' };
}
};

/**
 * Educator Login
 */
export const educatorLogin = async (email: string, password: string): Promise<any> => {
    try {
        const response = await fetch(`${API_BASE_URL}/educator/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        return { error: 'Network error, please try again' };
    }
};

/**
 * Student Login
 */
export const studentLogin = async (studentId: string, password: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/student/login/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId, password }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return { error: 'Network error, please try again' };
  }
};

/**
 * Register Educator (Handles CSV Upload)
 */
export const registerEducator = async (formData: FormData): Promise<any> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/educator/register/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error: any) {
        console.error('Error registering educator:', error);
        return { error: error.response?.data?.error || 'Failed to register educator' };
    }
};

/**
 * Upload Test Files (Question Paper, Answer Key, Answer Sheet)
 */
export const uploadTest = async (
    questionPaper: File,
    answerKey: File,
    answerSheet: File
): Promise<any> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return { error: 'Unauthorized: No Token Found' };

        const formData = new FormData();
        formData.append('question_paper', questionPaper);
        formData.append('answer_key', answerKey);
        formData.append('answer_sheet', answerSheet);

        const response = await axios.post(`${API_BASE_URL}/upload_test/`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error: any) {
        return { error: error.response?.data?.error || 'Upload failed' };
    }
};

/**
 * Fetch Tests for an Educator
 */
export const fetchTests = async (): Promise<any> => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/educator/tests/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { tests: response.data.tests };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Failed to fetch tests' };
    }
  };
  

  export const getStudentPerformanceData = async (): Promise<any> => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/student/performance/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const data = await response.data;
      return data;
    } catch (error) {
      console.error('Error fetching performance data:', error);
      return { error: 'Failed to fetch performance data' };
    }
  };

  export const getStudentDashboardData = async (): Promise<any> => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/student/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const data = await response.data;
      return data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return { error: 'Failed to fetch dashboard data' };
    }
  };
  

  export const getEducatorDashboardData = async (): Promise<any> => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/educator/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const data = await response.data;
      return data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return { error: 'Failed to fetch dashboard data' };
    }
  };


  export const fetchStudentSWOT = async (testNum: number): Promise<any> => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/student/swot/`,
        { test_num: testNum },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      const data = await response.data;
      return data;
    } catch (error) {
      console.error('Error fetching SWOT data:', error);
      return { error: 'Failed to fetch SWOT data' };
    }
  };
  

  export const fetchAvailableSwotTests = async (): Promise<any[]> => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/student/swot/tests/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      return response.data?.available_tests || [];
    } catch (error) {
      console.error('Error fetching available SWOT tests:', error);
      return [];
    }
  };
  
  export const fetchEducatorSWOT = async (testNum: number): Promise<any> => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/educator/swot/`,
        { test_num: testNum },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      const data = await response.data;
      return data;
    } catch (error) {
      console.error('Error fetching SWOT data:', error);
      return { error: 'Failed to fetch SWOT data' };
    }
  };
  

  export const fetchAvailableSwotTests_Educator = async (): Promise<any[]> => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/educator/swot/tests/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      return response.data?.available_tests || [];
    } catch (error) {
      console.error('Error fetching available SWOT tests:', error);
      return [];
    }
  };

  export const fetchstudentdetail = async (): Promise<any> => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/student/details/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      return response.data
    } catch (error) {
      console.error('Error fetching student name:', error);
      return [];
    }
  };

  export const fetcheducatordetail = async (): Promise<any> => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/educator/details/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      return response.data
    } catch (error) {
      console.error('Error fetching student name:', error);
      return [];
    }
  };

  export const fetcheducatorstudent = async (): Promise<any> => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/educator/students/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      return response.data
    } catch (error) {
      console.error('Error fetching student name:', error);
      return [];
    }
  };
  
  export const fetchEducatorStudentTests = async (studentId: string): Promise<any[]> => {
    try {
        const token = localStorage.getItem('token');
        console.log('Fetching tests for student with ID:', studentId);
        
        const res = await axios.post(
            `${API_BASE_URL}/educator/students/tests/`,
            { student_id: studentId },
            { 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('Received tests response:', res.data);
        return res.data.available_tests ?? [];
    } catch (error: any) {
        console.error('Error fetching student tests:', error);
        console.error('Error response:', error.response?.data);
        return [];
    }
};
  
  export const fetchEducatorStudentInsights = async (student_id: string, test_num: number): Promise<any> => {
    const token = localStorage.getItem('token');
    console.log('[API] fetchEducatorStudentInsights →', { student_id, test_num, token });

    const response = await axios.post(
        `${API_BASE_URL}/educator/students/insights/`,
        { 
            student_id,
            test_num
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );

    return response.data;
};
