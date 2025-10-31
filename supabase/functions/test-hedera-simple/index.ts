import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  Client,
  PrivateKey,
  AccountId,
  AccountBalanceQuery,
} from "npm:@hashgraph/sdk@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const operatorId = Deno.env.get("HEDERA_OPERATOR_ID");
    const operatorKey = Deno.env.get("HEDERA_OPERATOR_KEY");
    const network = Deno.env.get("HEDERA_NETWORK") || "testnet";

    console.log("Environment check:", {
      hasOperatorId: !!operatorId,
      operatorId: operatorId,
      hasOperatorKey: !!operatorKey,
      operatorKeyLength: operatorKey?.length,
      operatorKeyPrefix: operatorKey?.substring(0, 10),
      operatorKeySuffix: operatorKey?.substring(operatorKey.length - 10),
      network,
    });

    if (!operatorId || !operatorKey) {
      throw new Error("Missing Hedera credentials");
    }

    // Test key parsing with all methods
    let privateKey;
    let keyMethod = "";
    
    try {
      privateKey = PrivateKey.fromStringDer(operatorKey);
      keyMethod = "DER";
      console.log("✓ Key parsed successfully with DER method");
    } catch (derError) {
      console.log("✗ DER parsing failed:", derError.message);
      
      try {
        privateKey = PrivateKey.fromStringED25519(operatorKey);
        keyMethod = "ED25519";
        console.log("✓ Key parsed successfully with ED25519 method");
      } catch (ed25519Error) {
        console.log("✗ ED25519 parsing failed:", ed25519Error.message);
        
        try {
          privateKey = PrivateKey.fromStringECDSA(operatorKey);
          keyMethod = "ECDSA";
          console.log("✓ Key parsed successfully with ECDSA method");
        } catch (ecdsaError) {
          console.log("✗ ECDSA parsing failed:", ecdsaError.message);
          throw new Error("Failed to parse private key with any method");
        }
      }
    }

    console.log("Key info:", {
      method: keyMethod,
      publicKey: privateKey.publicKey.toString(),
    });

    // Create client
    const client = Client.forTestnet();
    client.setOperator(AccountId.fromString(operatorId), privateKey);

    console.log("Client configured, testing with balance query...");

    // Simple balance query to test credentials
    const balance = await new AccountBalanceQuery()
      .setAccountId(operatorId)
      .execute(client);

    console.log("✓ Balance query successful!");

    return new Response(
      JSON.stringify({
        success: true,
        operatorId,
        keyMethod,
        publicKey: privateKey.publicKey.toString(),
        balance: balance.hbars.toString(),
        message: "Hedera credentials are valid!",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    console.error("Stack:", error.stack);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
