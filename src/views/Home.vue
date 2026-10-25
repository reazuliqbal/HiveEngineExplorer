<template>
  <div class="px-3 pt-3 pb-3">
    <h2>
      Recent transactions
      <small
        v-if="blockNumber"
        class="text-muted text-sm"
      >Block# {{ blockNumber }}</small>
    </h2>
    <div
      v-if="dataLoaded && transactions.length > 0"
      class="transactions"
    >
      <div
        v-for="(t, i) in transactions"
        :key="i"
        class="mb-2 rounded border border-default bg-elevated p-1 shadow-xs"
      >
        <div class="px-1 py-1">
          <div>
            <template v-if="t.contract === 'tokens'">
              <template v-if="t.action === 'transfer'">
                <a
                  :href="`/@${t.sender}`"
                  class="text-primary"
                >@{{ t.sender }}</a> transferred
                <code>{{ t.payload.quantity }} {{ t.payload.symbol }}</code> to
                <a
                  :href="`/@${t.payload.to}`"
                  class="text-primary"
                >@{{ t.payload.to }}</a>
                <code>{{ t.payload.memo }}</code>
              </template>

              <template v-if="t.action === 'stake'">
                <a
                  :href="`/@${t.sender}`"
                  class="text-primary"
                >@{{ t.sender }}</a> staked
                <code>{{ t.payload.quantity }} {{ t.payload.symbol }}</code> to
                <a
                  :href="`/@${t.payload.to}`"
                  class="text-primary"
                >@{{ t.payload.to }}</a>
                <code>{{ t.payload.memo }}</code>
              </template>

              <template v-if="t.action === 'unstake'">
                <a
                  :href="`/@${t.sender}`"
                  class="text-primary"
                >@{{ t.sender }}</a> unstaked
                <code>{{ t.payload.quantity }} {{ t.payload.symbol }}</code>
              </template>

              <template v-if="t.action === 'cancelUnstake'">
                <a
                  :href="`/@${t.sender}`"
                  class="text-primary"
                >@{{ t.sender }}</a> cancelled unstaked.
                <code>ID: {{ t.payload.id }}</code>
              </template>

              <template v-if="t.action === 'delegate'">
                <a
                  :href="`/@${t.sender}`"
                  class="text-primary"
                >@{{ t.sender }}</a> delegated
                <code>{{ t.payload.quantity }} {{ t.payload.symbol }}</code> to
                <a
                  :href="`/@${t.payload.to}`"
                  class="text-primary"
                >@{{ t.payload.to }}</a>
              </template>

              <template v-if="t.action === 'undelegate'">
                <a
                  :href="`/@${t.sender}`"
                  class="text-primary"
                >@{{ t.sender }}</a> undelegated
                <code>{{ t.payload.quantity }} {{ t.payload.symbol }}</code> from
                <a
                  :href="`/@${t.payload.to}`"
                  class="text-primary"
                >@{{ t.payload.to }}</a>
              </template>

              <template v-if="t.action === 'issue'">
                <a
                  :href="`/@${t.sender}`"
                  class="text-primary"
                >@{{ t.sender }}</a> issued
                <code>{{ t.payload.quantity }} {{ t.payload.symbol }}</code> to
                <a
                  :href="`/@${t.payload.to}`"
                  class="text-primary"
                >@{{ t.payload.to }}</a>
                <code>{{ t.payload.memo }}</code>
              </template>
            </template>

            <template v-if="t.contract === 'market'">
              <template v-if="t.action === 'sell'">
                <a
                  :href="`/@${t.sender}`"
                  class="text-primary"
                >@{{ t.sender }}</a> wants to sell
                <code>{{ t.payload.quantity }} {{ t.payload.symbol }}</code> at
                <code>{{ t.payload.price }} SWAP.HIVE/{{ t.payload.symbol }}</code>
              </template>

              <template v-if="t.action === 'buy'">
                <a
                  :href="`/@${t.sender}`"
                  class="text-primary"
                >@{{ t.sender }}</a> wants to buy
                <code>{{ t.payload.quantity }} {{ t.payload.symbol }}</code> at
                <code>{{ t.payload.price }} SWAP.HIVE/{{ t.payload.symbol }}</code>
              </template>

              <template v-if="t.action === 'cancel'">
                <a
                  :href="`/@${t.sender}`"
                  class="text-primary"
                >@{{ t.sender }}</a> cancelled a
                <code>{{ t.payload.type }}</code> order.
                <code>ID: {{ t.payload.id }}</code>
              </template>
            </template>

            <template v-if="t.contract === 'hivepegged'">
              <template v-if="t.action === 'withdraw'">
                <a
                  :href="`/@${t.sender}`"
                  class="text-primary"
                >@{{ t.sender }}</a> requested withdrawal of
                <code>{{ t.payload.quantity }} SWAP.HIVE</code>.
              </template>
              <template v-if="t.action === 'buy'">
                <a
                  :href="`/@${t.sender}`"
                  class="text-primary"
                >@{{ t.sender }}</a> wants to buy
                <code>SWAP.HIVE</code> worth
                <code>{{ t.payload.amountHIVEHBD }}</code>
              </template>
              <template v-if="t.action === 'removeWithdrawal'">
                <a
                  :href="`/@${t.sender}`"
                  class="text-primary"
                >@{{ t.sender }}</a> removed withdrawal request.
                <code>ID: {{ t.payload.id }}</code>
                Recipient:
                <code>{{ t.payload.recipient }}</code>
                Amount:
                <code>{{ t.payload.amountHIVEHBD }}</code>
              </template>
            </template>

            <template v-if="t.contract === 'nft'">
              NFT is not supported yet.
            </template>

            <template v-if="t.contract === 'nftmarket'">
              NFT MARKET is not supported yet.
            </template>

            <template v-else-if="!['tokens', 'market', 'hivepegged', 'nft', 'nftmarket'].includes(t.contract)">
              <code>{{ t.contract }} / {{ t.action }}</code>
            </template>

            <router-link
              :to="{ name: 'block', params: { block: blockNumber } }"
              class="small text-sm text-primary"
              :title="timestamp.toGMTString()"
            >
              <TimeAgo
                :datetime="timestamp"
                :auto-update="60"
              />
            </router-link>

            <router-link
              :to="{ name: 'transaction', params: { txid: t.transactionId } }"
              class="small text-sm text-muted float-right"
            >
              {{ t.transactionId.substr(0, 8) }}
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <p class="text-lg text-muted">
        {{ failed ? 'Failed to load recent transactions. Please try again.' : 'No transaction found in this block.' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useLoading } from 'vue-loading-overlay';
import HE from '../modules/HE';
import TimeAgo from '../components/TimeAgo.vue';

const loading = useLoading();
const loader = loading.show({ color: 'red' });

const blockNumber = ref(null);
const timestamp = ref(null);
const transactions = ref([]);
const dataLoaded = ref(false);
const failed = ref(false);

watch(dataLoaded, (loaded) => {
  if (loaded) loader.hide();
});

init();

async function init() {
  let txs = [];

  try {
    const blockData = await HE.getLatestBlockInfo();

    if (!blockData) throw new Error('RPC unavailable');

    blockNumber.value = blockData.blockNumber;
    timestamp.value = new Date(`${blockData.timestamp}Z`);

    if (blockData.transactions.length > 0) {
      txs = blockData.transactions
        .map((t) => ({
          ...t,
          logs: JSON.parse(t.logs),
          payload: JSON.parse(t.payload),
        }))
        .filter((t) => !t.logs.error);
    }

    transactions.value = txs;
  } catch {
    failed.value = true;
  } finally {
    dataLoaded.value = true;
  }
}
</script>
