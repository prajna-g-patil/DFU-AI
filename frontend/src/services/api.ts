import { 
  Doctor, 
  Patient, 
  PatientDetail, 
  Assessment, 
  DashboardAnalytics, 
  ModelStatusInfo, 
  ClinicalReportData,
  TreatmentPlan 
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('dfu_access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Authentication
  async login(email: string, password: string): Promise<{ access_token: string; doctor: Doctor }> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Authentication failed. Please verify credentials.' }));
        throw new Error(err.detail || 'Authentication failed. Please verify credentials.');
      }
      return res.json();
    } catch (e: any) {
      if (e.message && (e.message.includes('Failed to fetch') || e.message.includes('NetworkError') || e.message.includes('Load failed'))) {
        throw new Error('Cannot connect to medical backend server. Please verify the backend is running on port 8000.');
      }
      throw e;
    }
  },

  async register(data: { email: string; password: string; full_name: string; specialty: string; hospital: string; license_number: string }): Promise<{ access_token: string; doctor: Doctor }> {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, email: data.email.trim() })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
        throw new Error(err.detail || 'Registration failed');
      }
      return res.json();
    } catch (e: any) {
      if (e.message && (e.message.includes('Failed to fetch') || e.message.includes('NetworkError') || e.message.includes('Load failed'))) {
        throw new Error('Cannot connect to medical backend server. Please verify the backend is running on port 8000.');
      }
      throw e;
    }
  },

  async getMe(): Promise<Doctor> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to load doctor profile');
    return res.json();
  },

  async getDoctors(): Promise<Doctor[]> {
    try {
      const res = await fetch(`${API_BASE}/auth/doctors`, {
        headers: getAuthHeader()
      });
      if (!res.ok) return [];
      return res.json();
    } catch (e) {
      console.warn("Could not fetch doctor listing:", e);
      return [];
    }
  },

  async getDemoAccounts(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/auth/demo-accounts`);
      if (!res.ok) return [];
      return res.json();
    } catch (e) {
      console.warn("Could not fetch dynamic demo accounts, falling back to static list:", e);
      return [];
    }
  },

  // Patients
  async getPatients(params?: { scope?: 'my' | 'shared' | 'all'; search?: string; status_filter?: string; diabetes_type?: string }): Promise<Patient[]> {
    const query = new URLSearchParams();
    if (params?.scope) query.append('scope', params.scope);
    if (params?.search) query.append('search', params.search);
    if (params?.status_filter) query.append('status_filter', params.status_filter);
    if (params?.diabetes_type) query.append('diabetes_type', params.diabetes_type);

    const res = await fetch(`${API_BASE}/patients?${query.toString()}`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch patient records');
    return res.json();
  },

  async getPatient(id: number): Promise<PatientDetail> {
    const res = await fetch(`${API_BASE}/patients/${id}`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch patient profile');
    return res.json();
  },

  async sharePatient(patientId: number, data: { target_doctor_id: number; permission?: string; notes?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/patients/${patientId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to share patient' }));
      throw new Error(err.detail || 'Failed to share patient');
    }
    return res.json();
  },

  async unsharePatient(patientId: number, targetDoctorId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/patients/${patientId}/share/${targetDoctorId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to revoke patient access' }));
      throw new Error(err.detail || 'Failed to revoke patient access');
    }
    return res.json();
  },

  async createPatient(patientData: Partial<Patient>): Promise<Patient> {
    const res = await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(patientData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Error creating patient' }));
      throw new Error(err.detail || 'Failed to create patient');
    }
    return res.json();
  },

  async updatePatient(id: number, updateData: Partial<Patient>): Promise<Patient> {
    const res = await fetch(`${API_BASE}/patients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(updateData)
    });
    if (!res.ok) throw new Error('Failed to update patient');
    return res.json();
  },

  // Assessments & AI Inference
  async createAssessment(formData: FormData): Promise<Assessment> {
    const res = await fetch(`${API_BASE}/assessments`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Assessment inference failed' }));
      throw new Error(err.detail || 'Assessment inference failed');
    }
    return res.json();
  },

  async getAssessments(params?: { patient_id?: number; grade?: number; status?: string }): Promise<Assessment[]> {
    const query = new URLSearchParams();
    if (params?.patient_id) query.append('patient_id', params.patient_id.toString());
    if (params?.grade) query.append('grade', params.grade.toString());
    if (params?.status) query.append('status', params.status);

    const res = await fetch(`${API_BASE}/assessments?${query.toString()}`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch assessments');
    return res.json();
  },

  async getAssessment(id: number): Promise<Assessment> {
    const res = await fetch(`${API_BASE}/assessments/${id}`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Assessment not found');
    return res.json();
  },

  async verifyAssessment(
    id: number, 
    data: {
      verified_grade: number;
      status: 'verified' | 'overridden';
      override_reason?: string;
      clinical_notes?: string;
      treatment_plan: TreatmentPlan;
    }
  ): Promise<Assessment> {
    const res = await fetch(`${API_BASE}/assessments/${id}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Doctor verification failed');
    return res.json();
  },

  async getAssessmentReport(id: number): Promise<ClinicalReportData> {
    const res = await fetch(`${API_BASE}/assessments/${id}/report`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to generate report data');
    return res.json();
  },

  // Analytics
  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  // AI Model Status
  async getModelInfo(): Promise<ModelStatusInfo> {
    const res = await fetch(`${API_BASE}/model/info`);
    if (!res.ok) throw new Error('Failed to fetch model info');
    return res.json();
  },

  // AI Model Multi-Architecture Benchmarks
  async getModelBenchmark(): Promise<any> {
    const res = await fetch(`${API_BASE}/model/benchmark`);
    if (!res.ok) throw new Error('Failed to fetch model benchmark data');
    return res.json();
  }
};
