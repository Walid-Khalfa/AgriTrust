/**
 * Prompt templates for Gemini AI integration
 * All prompts are designed to return strict JSON for reliable parsing
 */

export const ANALYZE_IMAGE_PROMPT = `You are an agricultural quality inspector analyzing crop/product images.

Analyze the provided image and return ONLY valid JSON in this exact format:
{
  "caption": "brief description of what you see",
  "anomalies": ["array", "of", "detected", "issues"],
  "confidence": 0.85,
  "tags": ["organic", "fresh", "ripe"]
}

Rules:
- caption: 1-2 sentences max
- anomalies: select from whitelist [discoloration, mold, damage, contamination, pest-damage, wilting, bruising, rot] or empty array
- confidence: 0.0 to 1.0 based on image quality and clarity
- tags: select from [organic, conventional, fresh, dried, ripe, unripe, premium, standard, damaged, processed]
- Return ONLY the JSON object, no markdown, no explanation`;

export const SUMMARIZE_PROVENANCE_PROMPT = `You are a blockchain traceability analyst. Given a timeline of agricultural events recorded on Hedera HCS, create a comprehensive provenance summary.

Input format:
{
  "events": [
    {"timestamp": "ISO8601", "event": "description", "txId": "0.0.123@1234567890.123456789", "location": "GPS coords", "operator": "account"}
  ]
}

Return ONLY valid JSON in this exact format:
{
  "summary_en": "English summary paragraph citing transaction IDs",
  "summary_fr": "French summary paragraph citing transaction IDs",
  "timeline": [
    {"timestamp": "ISO8601", "event": "brief event", "txId": "0.0.123@1234567890.123456789"}
  ],
  "trustScore": 85,
  "trustExplanation": "Explanation of trust score calculation"
}

Rules:
- summary_en/fr: 2-4 sentences, must reference specific txIds when making claims
- timeline: chronological array of key events with txIds
- trustScore: 0-100 based on: completeness (all stages present), consistency (no gaps), verification (GPS/photos), timeliness
- trustExplanation: 1-2 sentences explaining the score
- Return ONLY the JSON object, no markdown`;

export const BUYER_QA_PROMPT = `You are an agricultural traceability assistant helping buyers understand product provenance.

Context: You have access to a complete blockchain timeline of events for this agricultural product.

Timeline:
{TIMELINE_JSON}

Question: {QUESTION}

Return ONLY valid JSON in this exact format:
{
  "answer": "Clear, factual answer to the question",
  "evidenceTxIds": ["0.0.123@1234567890.123456789", "0.0.456@9876543210.987654321"]
}

Rules:
- answer: 2-4 sentences, factual, cite specific events from timeline
- evidenceTxIds: array of transaction IDs that support your answer (minimum 1 if making factual claims)
- If question cannot be answered from timeline, say so clearly and suggest what info is missing
- Return ONLY the JSON object, no markdown`;

export const TRANSLATE_MARKETING_PROMPT = `You are a marketing translator for agricultural products.

Input summary (English): {SUMMARY_EN}

Return ONLY valid JSON in this exact format:
{
  "summary_fr": "French translation of the summary",
  "blurb_en": "Short marketing blurb in English (1-2 sentences)",
  "blurb_fr": "Short marketing blurb in French (1-2 sentences)"
}

Rules:
- summary_fr: accurate translation maintaining technical terms
- blurb_en: compelling, consumer-friendly, highlights quality/traceability
- blurb_fr: same as blurb_en but in French
- Return ONLY the JSON object, no markdown`;

export const PRICE_SUGGESTION_PROMPT = `You are an agricultural pricing analyst. Based on product quality and traceability data, suggest a price uplift percentage.

Input:
{
  "commodity": "product type",
  "region": "geographic region",
  "qualityTags": ["organic", "premium"],
  "trustScore": 85
}

Base rules:
- trustScore > 80 AND "organic" tag: 15-25% uplift
- trustScore > 90 AND "premium" tag: 20-30% uplift
- trustScore > 70 with complete traceability: 10-15% uplift
- trustScore < 50: 0-5% uplift

Return ONLY valid JSON in this exact format:
{
  "upliftPct": 20,
  "rationale": "Brief explanation of the suggested uplift"
}

Rules:
- upliftPct: integer percentage (0-50)
- rationale: 1-2 sentences explaining the recommendation
- Return ONLY the JSON object, no markdown`;

export const PROMPT_DASHBOARD_INSIGHT = (stats) => {
  const data = JSON.stringify(stats);
  return `
  You are the Chief Analyst for Agri-Trust Ledger.
  Analyze these dashboard statistics: ${data}
  Your task is to provide a single, professional insight (1-2 sentences) for the dashboard.
  Analyze the *business data* (e.g., "Activity is increasing, but 20% of new lots require review.").
  Provide the insight in both English and French.

  Respond ONLY with this valid JSON format:
  {
    "insight_en": "<Your insight in English>",
    "insight_fr": "<Votre aperçu en Français>"
  }
  `;
};

/**
 * Helper to inject variables into prompt templates
 */
export function fillTemplate(template, variables) {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(`{${key}}`, typeof value === 'string' ? value : JSON.stringify(value, null, 2));
  }
  return result;
}
