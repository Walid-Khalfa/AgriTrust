/**
 * AI Routes - Gemini-powered endpoints for image analysis, provenance, Q&A, etc.
 */

import express from 'express';
import {
  analyzeImage,
  summarizeProvenance,
  buyerQA,
  translateMarketing,
  priceSuggestion
} from '../ai/gemini.js';
import { supabase } from '../db.js';

const router = express.Router();

/**
 * POST /api/ai/analyze-image
 * Analyze agricultural product image
 */
router.post('/analyze-image', async (req, res) => {
  try {
    const { photoUrl, batchId } = req.body;

    if (!photoUrl) {
      return res.status(400).json({ ok: false, error: 'photoUrl is required' });
    }

    const result = await analyzeImage(photoUrl);
    console.log(`✅ Image analysis completed in ${result.ms}ms`);

    // Cache to database if batchId provided
    if (batchId && !result.error) {
      const { error: dbError } = await supabase
        .from('batches')
        .update({ 
          ai_analysis: {
            caption: result.caption,
            anomalies: result.anomalies,
            confidence: result.confidence,
            tags: result.tags,
            generatedAt: new Date().toISOString(),
            ms: result.ms
          }
        })
        .eq('id', batchId);

      if (dbError) {
        console.error('Failed to cache AI analysis:', dbError);
      }
    }

    res.json({ ok: true, data: result });
  } catch (error) {
    console.error('AI analyze-image error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * POST /api/ai/summarize-provenance
 * Generate provenance summary from HCS timeline
 */
router.post('/summarize-provenance', async (req, res) => {
  try {
    const { hcsTimeline, tokenId, serial } = req.body;

    if (!hcsTimeline || !Array.isArray(hcsTimeline)) {
      return res.status(400).json({ ok: false, error: 'hcsTimeline array is required' });
    }

    const result = await summarizeProvenance(hcsTimeline);
    console.log(`✅ Provenance summary completed in ${result.ms}ms (trust: ${result.trustScore})`);

    // Cache to database if tokenId/serial provided
    if (tokenId && serial && !result.error) {
      const { error: dbError } = await supabase
        .from('verifications')
        .update({
          trace: {
            ai: {
              summary_en: result.summary_en,
              summary_fr: result.summary_fr,
              timeline: result.timeline,
              trustScore: result.trustScore,
              trustExplanation: result.trustExplanation,
              generatedAt: new Date().toISOString(),
              ms: result.ms
            }
          }
        })
        .eq('token_id', tokenId)
        .eq('serial_number', serial);

      if (dbError) {
        console.error('Failed to cache provenance summary:', dbError);
      }
    }

    res.json({ ok: true, data: result });
  } catch (error) {
    console.error('AI summarize-provenance error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * POST /api/ai/buyer-qa
 * Answer buyer questions about product provenance
 */
router.post('/buyer-qa', async (req, res) => {
  try {
    const { question, hcsTimeline } = req.body;

    if (!question) {
      return res.status(400).json({ ok: false, error: 'question is required' });
    }

    if (!hcsTimeline || !Array.isArray(hcsTimeline)) {
      return res.status(400).json({ ok: false, error: 'hcsTimeline array is required' });
    }

    const result = await buyerQA(question, hcsTimeline);
    console.log(`✅ Buyer Q&A completed in ${result.ms}ms`);

    res.json({ ok: true, data: result });
  } catch (error) {
    console.error('AI buyer-qa error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * POST /api/ai/translate-marketing
 * Translate and generate marketing content
 */
router.post('/translate-marketing', async (req, res) => {
  try {
    const { summary_en } = req.body;

    if (!summary_en) {
      return res.status(400).json({ ok: false, error: 'summary_en is required' });
    }

    const result = await translateMarketing(summary_en);
    console.log(`✅ Marketing translation completed in ${result.ms}ms`);

    res.json({ ok: true, data: result });
  } catch (error) {
    console.error('AI translate-marketing error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * POST /api/ai/price-suggestion
 * Suggest price uplift based on quality and traceability
 */
router.post('/price-suggestion', async (req, res) => {
  try {
    const { commodity, region, qualityTags, trustScore } = req.body;

    if (!commodity) {
      return res.status(400).json({ ok: false, error: 'commodity is required' });
    }

    const result = await priceSuggestion({
      commodity,
      region: region || 'unknown',
      qualityTags: qualityTags || [],
      trustScore: trustScore || 0
    });
    console.log(`✅ Price suggestion completed in ${result.ms}ms: ${result.upliftPct}%`);

    res.json({ ok: true, data: result });
  } catch (error) {
    console.error('AI price-suggestion error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;
