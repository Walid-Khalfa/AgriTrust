import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

const base = process.env.MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com';
const topicId = process.env.HEDERA_TOPIC_ID;

if (!topicId) {
  console.error('❌ Set HEDERA_TOPIC_ID in .env first');
  process.exit(1);
}

axios.get(`${base}/api/v1/topics/${topicId}`)
  .then(r => console.log('✅ Topic OK:', r.data.topic_id || r.data))
  .catch(e => console.error('❌ Mirror error:', e.response?.data || e.message));
