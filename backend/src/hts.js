import { 
  TokenCreateTransaction, 
  TokenType, 
  TokenSupplyType,
  TokenMintTransaction,
  PrivateKey
} from '@hashgraph/sdk';
import { getHederaClient } from './hederaClient.js';
import { env } from './utils/config.js';

/**
 * Create NFT for batch with HCS transaction IDs as metadata
 * @param {string[]} hcsTransactionIds - Array of HCS transaction IDs
 * @returns {Promise<{tokenId: string, serialNumber: string}>}
 */
export async function createBatchNFT(hcsTransactionIds) {
  try {
    const client = getHederaClient();
    const treasuryKey = PrivateKey.fromString(env.HEDERA_OPERATOR_KEY);
    const supplyKey = PrivateKey.fromString(env.HEDERA_OPERATOR_KEY);

    // Create NFT token
    const tokenCreateTx = await new TokenCreateTransaction()
      .setTokenName('AgriTrust Batch Certificate')
      .setTokenSymbol('AGRI')
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(client.operatorAccountId)
      .setSupplyType(TokenSupplyType.Infinite)
      .setSupplyKey(supplyKey)
      .setMaxTransactionFee(20)
      .freezeWith(client)
      .sign(treasuryKey);

    const tokenCreateSubmit = await tokenCreateTx.execute(client);
    const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(client);
    const tokenId = tokenCreateReceipt.tokenId;

    console.log(`✅ NFT Token created: ${tokenId.toString()}`);

    // Prepare compact metadata (Hedera NFT metadata max 100 bytes)
    // Store only count and timestamp, full data retrievable from HCS
    const metadata = JSON.stringify({
      count: hcsTransactionIds.length,
      created: new Date().toISOString().split('T')[0]
    });

    // Mint NFT with metadata
    const mintTx = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata([Buffer.from(metadata)])
      .setMaxTransactionFee(20)
      .freezeWith(client)
      .sign(supplyKey);

    const mintSubmit = await mintTx.execute(client);
    const mintReceipt = await mintSubmit.getReceipt(client);
    const serialNumber = mintReceipt.serials[0];

    console.log(`✅ NFT minted - Serial: ${serialNumber.toString()}`);

    return {
      tokenId: tokenId.toString(),
      serialNumber: serialNumber.toString()
    };
  } catch (error) {
    console.error('❌ NFT creation failed:', error.message);
    throw new Error(`Failed to create NFT: ${error.message}`);
  }
}

/**
 * Fetch NFT metadata from Mirror Node
 * @param {string} tokenId - Token ID
 * @param {string} serialNumber - Serial number
 * @returns {Promise<Object>} NFT metadata
 */
export async function fetchNFTMetadata(tokenId, serialNumber) {
  try {
    const axios = (await import('axios')).default;
    const url = `${env.MIRROR_NODE_URL}/api/v1/tokens/${tokenId}/nfts/${serialNumber}`;
    
    const response = await axios.get(url);
    
    // Decode base64 metadata
    const metadataBuffer = Buffer.from(response.data.metadata, 'base64');
    const metadata = JSON.parse(metadataBuffer.toString('utf-8'));
    
    return {
      ...metadata,
      tokenId: response.data.token_id,
      serialNumber: response.data.serial_number,
      accountId: response.data.account_id
    };
  } catch (error) {
    console.error('❌ Failed to fetch NFT metadata:', error.message);
    throw new Error(`Failed to fetch NFT metadata: ${error.message}`);
  }
}
