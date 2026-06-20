const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getStoredAuth = () => {
  try {
    return JSON.parse(localStorage.getItem('hospitalQueueAuth')) || null;
  } catch {
    return null;
  }
};

const request = async (path, options = {}) => {
  const auth = getStoredAuth();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (auth?.token) {
    headers.Authorization = `Bearer ${auth.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || 'API request failed');
  }

  return data;
};

export const api = {
  login: (payload) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getProfile: () => request('/auth/profile'),
  updateProfile: (payload) =>
    request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  getDoctors: () => request('/doctors'),
  bookAppointment: (payload) =>
    request('/appointments/book', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getPatientAppointments: (patientId) => request(`/appointments/patient/${patientId}`),
  getDoctorAppointments: (doctorId) => request(`/appointments/doctor/${doctorId}`),
  getDoctorDailyReport: (doctorId, date) => request(`/appointments/report/${doctorId}/${date}`),
  getDoctorAlert: (doctorId) => request(`/appointments/doctor/${doctorId}/alert`),
  getQueueStatus: (appointmentId) => request(`/appointments/status/${appointmentId}`),
  completeAppointment: (appointmentId) =>
    request(`/appointments/complete/${appointmentId}`, {
      method: 'PUT',
    }),
  cancelAppointment: (appointmentId) =>
    request(`/appointments/cancel/${appointmentId}`, {
      method: 'PUT',
    }),
  rescheduleAppointment: (appointmentId, payload) =>
    request(`/appointments/reschedule/${appointmentId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
};

export const saveAuthSession = (session) => {
  localStorage.setItem('hospitalQueueAuth', JSON.stringify(session));
};

export const getAuthSession = getStoredAuth;

export const clearAuthSession = () => {
  localStorage.removeItem('hospitalQueueAuth');
};
