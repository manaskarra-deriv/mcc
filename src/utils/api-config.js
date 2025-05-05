/**
 * API configuration for the Market Command Center application
 * Contains environment-specific API endpoints and configuration
 */

// Base URL for API calls - uses environment variable in production or localhost in development
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5004/api';

// Model configuration for AI features
export const AI_MODEL_CONFIG = {
  modelName: process.env.REACT_APP_MODEL_NAME || 'gpt-4-turbo',
  temperature: 0.7,
  maxTokens: 1000
};

// API timeout settings (in milliseconds)
export const API_TIMEOUT = 30000; 