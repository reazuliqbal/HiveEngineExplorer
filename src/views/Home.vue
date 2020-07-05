<template>
  <div class="container-fluid pt-3 pb-3">
    <h2>
      Recent transactions
      <small v-if="blockNumber" class="text-muted">Block# {{ blockNumber }}</small>
    </h2>
    <div class="transactions" v-if="dataLoaded && transactions.length >0">
      <div class="card mb-2" v-for="(t,i) in transactions" :key="i">
        <div class="card-body p-1">
          <div class="card-text">
            <template v-if="t.contract === 'tokens'">
              <template v-if="t.action === 'transfer'">
                <a :href="`/@${t.sender}`">@{{ t.sender }}</a> transferred
                <code>{{ t.payload.quantity }} {{ t.payload.symbol }}</code> to
                <a :href="`/@${t.payload.to}`">@{{ t.payload.to }}</a>
                <code>{{ t.payload.memo }}</code>
              </template>

              <template v-if="t.action === 'stake'">
                <a :href="`/@${t.sender}`">@{{ t.sender }}</a> staked
                <code>{{ t.payload.quantity }} {{ t.payload.symbol }}</code> to
                <a :href="`/@${t.payload.to}`">@{{ t.payload.to }}</a>
                <code>{{ t.payload.memo }}</code>
              </template>

              <template v-if="t.action === 'unstake'">
                <a :href="`/@${t.sender}`">@{{ t.sender }}</a> unstaked
                <code>{{ t.payload.quantity }} {{ t.payload.symbol }}</code>
              </template>

              <template v-if="t.action === 'cancelUnstake'">
                <a :href="`/@${t.sender}`">@{{ t.sender }}</a> cancelled unstaked.
                <code>ID: {{t.payload.id}}</code>
              </template>

              <template v-if="t.action === 'delegate'">
                <a :href="`/@${t.sender}`">@{{ t.sender }}</a> delegated
                <code>{{ t.payload.quantity }} {{ t.payload.symbol }}</code> to
                <a :href="`/@${t.payload.to}`">@{{ t.payload.to }}</a>
              </template>

              <template v-if="t.action === 'undelegate'">
                <a :href="`/@${t.sender}`">@{{ t.sender }}</a> undelegated
                <code>{{ t.payload.quantity }} {{ t.payload.symbol }}</code> from
                <a :href="`/@${t.payload.to}`">@{{ t.payload.to }}</a>
              </template>

              <template v-if="t.action === 'issue'">
                <a :href="`/@${t.sender}`">@{{ t.sender }}</a> issued
                <code>{{ t.payload.quantity }} {{ t.payload.symbol }}</code> to
                <a :href="`/@${t.payload.to}`">@{{ t.payload.to }}</a>
                <code>{{ t.payload.memo }}</code>
              </template>
            </template>

            <template v-if="t.contract === 'market'">
              <template v-if="t.action === 'sell'">
                <a :href="`/@${t.sender}`">@{{ t.sender }}</a> wants to sell
                <code>{{t.payload.quantity}} {{t.payload.symbol}}</code> at
                <code>{{t.payload.price}} SWAP.HIVE/{{t.payload.symbol}}</code>
              </template>

              <template v-if="t.action === 'buy'">
                <a :href="`/@${t.sender}`">@{{ t.sender }}</a> wants to buy
                <code>{{t.payload.quantity}} {{t.payload.symbol}}</code> at
                <code>{{t.payload.price}} SWAP.HIVE/{{t.payload.symbol}}</code>
              </template>

              <template v-if="t.action === 'cancel'">
                <a :href="`/@${t.sender}`">@{{ t.sender }}</a> cancelled a
                <code>{{t.payload.type}}</code> order.
                <code>ID: {{t.payload.id}}</code>
              </template>
            </template>

            <template v-if="t.contract === 'hivepegged'">
              <template v-if="t.action === 'withdraw'">
                <a :href="`/@${t.sender}`">@{{ t.sender }}</a> requested withdrawal of
                <code>{{t.payload.quantity}} SWAP.HIVE</code>.
              </template>
              <template v-if="t.action === 'buy'">
                <a :href="`/@${t.sender}`">@{{ t.sender }}</a> wants to buy
                <code>SWAP.HIVE</code> worth
                <code>{{t.payload.amountHIVEHBD}}</code>
              </template>
              <template v-if="t.action === 'removeWithdrawal'">
                <a :href="`/@${t.sender}`">@{{ t.sender }}</a> removed withdrawal request.
                <code>ID: {{t.payload.id}}</code>
                Recipient:
                <code>{{t.payload.recipient}}</code>
                Amount:
                <code>{{t.payload.amountHIVEHBD}}</code>
              </template>
            </template>

            <template v-if="t.contract === 'nft'">NFT is not supported yet.</template>

            <template v-if="t.contract === 'nftmarket'">NFT MARKET is not supported yet.</template>

            <router-link
              :to="{ name: 'block', params: { block: blockNumber } }"
              class="small"
              :title="timestamp.toGMTString()"
            >
              <timeago :datetime="timestamp" :auto-update="60"></timeago>
            </router-link>

            <router-link
              :to="{ name: 'transaction', params: { txid: t.transactionId } }"
              class="small text-muted float-right"
            >{{ t.transactionId.substr(0,8) }}</router-link>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <p class="h5 text-muted">No transaction found in this block.</p>
    </div>
  </div>
</template>

<script>
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import HE from '../modules/HE';

export default {
  name: 'Home',
  data() {
    return {
      blockNumber: null,
      timestamp: null,
      transactions: [],
      dataLoaded: false,
      loader: null,
    };
  },
  async created() {
    this.loader = this.$loading.show();

    this.txid = this.$route.params.txid || null;
    let transactions = [];

    const blockData = await HE.getLatestBlockInfo();

    this.blockNumber = blockData.blockNumber;
    this.timestamp = new Date(`${blockData.timestamp}Z`);

    if (blockData.transactions.length > 0) {
      transactions = blockData.transactions
        .map((t) => ({
          ...t,
          logs: JSON.parse(t.logs),
          payload: JSON.parse(t.payload),
        }))
        .filter((t) => !t.logs.error);
    }

    this.transactions = transactions;

    this.dataLoaded = true;
  },
  watch: {
    dataLoaded(loaded) {
      if (loaded) this.loader.hide();
    },
  },
  methods: {
    formatDistanceToNow,
  },
};
</script>
