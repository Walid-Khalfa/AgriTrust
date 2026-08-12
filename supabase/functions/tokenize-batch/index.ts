import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import {
  Client,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TokenId,
  AccountId,
} from "npm:@hashgraph/sdk@2.49.2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-demo-mode",
};

function parseGeminiJSON(text: string): any {
  if (!text) return null;
  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

async function generateProvenanceSummary(timeline: any[]): Promise<any> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    console.warn("[tokenize-batch] GEMINI_API_KEY not set - skipping AI summary");
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: Deno.env.get("GEMINI_MODEL") || "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    const prompt = `You are a supply chain provenance analyst for agricultural products.
Analyze the HCS (Hedera Consensus Service) event timeline and produce a concise trust report.

Timeline data:
${JSON.stringify({ events: timeline }, null, 2)}

Return ONLY valid JSON with exactly this shape (no markdown):
{
  "summary_en": "2-3 sentence English summary of the provenance trail",
  "summary_fr": "2-3 sentence French summary of the provenance trail",
  "trustScore": 0-100,
  "trustExplanation": "One sentence explaining the trust score"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const parsed = parseGeminiJSON(response.text());
    if (!parsed) {
      console.warn("[tokenize-batch] Gemini returned invalid JSON");
    }
    return parsed;
  } catch (error) {
    console.warn("[tokenize-batch] Gemini summary failed:", error.message);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Require authentication: verify the caller's Supabase JWT
    const authHeader = req.headers.get("Authorization");
    const authSupabaseUrl = Deno.env.get("SUPABASE_URL");
    const authSupabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "Missing Authorization header. Please log in first." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!authSupabaseUrl || !authSupabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "Server configuration error: SUPABASE_URL or SUPABASE_ANON_KEY not configured" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authSupabase = createClient(authSupabaseUrl, authSupabaseAnonKey);
    const { data: { user }, error: authError } = await authSupabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      console.warn("[tokenize-batch] Auth failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "Invalid or expired session. Please log in again." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[tokenize-batch] Request received");
    const body = await req.json();
    console.log("[tokenize-batch] Request body:", JSON.stringify(body));
    const { hcsTransactionIds, batchId } = body;

    if (!hcsTransactionIds || !Array.isArray(hcsTransactionIds) || hcsTransactionIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "hcsTransactionIds array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Hedera client
    const operatorId = Deno.env.get("HEDERA_OPERATOR_ID");
    const operatorKey = Deno.env.get("HEDERA_OPERATOR_KEY");
    const network = Deno.env.get("HEDERA_NETWORK") || "testnet";

    console.log("[tokenize-batch] Hedera credentials check:", {
      hasOperatorId: !!operatorId,
      hasOperatorKey: !!operatorKey,
      network
    });

    if (!operatorId || !operatorKey) {
      throw new Error("Missing Hedera credentials");
    }

    console.log("[tokenize-batch] Creating Hedera client...");
    const client = Client.forTestnet();
    
    console.log("[tokenize-batch] Parsing operator key...");
    let privateKey;
    try {
      privateKey = PrivateKey.fromStringDer(operatorKey);
    } catch (derError) {
      console.log("[tokenize-batch] DER parsing failed, trying ED25519...");
      try {
        privateKey = PrivateKey.fromStringED25519(operatorKey);
      } catch (ed25519Error) {
        console.log("[tokenize-batch] ED25519 parsing failed, trying ECDSA...");
        privateKey = PrivateKey.fromStringECDSA(operatorKey);
      }
    }
    
    console.log("[tokenize-batch] Setting operator...");
    client.setOperator(
      AccountId.fromString(operatorId),
      privateKey
    );
    console.log("[tokenize-batch] Hedera client initialized successfully");

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch batch data if batchId provided
    let batchData = null;
    if (batchId) {
      const { data, error } = await supabase
        .from("batches")
        .select("*")
        .eq("id", batchId)
        .single();

      if (error) {
        console.error("Error fetching batch:", error);
      } else {
        batchData = data;
      }
    }

    // Create NFT token
    const tokenName = batchData?.product_type || "AgriTrust Certificate";
    const tokenSymbol = "AGRI";
    
    console.log("[tokenize-batch] Creating token transaction...");
    const tokenCreateTx = await new TokenCreateTransaction()
      .setTokenName(tokenName)
      .setTokenSymbol(tokenSymbol)
      .setTokenType(TokenType.NonFungibleUnique)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(1000)
      .setTreasuryAccountId(AccountId.fromString(operatorId))
      .setAdminKey(privateKey.publicKey)
      .setSupplyKey(privateKey.publicKey)
      .freezeWith(client);

    console.log("[tokenize-batch] Executing token creation...");
    const tokenCreateSubmit = await tokenCreateTx.execute(client);
    const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(client);
    const tokenId = tokenCreateReceipt.tokenId;

    if (!tokenId) {
      throw new Error("Failed to create token");
    }

    // Mint NFT with HCS transaction IDs as metadata (compact format)
    const metadataString = JSON.stringify({
      hcs: hcsTransactionIds,
      bid: batchId,
      ts: new Date().toISOString(),
    });
    const metadata = new TextEncoder().encode(metadataString);

    console.log("[tokenize-batch] Creating mint transaction...");
    const mintTx = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata([metadata])
      .freezeWith(client);

    console.log("[tokenize-batch] Executing mint transaction...");
    const mintSubmit = await mintTx.execute(client);
    const mintReceipt = await mintSubmit.getReceipt(client);

    const serialNumbers = mintReceipt.serials;
    const tokenIdStr = tokenId.toString();
    const serialStr = serialNumbers[0]?.toString();

    // Build provenance timeline for AI summary
    const timeline = hcsTransactionIds.map((txId, idx) => ({
      timestamp: batchData?.created_at || new Date().toISOString(),
      event: idx === 0 ? "BATCH_REGISTERED" : `SUPPLY_CHAIN_EVENT_${idx + 1}`,
      txId,
      location: batchData?.location || "Unknown",
      operator: "AgriTrust Operator",
    }));

    // Generate AI provenance summary (non-blocking)
    let aiSummary = null;
    const summaryResult = await generateProvenanceSummary(timeline);
    if (summaryResult) {
      aiSummary = {
        summary_en: summaryResult.summary_en || "Provenance summary unavailable",
        summary_fr: summaryResult.summary_fr || "Résumé de provenance indisponible",
        timeline: timeline.map(({ timestamp, event, txId }) => ({ timestamp, event, txId })),
        trustScore: summaryResult.trustScore ?? null,
        trustExplanation: summaryResult.trustExplanation || "Unable to calculate trust score",
        generatedAt: new Date().toISOString(),
      };
    }

    // Update batch with token + verification data if batchId provided
    if (batchId) {
      const batchUpdate: Record<string, unknown> = {
        hedera_token_id: tokenIdStr,
        hedera_serial_number: serialStr,
        hcs_transaction_ids: hcsTransactionIds,
        tokenized_at: new Date().toISOString(),
      };
      if (aiSummary) {
        batchUpdate.ai_provenance_summary = JSON.stringify(aiSummary);
      }

      const { error: updateError } = await supabase
        .from("batches")
        .update(batchUpdate)
        .eq("id", batchId);

      if (updateError) {
        console.error("[tokenize-batch] Batch update error:", updateError.message);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        tokenId: tokenIdStr,
        serialNumber: serialStr,
        transactionId: mintSubmit.transactionId.toString(),
        ai_summary: aiSummary,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[tokenize-batch] Error:", error);
    console.error("[tokenize-batch] Error stack:", error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
