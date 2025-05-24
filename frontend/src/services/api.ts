import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  PasswordChangeRequest,
  User,
  Recipe,
  RecipeLight,
  CreateRecipeRequest,
  ParseRecipeRequest,
  RecipeParseResponse,
  NutritionData,
  NutritionDataLight,
  NutritionSearchRequest,
  FoodGroup,
  MeasurementUnit,
  Tag,
  ApiError
} from '@/types/api';

// Create axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Remove invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login (you'll implement this with React Router)
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/users/login/', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/users/register/', userData);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/users/logout/');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/me/');
    return response.data;
  },

  changePassword: async (passwordData: PasswordChangeRequest): Promise<void> => {
    await api.post('/users/change_password/', passwordData);
  },

  getFavoriteRecipes: async (): Promise<RecipeLight[]> => {
    const response = await api.get<RecipeLight[]>('/users/favorite_recipes/');
    return response.data;
  },
};

// Recipes API
export const recipesAPI = {
  getRecipes: async (params?: { 
    page?: number; 
    username?: string; 
    search?: string; 
  }): Promise<ApiResponse<RecipeLight>> => {
    const response = await api.get<ApiResponse<RecipeLight>>('/recipes/', { params });
    return response.data;
  },

  getRecipe: async (id: number): Promise<Recipe> => {
    const response = await api.get<Recipe>(`/recipes/${id}/`);
    return response.data;
  },

  createRecipe: async (recipeData: CreateRecipeRequest): Promise<Recipe> => {
    const response = await api.post<Recipe>('/recipes/', recipeData);
    return response.data;
  },

  updateRecipe: async (id: number, recipeData: Partial<CreateRecipeRequest>): Promise<Recipe> => {
    const response = await api.put<Recipe>(`/recipes/${id}/`, recipeData);
    return response.data;
  },

  deleteRecipe: async (id: number): Promise<void> => {
    await api.delete(`/recipes/${id}/`);
  },

  parseRecipe: async (parseData: ParseRecipeRequest): Promise<RecipeParseResponse> => {
    const response = await api.post<RecipeParseResponse>('/recipes/parse/', parseData);
    return response.data;
  },

  favoriteRecipe: async (id: number): Promise<{ status: string }> => {
    const response = await api.post<{ status: string }>(`/recipes/${id}/favorite/`);
    return response.data;
  },
};

// Nutrition API
export const nutritionAPI = {
  searchNutritionData: async (searchData: NutritionSearchRequest): Promise<NutritionDataLight[]> => {
    const response = await api.post<NutritionDataLight[]>('/nutrition-data/search/', searchData);
    return response.data;
  },

  getNutritionData: async (params?: { 
    page?: number; 
    search?: string; 
  }): Promise<ApiResponse<NutritionDataLight>> => {
    const response = await api.get<ApiResponse<NutritionDataLight>>('/nutrition-data/', { params });
    return response.data;
  },

  getNutritionDetail: async (id: number): Promise<NutritionData> => {
    const response = await api.get<NutritionData>(`/nutrition-data/${id}/`);
    return response.data;
  },

  getFoodGroups: async (): Promise<ApiResponse<FoodGroup>> => {
    const response = await api.get<ApiResponse<FoodGroup>>('/food-groups/');
    return response.data;
  },

  getMeasurementUnits: async (): Promise<ApiResponse<MeasurementUnit>> => {
    const response = await api.get<ApiResponse<MeasurementUnit>>('/measurement-units/');
    return response.data;
  },
};

// Tags API
export const tagsAPI = {
  getTags: async (): Promise<ApiResponse<Tag>> => {
    const response = await api.get<ApiResponse<Tag>>('/tags/');
    return response.data;
  },
};

// Error handling utility
export const handleApiError = (error: AxiosError): ApiError => {
  if (error.response?.data) {
    return error.response.data as ApiError;
  }
  return {
    message: error.message || 'An unexpected error occurred',
  };
};

export default api;