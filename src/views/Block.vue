<template>
  <div class="container-fluid pt-3 pb-3">
    <div
      v-if="dataLoaded"
      class="transaction"
    >
      <json-viewer
        :value="block"
        :expand-depth="5"
        copyable
        sort
      />
    </div>
  </div>
</template>

<script>
import JsonViewer from 'vue-json-viewer';
import { parseJSON } from '../helpers';
import HE from '../modules/HE';

export default {
  name: 'Block',
  components: { JsonViewer },
  data() {
    return {
      blockNum: 0,
      block: [],
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

    this.blockNum = this.$route.params.block;

    const block = await HE.getBlockInfo(this.blockNum);

    this.block = {
      ...block,
      transactions: block.transactions.map((t) => ({
        ...t,
        logs: parseJSON(t.logs),
        payload: parseJSON(t.payload),
      })),
      virtualTransactions: block.virtualTransactions.map((t) => ({
        ...t,
        logs: parseJSON(t.logs),
        payload: parseJSON(t.payload),
      })),
    };

    this.dataLoaded = true;
  },
};
</script>
