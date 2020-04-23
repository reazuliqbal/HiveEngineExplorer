<template>
  <div class="container-fluid pt-3 pb-3">
    <h2 class="mb-3">@{{ username }}</h2>

    <div class="history" v-if="dataLoaded">
      <div class="card mb-2" v-for="(h,i) in history" :key="i">
        <div class="card-body p-1">
          <div class="card-text">
            <template v-if="h.operation === 'tokens_transfer'">
              <a :href="`/@${h.from}`">@{{ h.from }}</a> transferred
              <code>{{ h.quantity }} {{ h.symbol }}</code> to
              <a :href="`/@${h.to}`">@{{ h.to }}</a>
              <code>{{ h.memo }}</code>
            </template>

            <template v-else-if="h.operation === 'tokens_stake'">
              <a :href="`/@${h.from}`">@{{ h.from }}</a> staked
              <code>{{ h.quantity }} {{h.symbol}}</code> to
              <a :href="`/@${h.to}`">@{{ h.to }}</a>
              <code>{{ h.memo }}</code>
            </template>

            <template v-else-if="h.operation === 'tokens_unstake'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> unstaked
              <code>{{ h.quantity }} {{ h.symbol }}</code>
            </template>

            <template v-else-if="h.operation === 'tokens_unstakeStart'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> started unstaking
              <code>{{ h.quantity }} {{ h.symbol }}</code>
            </template>

            <template v-else-if="h.operation === 'tokens_delegate'">
              <a :href="`/@${h.from}`">@{{ h.from }}</a> delegated
              <code>{{ h.quantity }} {{ h.symbol }}</code> to
              <a :href="`/@${h.to}`">@{{ h.to }}</a>
              <code>{{ h.memo }}</code>
            </template>

            <template v-else-if="h.operation === 'tokens_issue'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> received
              <code>{{ h.quantity }} {{ h.symbol }}</code> from
              <code>TOKEN CONTRACT</code>
              <code>{{ h.memo }}</code>
            </template>

            <template v-else-if="h.operation === 'market_placeOrder'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> placed a
              <code>{{ h.orderType }} order</code> of
              <code>
                {{ h.orderType === 'buy' ?
                Number(h.quantityLocked) / Number(h.price)
                : Number(h.quantityLocked) }} {{ h.symbol }}
              </code> at
              <code>{{ h.price }} STEEMP/{{ h.symbol }}</code>
            </template>

            <template v-else-if="h.operation === 'market_buy'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> bought
              <code>{{ h.quantityTokens }} {{ h.symbol }}</code> from
              <a :href="`/@${h.from}`">@{{ h.from }}</a>
            </template>

            <template v-else-if="h.operation === 'market_sell'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> sold
              <code>{{ h.quantityTokens }} {{ h.symbol }}</code> to
              <a :href="`/@${h.to}`">@{{ h.to }}</a>
            </template>

            <template v-else-if="h.operation === 'market_close'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> market returned
              <code>{{ h.quantityUnlocked }} STEEMP</code>
            </template>

            <template v-else-if="h.operation === 'market_closeOrder'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a>
              {{h.orderType}} order has closed.
              <code>ID: {{h.orderID}}</code>
            </template>

            <template v-else-if="h.operation === 'market_cancel'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a>
              cancelled a {{ h.orderType }} order of
              <code>{{ h.quantityReturned }} {{ h.symbol }}</code>.
              <code>ID: {{ h.orderID }}</code>
            </template>

            <template v-else-if="h.operation === 'market_expire'">
              <code>{{ h.orderType.toUpperCase() }}</code> has expired
            </template>

            <template v-else-if="h.operation === 'hivepegged_buy'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> deposited
              <code>{{ h.quantity }} {{ h.symbol }}.</code>
            </template>

            <template v-else-if="h.operation === 'hivepegged_withdraw'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> withdrawn
              <code>{{ h.quantity }} {{ h.symbol }}.</code>
            </template>

            <router-link
              :to="{ name: 'block', params: { block: h.blockNumber } }"
              class="small"
              :title="new Date(h.timestamp * 1000).toGMTString()"
            >
              {{ formatDistanceToNow(
              new Date(h.timestamp * 1000),
              { includeSeconds: true, addSuffix: true }
              ) }}
            </router-link>

            <router-link
              :to="{ name: 'transaction', params: { txid: h.transactionId } }"
              class="small text-muted float-right"
            >{{ h.transactionId.substr(0,8) }}</router-link>
          </div>
        </div>
      </div>

      <div v-if="history.length === 0">No history found.</div>
    </div>

    <nav class="mt-3" v-if="history.length >= limit">
      <ul class="pagination justify-content-center">
        <li class="page-item">
          <button
            class="page-link"
            :disabled="page <= 1"
            @click.prevent="getPrevPage()"
            id="prev"
          >Previous</button>
        </li>
        <li class="page-item">
          <button class="page-link" @click.prevent="getNextPage()" id="next">Next</button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import axios from 'axios';

export default {
  name: 'Explorer',
  data() {
    return {
      username: '',
      token: '',
      page: 1,
      limit: 50,
      history: [],
      dataLoaded: false,
      loader: null,
    };
  },
  async created() {
    this.loader = this.$loading.show();
    this.username = this.$route.params.username;
    this.symbol = this.$route.query.symbol || null;
    this.page = (this.$route.query.page && this.$route.query.page > 1) ? this.$route.query.page : 1;

    const offset = (this.page - 1) * this.limit;

    await this.fetchHistory(offset);
  },
  methods: {
    formatDistanceToNow,

    async fetchHistory(offset = this.offset) {
      this.dataLoaded = false;

      const params = {
        account: this.username,
        limit: this.limit,
        offset,
      };

      if (this.symbol) params.symbol = this.symbol;

      const { data } = await axios.get('https://accounts.hive-engine.com/accountHistory', { params });

      this.history = data;

      this.dataLoaded = true;
    },

    getNextPage() {
      this.page += 1;

      const query = { page: this.page };
      if (this.symbol) query.symbol = this.symbol;

      this.$router.push({ name: 'explorer', params: { username: this.username }, query });
    },

    getPrevPage() {
      this.page = (this.page > 1) ? this.page - 1 : 1;

      const query = { page: this.page };
      if (this.symbol) query.symbol = this.symbol;

      this.$router.push({ name: 'explorer', params: { username: this.username }, query });
    },
  },
  watch: {
    dataLoaded(loaded) {
      if (loaded) this.loader.hide();
    },
  },
};
</script>
