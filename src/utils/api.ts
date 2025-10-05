// API configuration with environment-based URL
const getApiBaseUrl = (): string => {
  // Check for emergency API URL first (set by fix-api-url.js)
  if ((window as any).EMERGENCY_API_URL) {
    console.log('🚑 Using emergency API URL:', (window as any).EMERGENCY_API_URL);
    return (window as any).EMERGENCY_API_URL;
  }
  
  // Production URL - deployed backend
  const PRODUCTION_API_URL = 'https://homebase-gear-guard.onrender.com/api';
  
  // Check environment variables
  if (import.meta.env.VITE_API_URL) {
    console.log('🌐 Using VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Determine based on current location
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Development environment
    console.log('💻 Using development API URL');
    return 'http://localhost:3001/api';
  } else {
    // Production environment
    console.log('🚀 Using production API URL');
    return PRODUCTION_API_URL;
  }
};

const API_BASE_URL = getApiBaseUrl();

// Log the API URL for debugging
console.log('🔗 API Base URL:', API_BASE_URL);

// API client with error handling
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log(`🔄 Making API request to: ${url}`);
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ API request successful:`, data);
      return data.data || data; // Handle both {success: true, data: ...} and direct responses
    } catch (error) {
      console.error(`❌ API request failed for ${endpoint}:`, error);
      
      // Handle specific error types
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        // This is likely a CORS or CSP issue
        throw new Error(`🚨 Network Error: Cannot connect to API at ${url}. This might be due to:\n- Incorrect API URL\n- CORS/CSP restrictions\n- Backend server is down`);
      }
      
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export { API_BASE_URL };