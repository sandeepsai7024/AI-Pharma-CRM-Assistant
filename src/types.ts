/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Engagement {
  id: string;
  date: string;
  doctor_name: string;
  doctor_type: 'General Physician' | 'Cardiologist' | 'Oncologist' | 'Neurologist' | 'Endocrinologist' | 'Pediatrician' | 'Dermatologist';
  hospital: string;
  region: string;
  product_name: string;
  engagement_history: string[];
  preferred_channel: 'Email' | 'WhatsApp' | 'In-person' | 'Webinar' | 'Phone call';
  interaction_goal: 'Product awareness' | 'Follow-up' | 'Educational engagement' | 'Patient support discussion' | 'Clinical data update';
  sentiment?: 'Positive' | 'Neutral' | 'Concerned';
  engagement_score?: number;
}

export interface AIStrategyResponse {
  summary: string;
  compliant_follow_ups: string[];
  discussion_points: {
    clinical_relevance: string;
    patient_adherence: string;
    treatment_outcomes: string;
    safety_profile: string;
  };
  omnichannel_ideas: string[];
  next_best_actions: string[];
  crm_notes: string;
  risk_alert: {
    level: 'Low' | 'Medium' | 'High';
    message: string;
  };
}
