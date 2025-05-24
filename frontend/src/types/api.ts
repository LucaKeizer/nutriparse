// API Response Types
export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Authentication Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PasswordChangeRequest {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

// User Types
export interface UserProfile {
  bio: string;
  profile_picture: string | null;
  dietary_preferences: string;
  email_notifications: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  profile: UserProfile;
  favorite_recipes?: RecipeLight[];
}

// Nutrition Types
export interface FoodGroup {
  id: number;
  name: string;
}

export interface MeasurementUnit {
  id: number;
  name: string;
  abbreviation: string;
  type: 'volume' | 'weight' | 'count';
}

export interface FoodConversion {
  id: number;
  unit: number;
  unit_name: string;
  unit_abbreviation: string;
  grams_per_unit: number;
}

export interface NutritionData {
  id: number;
  name: string;
  food_group: number;
  food_group_name: string;
  description: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar: number;
  vitamin_a: number;
  vitamin_c: number;
  vitamin_d: number;
  vitamin_e: number;
  vitamin_k: number;
  thiamin: number;
  riboflavin: number;
  niacin: number;
  vitamin_b6: number;
  folate: number;
  vitamin_b12: number;
  calcium: number;
  iron: number;
  magnesium: number;
  phosphorus: number;
  potassium: number;
  sodium: number;
  zinc: number;
  cholesterol: number;
  saturated_fat: number;
  monounsaturated_fat: number;
  polyunsaturated_fat: number;
  trans_fat: number;
  common_name: string;
  search_terms: string;
  conversions: FoodConversion[];
}

export interface NutritionDataLight {
  id: number;
  name: string;
  food_group_name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
}

export interface NutritionSearchRequest {
  query: string;
  limit?: number;
}

// Recipe Types
export interface Tag {
  id: number;
  name: string;
}

export interface RecipeIngredient {
  id: number;
  food: number | null;
  food_details: NutritionDataLight | null;
  quantity: number | null;
  unit: number | null;
  unit_details: MeasurementUnit | null;
  preparation: string;
  original_text: string;
  is_parsed: boolean;
}

export interface NutritionPerServing {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
}

export interface Recipe {
  id: number;
  title: string;
  user: number;
  user_username: string;
  description: string;
  instructions: string;
  servings: number;
  prep_time: number | null;
  cook_time: number | null;
  original_text: string;
  image: string | null;
  source_url: string;
  source_name: string;
  created_at: string;
  updated_at: string;
  ingredients: RecipeIngredient[];
  tags: Tag[];
  total_calories: number | null;
  total_protein: number | null;
  total_carbs: number | null;
  total_fat: number | null;
  total_fiber: number | null;
  nutrition_per_serving: NutritionPerServing | null;
}

export interface RecipeLight {
  id: number;
  title: string;
  user_username: string;
  description: string;
  servings: number;
  prep_time: number | null;
  cook_time: number | null;
  image: string | null;
  created_at: string;
  updated_at: string;
  tags: Tag[];
  total_calories: number | null;
  total_protein: number | null;
  total_carbs: number | null;
  total_fat: number | null;
}

export interface CreateRecipeRequest {
  title: string;
  description: string;
  instructions: string;
  servings: number;
  prep_time?: number;
  cook_time?: number;
  original_text?: string;
  source_url?: string;
  source_name?: string;
}

export interface ParseRecipeRequest {
  recipe_text: string;
  title?: string;
  servings?: number;
  save_recipe?: boolean;
}

export interface ParsedIngredient {
  quantity: number | null;
  unit: string | null;
  ingredient: string;
  preparation: string | null;
  original_text: string;
}

export interface MatchedIngredient extends Omit<ParsedIngredient, 'unit'> {
  food: number | null;
  unit: number | null;
  is_parsed: boolean;
}

export interface ParsedData {
  ingredients: ParsedIngredient[];
  instructions: string;
}

export interface RecipeParseResponse {
  parsed_data: ParsedData;
  matched_ingredients: MatchedIngredient[];
  recipe?: Recipe;
}

// Error Types
export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: any;
}