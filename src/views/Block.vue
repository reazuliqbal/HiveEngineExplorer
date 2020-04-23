<template>
  <div class="container-fluid pt-3 pb-3">
    <div class="transaction" v-if="dataLoaded">
      <json-viewer :value="transactions" :expand-depth="5" copyable sort></json-viewer>
    </div>
  </div>
</template>

<script>
import JsonViewer from 'vue-json-viewer';
import HE from '../modules/HE';

export default {
  name: 'Block',
  components: { JsonViewer },
  data() {
    return {
      block: 0,
      transactions: [],
      dataLoaded: false,
      loader: null,
    };
  },
  async created() {
    this.loader = this.$loading.show();

    this.block = this.$route.params.block;

    const transactions = await HE.getBlockInfo(this.block);

    this.transactions = transactions;

    this.dataLoaded = true;
  },
  watch: {
    dataLoaded(loaded) {
      if (loaded) this.loader.hide();
    },
  },
};
</script>
