/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Engagement, AIStrategyResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateEngagementStrategy(engagement: Engagement): Promise<AIStrategyResponse> {
  const prompt = `
    You are an AI Pharma CRM Commercial Assistant. 
    Generate a personalized, compliant doctor engagement strategy for the following profile:

    Doctor: ${engagement.doctor_name} (${engagement.doctor_type})
    Hospital: ${engagement.hospital}
    Region: ${engagement.region}
    Product: ${engagement.product_name}
    History: ${engagement.engagement_history.join(", ")}
    Goal: ${engagement.interaction_goal}
    Preferred Channel: ${engagement.preferred_channel}

    CRITICAL COMPLIANCE RULES:
    1. Avoid exaggerated claims.
    2. Avoid unethical language (e.g., no mention of kickbacks, bribery, or personal gifts).
    3. Maintain a professional, educational, and medical tone.
    4. Focus on patient outcomes and clinical evidence.
    5. Do not make up specific medical numbers, use placeholders for trial data if needed.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            compliant_follow_ups: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            discussion_points: {
              type: Type.OBJECT,
              properties: {
                clinical_relevance: { type: Type.STRING },
                patient_adherence: { type: Type.STRING },
                treatment_outcomes: { type: Type.STRING },
                safety_profile: { type: Type.STRING }
              }
            },
            omnichannel_ideas: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            next_best_actions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            crm_notes: { type: Type.STRING },
            risk_alert: {
              type: Type.OBJECT,
              properties: {
                level: { type: Type.STRING, description: "Low, Medium, or High" },
                message: { type: Type.STRING }
              }
            }
          },
          required: ["summary", "compliant_follow_ups", "discussion_points", "omnichannel_ideas", "next_best_actions", "crm_notes", "risk_alert"]
        }
      }
    });

    return JSON.parse(response.text || "{}") as AIStrategyResponse;
  } catch (error) {
    console.error("Error generating strategy:", error);
    throw new Error("Failed to generate AI strategy. Please check your API key.");
  }
}
