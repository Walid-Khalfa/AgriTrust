import dotenv from 'dotenv';
dotenv.config();
import { Client, TopicCreateTransaction, PrivateKey, AccountId } from '@hashgraph/sdk';

async function main() {
  const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
  // Use fromStringECDSA for hex-encoded ECDSA private keys
  const operatorKey = PrivateKey.fromStringECDSA(process.env.OPERATOR_KEY);

  const client = Client.forTestnet().setOperator(operatorId, operatorKey);

  const tx = await new TopicCreateTransaction().execute(client);
  const receipt = await tx.getReceipt(client);
  const topicId = receipt.topicId.toString();

  console.log('✅ HEDERA_TOPIC_ID=', topicId);
}

main().catch((e) => {
  console.error('❌ Error creating topic:', e.message);
  process.exit(1);
});
