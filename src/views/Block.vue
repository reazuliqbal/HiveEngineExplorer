<template>
  <div class="px-3 pt-3 pb-3">
    <div
      v-if="dataLoaded"
      class="transaction"
    >
      <p
        v-if="failed"
        class="text-lg text-muted"
      >
        Failed to load block. Please try again.
      </p>
      <JsonViewer
        v-else
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
const failed = ref(false);

watch(dataLoaded, (loaded) => {
  if (loaded) loader.hide();
});

init();

async function init() {
  blockNum.value = route.params.block;

  try {
    const blockData = await HE.getBlockInfo(blockNum.value);

    if (!blockData) throw new Error('RPC unavailable');

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
  } catch {
    failed.value = true;
  } finally {
    dataLoaded.value = true;
  }
}
</script>
