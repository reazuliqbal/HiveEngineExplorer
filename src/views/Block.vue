<template>
  <div class="container-fluid pt-3 pb-3">
    <div
      v-if="dataLoaded"
      class="transaction"
    >
      <json-viewer
        :value="transactions"
        :expand-depth="5"
        copyable
        sort
      />
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
  watch: {
    dataLoaded(loaded) {
      if (loaded) this.loader.hide();
    },
  },
  async created() {
    this.loader = this.$loading.show();

    this.block = this.$route.params.block;

    const transactions = await HE.getBlockInfo(this.block);

    this.transactions = transactions;

    this.dataLoaded = true;
  },
};
</script>
