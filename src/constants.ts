/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Engagement } from './types';

export const SAMPLE_DOCTORS: Engagement[] = [
  {
    id: '1',
    date: '2024-05-10',
    doctor_name: "Dr. Sarah Mitchell",
    doctor_type: "Cardiologist",
    hospital: "Manchester Heart Institute",
    region: "United Kingdom",
    product_name: "CardioFlow",
    engagement_history: [
      "Met during regional cardiology conference",
      "Interested in patient adherence studies",
      "Requested clinical efficacy comparison"
    ],
    preferred_channel: "Email",
    interaction_goal: "Clinical data update",
    sentiment: 'Positive',
    engagement_score: 85
  },
  {
    id: '2',
    date: '2024-05-12',
    doctor_name: "Dr. James Wilson",
    doctor_type: "General Physician",
    hospital: "Leeds Community Clinic",
    region: "United Kingdom",
    product_name: "GlucoEase",
    engagement_history: [
      "Previously attended webinar",
      "Discussed patient compliance challenges",
      "Requested educational brochures"
    ],
    preferred_channel: "WhatsApp",
    interaction_goal: "Follow-up",
    sentiment: 'Neutral',
    engagement_score: 62
  },
  {
    id: '3',
    date: '2024-05-14',
    doctor_name: "Dr. Priya Raman",
    doctor_type: "Oncologist",
    hospital: "Birmingham Cancer Centre",
    region: "United Kingdom",
    product_name: "OncoRelief",
    engagement_history: [
      "Interested in latest trial data",
      "Discussed treatment pathway improvements",
      "Requested follow-up meeting"
    ],
    preferred_channel: "In-person",
    interaction_goal: "Educational engagement",
    sentiment: 'Positive',
    engagement_score: 92
  }
];

export const DOCTOR_TYPES = [
  "General Physician",
  "Cardiologist",
  "Oncologist",
  "Neurologist",
  "Endocrinologist",
  "Pediatrician",
  "Dermatologist"
] as const;

export const CHANNELS = [
  "Email",
  "WhatsApp",
  "In-person",
  "Webinar",
  "Phone call"
] as const;

export const GOALS = [
  "Product awareness",
  "Follow-up",
  "Educational engagement",
  "Patient support discussion",
  "Clinical data update"
] as const;
