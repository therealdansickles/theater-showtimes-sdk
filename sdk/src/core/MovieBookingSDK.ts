import axios, { AxiosInstance } from 'axios';
import { SDKOptions, MovieConfig, ThemeConfig, BookingConfig, APIResponse, SDKError } from '../types';
import { validateTheme, generateUniqueId } from '../utils';
import { DEFAULT_THEME, API_ENDPOINTS } from '../constants';

export class MovieBookingSDK {
  private apiClient: AxiosInstance;
  private options: SDKOptions;
  private theme: ThemeConfig;
  private sessionId: string;

  constructor(options: SDKOptions) {
    this.options = {
      environment: 'production',
      enableAnalytics: true,
      enableErrorReporting: true,
      ...options
    };

    this.theme = {
      ...DEFAULT_THEME,
      ...options.theme
    };

    this.sessionId = generateUniqueId();

    // Initialize API client
    this.apiClient = axios.create({
      baseURL: this.getBaseUrl(),
      headers: {
        'Authorization': `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json',
        'X-SDK-Version': '1.0.0-beta.1',
        'X-Session-ID': this.sessionId
      },
      timeout: 10000
    });

    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (this.options.enableErrorReporting) {
          this.reportError(error);
        }
        return Promise.reject(this.createSDKError(error));
      }
    );

    this.initialize();
  }

  private getBaseUrl(): string {
    if (this.options.baseUrl) {
      return this.options.baseUrl;
    }

    const envUrls = {
      development: 'http://localhost:8001/api',
      staging: 'https://staging-api.your-platform.com/api',
      production: 'https://api.your-platform.com/api'
    };

    return envUrls[this.options.environment];
  }

  private async initialize(): Promise<void> {
    try {
      // Validate API key
      await this.validateApiKey();
      
      // Initialize analytics if enabled
      if (this.options.enableAnalytics) {
        this.initializeAnalytics();
      }

      // Validate theme
      validateTheme(this.theme);
    } catch (error) {
      console.error('SDK initialization failed:', error);
      throw error;
    }
  }

  private async validateApiKey(): Promise<void> {
    try {
      await this.apiClient.get('/health');
    } catch (error) {
      throw new Error('Invalid API key or service unavailable');
    }
  }

  private initializeAnalytics(): void {
    // Track SDK initialization
    this.track('sdk_initialized', {
      version: '1.0.0-beta.1',
      environment: this.options.environment,
      theme: this.theme
    });
  }

  private createSDKError(error: any): SDKError {
    const sdkError = new Error(error.message || 'SDK Error') as SDKError;
    sdkError.code = error.response?.data?.code || 'UNKNOWN_ERROR';
    sdkError.context = {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    };
    return sdkError;
  }

  private reportError(error: any): void {
    // Send error to monitoring service
    console.error('SDK Error:', error);
  }

  private track(event: string, data: any): void {
    if (!this.options.enableAnalytics) return;

    // Send analytics event
    console.log('Analytics:', event, data);
  }

  // Public API Methods
  async getMovieConfig(movieId: string): Promise<MovieConfig> {
    try {
      const response = await this.apiClient.get<APIResponse<MovieConfig>>(`/movies/${movieId}`);
      return response.data.data!;
    } catch (error) {
      throw this.createSDKError(error);
    }
  }

  async updateMovieConfig(movieId: string, config: Partial<MovieConfig>): Promise<MovieConfig> {
    try {
      const response = await this.apiClient.put<APIResponse<MovieConfig>>(`/movies/${movieId}`, config);
      return response.data.data!;
    } catch (error) {
      throw this.createSDKError(error);
    }
  }

  async getTheaters(movieId: string, filters?: any): Promise<any[]> {
    try {
      const response = await this.apiClient.get<APIResponse<any[]>>(`/movies/${movieId}/theaters`, {
        params: filters
      });
      return response.data.data!;
    } catch (error) {
      throw this.createSDKError(error);
    }
  }

  async createBooking(bookingConfig: BookingConfig): Promise<any> {
    try {
      this.track('booking_started', bookingConfig);
      
      const response = await this.apiClient.post<APIResponse<any>>('/bookings', bookingConfig);
      
      this.track('booking_completed', response.data.data);
      
      return response.data.data!;
    } catch (error) {
      this.track('booking_failed', { error: error.message, config: bookingConfig });
      throw this.createSDKError(error);
    }
  }

  async uploadImage(file: File, category: string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      const response = await this.apiClient.post<APIResponse<any>>('/uploads/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data.data!;
    } catch (error) {
      throw this.createSDKError(error);
    }
  }

  async getCustomizationPresets(category?: string): Promise<any[]> {
    try {
      const response = await this.apiClient.get<APIResponse<any[]>>('/movies/presets/', {
        params: { category }
      });
      return response.data.data!;
    } catch (error) {
      throw this.createSDKError(error);
    }
  }

  // Theme Management
  updateTheme(newTheme: Partial<ThemeConfig>): void {
    this.theme = {
      ...this.theme,
      ...newTheme
    };

    validateTheme(this.theme);
    this.track('theme_updated', this.theme);
  }

  getTheme(): ThemeConfig {
    return this.theme;
  }

  // Utility Methods
  generateEmbedUrl(movieId: string, options?: any): string {
    const baseUrl = this.getBaseUrl().replace('/api', '');
    const params = new URLSearchParams({
      movieId,
      apiKey: this.options.apiKey,
      ...options
    });

    return `${baseUrl}/embed?${params.toString()}`;
  }

  // Mobile-specific methods
  isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  optimizeForMobile(): void {
    if (this.isMobile()) {
      this.updateTheme({
        mobileOptimized: true,
        spacing: {
          xs: 4,
          sm: 8,
          md: 12,
          lg: 16,
          xl: 20,
          xxl: 24
        }
      });
    }
  }

  // Cleanup
  destroy(): void {
    this.track('sdk_destroyed', { sessionId: this.sessionId });
    // Cleanup any listeners or timers
  }
}