<template>
  <div class="px-3 pt-3 pb-3">
    <div
      v-if="dataLoaded"
      class="transaction"
    >
      <JsonViewer
        :value="block"
        :expand-depth="5"
        copyable
        sort
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { JsonViewer } from 'vue3-json-viewer';
import { useLoading } from 'vue-loading-overlay';
import { parseJSON } from '../helpers';
import HE from '../modules/HE';

const route = useRoute();

const loading = useLoading();
const loader = loading.show({ color: 'red' });

const blockNum = ref(0);
const block = ref([]);
const dataLoaded = ref(false);

watch(dataLoaded, (loaded) => {
  if (loaded) loader.hide();
});

init();

async function init() {
  blockNum.value = route.params.block;

  const blockData = await HE.getBlockInfo(blockNum.value);

  block.value = {
    ...blockData,
    transactions: blockData.transactions.map((t) => ({
      ...t,
      logs: parseJSON(t.logs),
      payload: parseJSON(t.payload),
    })),
    virtualTransactions: blockData.virtualTransactions.map((t) => ({
      ...t,
      logs: parseJSON(t.logs),
      payload: parseJSON(t.payload),
    })),
  };

  dataLoaded.value = true;
}
</script>
