<template>
  <div class="container-fluid pt-3 pb-3">
    <template v-if="dataLoaded">
      <div v-if="transaction" class="transaction">
        <json-viewer :value="transaction" :expand-depth="5" copyable sort />
      </div>

      <div v-else>
        Transaction not found!
      </div>
    </template>
  </div>
</template>

<script>
import axios from 'axios';
import JsonViewer from 'vue-json-viewer';
import HE from '../modules/HE';
import { parseJSON } from '../helpers';

export default {
  name: 'Transaction',
  components: { JsonViewer },
  data() {
    return {
      transaction: null,
      dataLoaded: false,
      loader: null,
    };
  },
  watch: {
    dataLoaded(loaded) {
      if (loaded) this.loader.hide();
    },
  },
  async created() {
    this.loader = this.$loading.show();

    const { txid } = this.$route.params;

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
            // eslint-disable-next-line no-param-reassign
            o[1].trxId = operations.length > 1 ? `${trxId}-${i}` : trxId;
          });

          return operations;
        }).flat();

      const transaction = transactions.find((t) => t[0] === 'custom_json' && t[1].id === 'ssc-mainnet-hive');

      if (transaction) {
        const trx = await HE.getTransactionInfo(transaction[1].trxId);

        if (trx) {
          const { blockNumber: heBlock } = trx;

          const heBlockData = await HE.getBlockInfo(heBlock);

          const vt = heBlockData.virtualTransactions.find((t) => t.transactionId === txid);

          if (vt.logs) {
            vt.logs = parseJSON(vt.logs);
          }

          const trxResponse = {
            ...vt,
            blockNumber: heBlock,
          };

          this.transaction = trxResponse;
        }
      }
    } else {
      const transaction = await HE.getTransactionInfo(txid);

      if (transaction) {
        if (transaction.payload) transaction.payload = parseJSON(transaction.payload);
        if (transaction.logs) transaction.logs = parseJSON(transaction.logs);

        this.transaction = transaction;
      }
    }

    this.dataLoaded = true;
  },
};
</script>
