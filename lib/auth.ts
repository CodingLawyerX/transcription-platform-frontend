import axios from 'axios';
import { getApiBaseUrl } from '@/lib/api/baseUrl';

const API_BASE_URL = getApiBaseUrl();

// API Client mit Basis-Konfiguration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Typen für die Registrierung
export interface RegisterData {
  email: string;
  name?: string;
  password1: string;
  password2: string;
}

export interface RegisterResponse {
  key: string;
  user: {
    username: string;
    email: string;
    name?: string;
    is_active?: boolean;
    is_staff?: boolean;
  };
}

export interface ApiError {
  [key: string]: string[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status: number;
}

// Auth API Funktionen
export const authApi = {
  // Benutzerregistrierung
  async register(data: RegisterData): Promise<ApiResponse<RegisterResponse>> {
    try {
      const response = await apiClient.post('/auth/registration/', data);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      const fallbackError = {
        non_field_errors: ['Registrierung fehlgeschlagen. Bitte prüfen Sie die Verbindung und versuchen Sie es erneut.'],
      };
      return {
        error: error.response?.data || fallbackError,
        status: error.response?.status || 500,
      };
    }
  },

  // Email-Verifizierung erneut senden
  async resendVerificationEmail(email: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.post('/auth/resend-verification/', { email });
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      return {
        error: error.response?.data,
        status: error.response?.status || 500,
      };
    }
  },

  // Benutzerprofil abrufen
  async getProfile(token: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/auth/profile/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      return {
        error: error.response?.data,
        status: error.response?.status || 500,
      };
    }
  },

  // Benutzerprofil aktualisieren
  async updateProfile(token: string, data: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.put('/auth/profile/', data, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      return {
        error: error.response?.data,
        status: error.response?.status || 500,
      };
    }
  },

  // Token validieren
  async validateToken(token: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.get('/auth/check-token/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      return {
        error: error.response?.data,
        status: error.response?.status || 500,
      };
    }
  },

  // Passwort-Reset anfordern
  async requestPasswordReset(email: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.post('/auth/password/reset/', { email });
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      return {
        error: error.response?.data,
        status: error.response?.status || 500,
      };
    }
  },

  // Passwort-Reset bestätigen
  async confirmPasswordReset(
    uid: string,
    token: string,
    newPassword1: string,
    newPassword2: string
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.post('/auth/password/reset/confirm/', {
        uid,
        token,
        new_password1: newPassword1,
        new_password2: newPassword2,
      });
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      return {
        error: error.response?.data,
        status: error.response?.status || 500,
      };
    }
  },

  // Passwort ändern (authentifizierter Benutzer)
  async changePassword(
    token: string,
    oldPassword: string,
    newPassword1: string,
    newPassword2: string
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.post(
        '/auth/change-password/',
        {
          old_password: oldPassword,
          new_password1: newPassword1,
          new_password2: newPassword2,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      return {
        error: error.response?.data,
        status: error.response?.status || 500,
      };
    }
  },
};

// Hilfsfunktionen für Form-Validierung
export const validationRules = {
  username: {
    required: 'Benutzername ist erforderlich',
    minLength: {
      value: 3,
      message: 'Benutzername muss mindestens 3 Zeichen lang sein',
    },
    maxLength: {
      value: 150,
      message: 'Benutzername darf maximal 150 Zeichen lang sein',
    },
    pattern: {
      value: /^[a-zA-Z0-9_]+$/,
      message: 'Benutzername darf nur Buchstaben, Zahlen und Unterstriche enthalten',
    },
  },
  email: {
    required: 'Email ist erforderlich',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Ungültige Email-Adresse',
    },
  },
  password: {
    required: 'Passwort ist erforderlich',
    minLength: {
      value: 8,
      message: 'Passwort muss mindestens 8 Zeichen lang sein',
    },
  },
  firstName: {
    maxLength: {
      value: 30,
      message: 'Vorname darf maximal 30 Zeichen lang sein',
    },
  },
  lastName: {
    maxLength: {
      value: 30,
      message: 'Nachname darf maximal 30 Zeichen lang sein',
    },
  },
  phoneNumber: {
    pattern: {
      value: /^[+]?[0-9\s\-\(\)]+$/,
      message: 'Ungültige Telefonnummer',
    },
  },
};

// Utility-Funktionen
export const formatApiErrors = (errors: ApiError): string[] => {
  const errorMessages: string[] = [];

  if (!errors) {
    return ['Unbekannter Fehler'];
  }

  if (typeof errors === 'string') {
    return [errors];
  }

  if (Array.isArray(errors)) {
    return errors.map((message) => String(message));
  }

  if (typeof errors === 'object' && typeof (errors as any).detail === 'string') {
    return [(errors as any).detail];
  }

  Object.entries(errors).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((message) => {
        errorMessages.push(`${key}: ${String(message)}`);
      });
    } else if (typeof value === 'string') {
      errorMessages.push(`${key}: ${value}`);
    } else if (value && typeof value === 'object') {
      Object.values(value as Record<string, unknown>).forEach((message) => {
        if (Array.isArray(message)) {
          message.forEach((item) => errorMessages.push(`${key}: ${String(item)}`));
        } else if (typeof message === 'string') {
          errorMessages.push(`${key}: ${message}`);
        }
      });
    }
  });

  return errorMessages.length > 0 ? errorMessages : ['Unbekannter Fehler'];
};
