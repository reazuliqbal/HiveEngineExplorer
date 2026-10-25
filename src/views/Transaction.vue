<template>
  <div class="px-3 pt-3 pb-3">
    <template v-if="dataLoaded">
      <div
        v-if="transaction"
        class="transaction"
      >
        <JsonViewer
          :value="transaction"
          :theme="isDark ? 'jv-dark' : 'jv-light'"
          :expand-depth="5"
          copyable
          sort
        />
      </div>

      <div v-else>
        {{ failed ? 'Failed to load transaction. Please try again.' : 'Transaction not found!' }}
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { JsonViewer } from 'vue3-json-viewer';
import HE from '../modules/HE';
import { parseJSON } from '../helpers';
import useAppLoader from '../composables/useAppLoader';

const { isDark, show } = useAppLoader();
const loader = show();

const route = useRoute();

const transaction = ref(null);
const dataLoaded = ref(false);
const failed = ref(false);

watch(dataLoaded, (loaded) => {
  if (loaded) loader.hide();
});

init();

async function init() {
  try {
    const { txid } = route.params;

    const regex = new RegExp(/^([\d]+)-[\d]+$/m);

    if (regex.test(txid)) {
      const [, blockNumber] = regex.exec(txid);

      const { data } = await axios.post('https://api.hive.blog', {
        jsonrpc: '2.0',
        id: 0,
        method: 'condenser_api.get_block',
        params: [Number(blockNumber)],
      });

      const transactions = data.result.transactions
        .map(({ operations, transaction_id: trxId }) => {
          operations.forEach((o, i) => {
            o[1].trxId = operations.length > 1 ? `${trxId}-${i}` : trxId;
          });

          return operations;
        }).flat();

      const trx = transactions.find((t) => t[0] === 'custom_json' && t[1].id === 'ssc-mainnet-hive');

      if (trx) {
        const trxInfo = await HE.getTransactionInfo(trx[1].trxId);

        if (trxInfo) {
          const { blockNumber: heBlock } = trxInfo;

          const heBlockData = await HE.getBlockInfo(heBlock);

          const vt = heBlockData.virtualTransactions.find((t) => t.transactionId === txid);

          if (vt.logs) {
            vt.logs = parseJSON(vt.logs);
          }

          const trxResponse = {
            ...vt,
            blockNumber: heBlock,
          };

          transaction.value = trxResponse;
        }
      }
    } else {
      const trxInfo = await HE.getTransactionInfo(txid);

      if (trxInfo) {
        if (trxInfo.payload) trxInfo.payload = parseJSON(trxInfo.payload);
        if (trxInfo.logs) trxInfo.logs = parseJSON(trxInfo.logs);

        transaction.value = trxInfo;
      }
    }
  } catch {
    failed.value = true;
  } finally {
    dataLoaded.value = true;
  }
}
</script>
