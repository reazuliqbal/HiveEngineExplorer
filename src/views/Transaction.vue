<template>
  <div class="container-fluid pt-3 pb-3">
    <div class="transaction" v-if="dataLoaded">
      <json-viewer :value="transaction" :expand-depth="5" copyable sort></json-viewer>
    </div>
  </div>
</template>

<script>
import JsonViewer from 'vue-json-viewer';
import HE from '../modules/HE';

export default {
  name: 'Transaction',
  components: { JsonViewer },
  data() {
    return {
      txid: null,
      transaction: {},
      dataLoaded: false,
      loader: null,
    };
  },
  async created() {
    this.loader = this.$loading.show();

    this.txid = this.$route.params.txid || null;

    const transaction = await HE.getTransactionInfo(this.txid);
    console.log(transaction);
    if (transaction.payload) transaction.payload = JSON.parse(transaction.payload);
    if (transaction.logs) transaction.logs = JSON.parse(transaction.logs);

    this.transaction = transaction;

    this.dataLoaded = true;
  },
  watch: {
    dataLoaded(loaded) {
      if (loaded) this.loader.hide();
    },
  },
};
</script>
