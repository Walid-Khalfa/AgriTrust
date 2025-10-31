import { TopicMessageSubmitTransaction, TopicId } from '@hashgraph/sdk';
import { getHederaClient } from './hederaClient.js';
import { env } from './utils/config.js';

/**
 * Submit batch data to Hedera Consensus Service (HCS)
 * @param {Object} batchData - Batch data to submit (will be JSON stringified)
 * @returns {Promise<{transactionId: string, receipt: Object}>}
 */
export async function submitBatchData(batchData) {
  try {
    const client = getHederaClient();
    const topicId = TopicId.fromString(env.HEDERA_TOPIC_ID);

    // Convert batch data to JSON string
    const message = JSON.stringify({
      ...batchData,
      timestamp: new Date().toISOString()
    });

    // Submit message to HCS topic
    const transaction = new TopicMessageSubmitTransaction({
      topicId: topicId,
      message: message
    });

    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);

    console.log(`✅ HCS message submitted - Transaction ID: ${txResponse.transactionId.toString()}`);

    return {
      transactionId: txResponse.transactionId.toString(),
      receipt: {
        status: receipt.status.toString(),
        topicSequenceNumber: receipt.topicSequenceNumber?.toString()
      }
    };
  } catch (error) {
    console.error('❌ HCS submission failed:', error.message);
    throw new Error(`Failed to submit to HCS: ${error.message}`);
  }
}

/**
 * Fetch HCS message from Mirror Node
 * @param {string} topicId - Topic ID
 * @param {string} sequenceNumber - Message sequence number
 * @returns {Promise<Object>} Message data
 */
export async function fetchHCSMessage(topicId, sequenceNumber) {
  try {
    const axios = (await import('axios')).default;
    const url = `${config.MIRROR_NODE_URL}/api/v1/topics/${topicId}/messages/${sequenceNumber}`;
    
    const response = await axios.get(url);
    
    // Decode base64 message
    const messageBuffer = Buffer.from(response.data.message, 'base64');
    const messageData = JSON.parse(messageBuffer.toString('utf-8'));
    
    return {
      ...messageData,
      consensusTimestamp: response.data.consensus_timestamp,
      sequenceNumber: response.data.sequence_number
    };
  } catch (error) {
    console.error('❌ Failed to fetch HCS message:', error.message);
    throw new Error(`Failed to fetch HCS message: ${error.message}`);
  }
}
