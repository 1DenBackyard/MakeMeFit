import { TrackType } from '../api/requests';

/**
 * Normalize form data to match backend schema
 */
export interface NormalizedFormData {
  // Common fields
  goal_text: string;
  age?: number;
  weight_kg?: number;
  height_cm?: number;
  activity_level: string;
  injuries_or_constraints?: boolean;
  injuries_details?: string;
  
  // Supplements specific
  allergies?: string[];
  current_supplements_or_meds?: string[];
  budget_tier?: string;
  
  // Workouts specific
  equipment?: string[];
  days_per_week?: number;
  liked_activities?: string[];
  disliked_activities?: string[];
  access_to_pool?: boolean;
}

/**
 * Normalize supplements form data
 */
export function normalizeSupplementsForm(
  formData: Record<string, unknown>
): NormalizedFormData {
  return {
    goal_text: String(formData.goal || ''),
    age: formData.age ? Number(formData.age) : undefined,
    weight_kg: formData.weight ? Number(formData.weight) : undefined,
    height_cm: formData.height ? Number(formData.height) : undefined,
    activity_level: String(formData.activity_level || 'moderate'),
    injuries_or_constraints: Array.isArray(formData.health_conditions) && formData.health_conditions.length > 0 && !formData.health_conditions.includes('Нет'),
    injuries_details: Array.isArray(formData.health_conditions) && !formData.health_conditions.includes('Нет')
      ? formData.health_conditions.filter(c => c !== 'Нет').join(', ')
      : undefined,
    allergies: Array.isArray(formData.dietary_restrictions) 
      ? formData.dietary_restrictions.map(String)
      : undefined,
    current_supplements_or_meds: Array.isArray(formData.current_supplements)
      ? formData.current_supplements.map(String)
      : undefined,
    budget_tier: String(formData.budget || 'moderate'),
  };
}

/**
 * Normalize workouts form data
 */
export function normalizeWorkoutsForm(
  formData: Record<string, unknown>
): NormalizedFormData {
  return {
    goal_text: String(formData.goal || ''),
    age: formData.age ? Number(formData.age) : undefined,
    weight_kg: formData.weight ? Number(formData.weight) : undefined,
    height_cm: formData.height ? Number(formData.height) : undefined,
    activity_level: String(formData.fitness_level || 'beginner'),
    injuries_or_constraints: Boolean(formData.injuries && String(formData.injuries).trim()),
    injuries_details: formData.injuries ? String(formData.injuries) : undefined,
    equipment: Array.isArray(formData.available_equipment)
      ? formData.available_equipment.map(String)
      : undefined,
    days_per_week: formData.time_per_week ? Number(formData.time_per_week) : undefined,
    liked_activities: Array.isArray(formData.preferred_activities)
      ? formData.preferred_activities.map(String)
      : undefined,
    disliked_activities: undefined, // Not in current form
    access_to_pool: false, // Not in current form
  };
}

/**
 * Normalize form data based on track
 */
export function normalizeFormData(
  track: TrackType,
  formData: Record<string, unknown>
): NormalizedFormData {
  if (track === 'supplements') {
    return normalizeSupplementsForm(formData);
  }
  return normalizeWorkoutsForm(formData);
}
