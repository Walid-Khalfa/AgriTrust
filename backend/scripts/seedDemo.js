import "dotenv/config";
import { supabase } from "../src/db.js";
import { submitBatchData } from "../src/hcs.js";
import { createBatchNFT } from "../src/hts.js";
import { summarizeProvenance } from "../src/ai/gemini.js";
import { env } from "../src/utils/config.js";

const DEMO_BASE_URL = (process.env.DEMO_BASE_URL || process.env.VITE_APP_URL || "http://localhost:5173").replace(/\/$/, "");
const DEMO_PHOTO_URL = "https://i.imgur.com/g8vA5T8.jpeg";

async function seedDemo() {
  console.log("Seeding AgriTrust demo data...");
  console.log(`Using Hedera operator: ${env.HEDERA_OPERATOR_ID}`);

  try {
    console.log("\nSending events to Hedera HCS...");
    const timelineEvents = [
      {
        type: "PLANTING",
        location: "Kigali Highlands, Rwanda",
        variety: "Arabica Red Bourbon",
        operator: env.HEDERA_OPERATOR_ID,
        timestamp: new Date("2025-01-15T10:00:00Z").toISOString(),
      },
      {
        type: "HARVEST",
        location: "Kigali Highlands, Rwanda",
        quantityKg: 500,
        photoUrl: DEMO_PHOTO_URL,
        operator: env.HEDERA_OPERATOR_ID,
        timestamp: new Date("2025-09-10T14:30:00Z").toISOString(),
      },
      {
        type: "SHIPPING",
        destination: "Port of Mombasa",
        operator: env.HEDERA_OPERATOR_ID,
        timestamp: new Date("2025-09-15T11:00:00Z").toISOString(),
      },
    ];

    const hcsTransactionIds = [];
    for (const event of timelineEvents) {
      const response = await submitBatchData(event);
      hcsTransactionIds.push(response.transactionId);
      console.log(`   - ${event.type} -> ${response.transactionId}`);
    }

    console.log("\nMinting demo NFT on Hedera HTS...");
    const { tokenId, serialNumber } = await createBatchNFT(hcsTransactionIds);
    console.log(`   - NFT minted: ${tokenId} #${serialNumber}`);

    const hcsTimeline = timelineEvents.map((event, idx) => ({
      timestamp: event.timestamp,
      event: event.type,
      eventData: event,
      txId: hcsTransactionIds[idx],
      location: event.location || event.destination || "Unknown",
      operator: event.operator || "AgriTrust Demo Operator",
    }));

    console.log("\nGenerating AI provenance summary (Gemini)...");
    let aiSummary = await summarizeProvenance(
      hcsTimeline.map(({ timestamp, event, txId, location, operator }) => ({
        timestamp,
        event,
        txId,
        location,
        operator,
      }))
    );

    if (aiSummary.error) {
      console.warn(`Gemini summarization failed (${aiSummary.error}). Using fallback insight.`);
      aiSummary = {
        summary_en: "Demo batch cultivated in Rwanda with complete on-chain traceability.",
        summary_fr: "Lot de démonstration cultivé au Rwanda avec une traçabilité complète sur la blockchain.",
        timeline: hcsTimeline.map(({ timestamp, event, txId }) => ({ timestamp, event, txId })),
        trustScore: 88,
        trustExplanation: "Fallback insight generated because the AI quota was exceeded. Blockchain proofs remain valid.",
        ms: 0,
      };
    }
    console.log(`   - Trust score ${aiSummary.trustScore ?? "N/A"} with rationale: ${aiSummary.trustExplanation}`);

    console.log("\nPersisting records into Supabase...");

    await supabase
      .from("batches")
      .delete()
      .eq("hedera_token_id", tokenId)
      .eq("hedera_serial_number", serialNumber);

    const { error: batchError } = await supabase.from("batches").insert({
      batch_name: "Demo Organic Coffee Batch #1",
      product_type: "Organic Coffee Beans",
      quantity: "500",
      harvest_date: "2025-09-10",
      location: "Kigali Highlands, Rwanda",
      photo_url: DEMO_PHOTO_URL,
      hcs_tx_id: hcsTransactionIds[1],
      hedera_token_id: tokenId,
      hedera_serial_number: serialNumber,
      hcs_transaction_ids: hcsTransactionIds,
      ai_analysis: {
        caption: "Healthy coffee plants in the Rwandan highlands",
        anomalies: [],
        confidence: 0.94,
        tags: ["organic", "premium", "fresh"],
        generatedAt: new Date().toISOString(),
      },
      ai_provenance_summary: aiSummary.summary_en,
      certifications: ["Organic", "Fair Trade"],
    });

    if (batchError) {
      throw new Error(`Supabase batches error: ${batchError.message}`);
    }

    await supabase
      .from("tokens")
      .delete()
      .eq("token_id", tokenId)
      .eq("serial_number", serialNumber);

    const { error: tokenError } = await supabase.from("tokens").insert({
      token_id: tokenId,
      serial_number: serialNumber,
      hcs_tx_ids: hcsTransactionIds,
    });

    if (tokenError) {
      throw new Error(`Supabase tokens error: ${tokenError.message}`);
    }

    await supabase
      .from("verifications")
      .delete()
      .eq("token_id", tokenId)
      .eq("serial_number", serialNumber);

    const { error: verificationError } = await supabase.from("verifications").insert({
      token_id: tokenId,
      serial_number: serialNumber,
      trace: {
        tokenId,
        serialNumber,
        status: "verified",
        verifiedAt: new Date().toISOString(),
        hcsTimeline: hcsTimeline.map(({ timestamp, event, eventData, txId }) => ({
          timestamp,
          event,
          eventData,
          txId,
        })),
        ai: {
          summary_en: aiSummary.summary_en,
          summary_fr: aiSummary.summary_fr,
          timeline: aiSummary.timeline,
          trustScore: aiSummary.trustScore,
          trustExplanation: aiSummary.trustExplanation,
          generatedAt: new Date().toISOString(),
          ms: aiSummary.ms,
        },
      },
    });

    if (verificationError) {
      throw new Error(`Supabase verifications error: ${verificationError.message}`);
    }

    const verifyUrl = `${DEMO_BASE_URL}/verify/${tokenId}/${serialNumber}`;
    console.log("\nDemo seed completed successfully!");
    console.log("------------------------------------");
    console.log(`Token ID     : ${tokenId}`);
    console.log(`Serial Number: ${serialNumber}`);
    console.log(`HCS tx IDs   : ${hcsTransactionIds.join(", ")}`);
    console.log("\nCopy this URL into your demo links:");
    console.log(verifyUrl);
    console.log("------------------------------------");
    process.exit(0);
  } catch (error) {
    console.error("\nDemo seed failed");
    console.error(error.message);
    process.exit(1);
  }
}

seedDemo();
