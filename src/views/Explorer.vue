<template>
  <div class="container-fluid pt-3 pb-3">
    <h2 class="mb-3">
      @{{ username }}
    </h2>

    <div
      v-if="dataLoaded"
      class="history"
    >
      <div
        v-for="(h, i) in history"
        :key="i"
        class="card mb-2"
      >
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
              <code>{{ h.quantity }} {{ h.symbol }}</code> to
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

            <template v-else-if="h.operation === 'tokens_unstakeDone'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> unstaked
              <code>{{ h.quantity }} {{ h.symbol }}</code>
            </template>

            <template v-else-if="h.operation === 'tokens_undelegateStart'">
              <a :href="`/@${h.to}`">@{{ h.to }}</a> undelegated
              <code>{{ h.quantity }} {{ h.symbol }}</code> from
              <a :href="`/@${h.from}`">@{{ h.from }}</a>
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

            <template v-else-if="h.operation === 'tokens_transferOwnership'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> transferred
              <code>{{ h.symbol }}</code> ownership to
              <a :href="`/@${h.newOwner}`">@{{ h.newOwner }}</a>
            </template>

            <template v-else-if="h.operation === 'market_placeOrder'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> placed a
              <code>{{ h.orderType }} order</code> of
              <code>
                {{
                  h.orderType === "buy"
                    ? Number(h.quantityLocked) / Number(h.price)
                    : Number(h.quantityLocked)
                }}
                {{ h.symbol }}
              </code>
              <template v-if="h.price">
                at
                <code>{{ h.price }} SWAP.HIVE/{{ h.symbol }}</code>
              </template>
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
              <code>{{ h.quantityUnlocked }} SWAP.HIVE</code>
            </template>

            <template v-else-if="h.operation === 'market_closeOrder'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a>
              {{ h.orderType }} order has closed.
              <code>ID: {{ h.orderID }}</code>
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
              <code>{{ h.quantity }} {{ h.symbol }}</code>
            </template>

            <template v-else-if="h.operation === 'hivepegged_withdraw'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> withdrawn
              <code>{{ h.quantity }} {{ h.symbol }}</code>
            </template>

            <template v-else-if="h.operation === 'mining_lottery'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> earned
              <code>{{ h.quantity }} {{ h.symbol }}</code> mining reward
            </template>

            <template v-else-if="['nft_issue', 'nft_issueMultiple'].includes(h.operation)">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> issued
              <code>{{ h.symbol }} #{{ h.nft }}</code> to
              <a :href="`/@${h.to}`">@{{ h.to }}</a>.
              Properties:
              <code>{{ JSON.stringify(h.properties) }}</code>
            </template>

            <template v-else-if="h.operation === 'nft_transfer'">
              <a :href="`/@${h.from}`">@{{ h.from }}</a> transferred
              <code>{{ h.symbol }} #{{ h.nft }}</code> to
              <a :href="`/@${h.to}`">@{{ h.to }}</a>
            </template>

            <template v-else-if="h.operation === 'nft_delegate'">
              <a :href="`/@${h.from}`">@{{ h.from }}</a> delegated
              <code>{{ h.symbol }} #{{ h.nft }}</code> to
              <span v-if="h.to === 'contract_mining'">the Mining Contract</span>
              <a
                v-else
                :href="`/@${h.to}`"
              >@{{ h.to }}</a>
            </template>

            <template v-else-if="h.operation === 'nft_transferFee'">
              <a :href="`/@${h.from}`">@{{ h.from }}</a> paid
              <code>{{ Number(h.quantity) }} {{ h.symbol }}</code> issuance fee
            </template>

            <template v-else-if="h.operation === 'nft_setProperties'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> set nft properties to
              <code
                v-for="(nft, nftk) of h.nfts"
                :key="nftk"
              >
                <span>{{ h.symbol }} #{{ nft.id }}</span>
              </code>
            </template>

            <template v-else-if="h.operation === 'nftmarket_transferFee'">
              <a :href="`/@${h.from}`">@{{ h.from }}</a> paid
              <code>{{ Number(h.quantity) }} {{ h.symbol }}</code> nft market fee to
              <a :href="`/@${h.to}`">@{{ h.to }}</a>
            </template>

            <template v-else-if="h.operation === 'nftmarket_buy'">
              <template v-if="h.nfts && h.nfts.length > 0">
                <a :href="`/@${h.account}`">@{{ h.account }}</a> bought
                <code
                  v-for="(nft, nfti) of h.nfts"
                  :key="nfti"
                >
                  <span>{{ h.symbol }} #{{ nft }}</span>
                </code> from
                <a :href="`/@${h.from}`">@{{ h.from }}</a> for
                <code>{{ Number(h.price) }} {{ h.priceSymbol }}</code>
              </template>

              <template v-else>
                <a :href="`/@${h.from}`">@{{ h.from }}</a> paid
                <code>{{ Number(h.quantity) }} {{ h.symbol }}</code> nft market agent fee to
                <a :href="`/@${h.to}`">@{{ h.to }}</a>
              </template>
            </template>

            <template v-else-if="h.operation === 'nftmarket_sellOrder'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> placed
              <code>{{ h.symbol }} #{{ h.nft }}</code> for sale for
              <code>{{ h.price }} {{ h.priceSymbol }}</code>
            </template>

            <template v-else-if="h.operation === 'nftmarket_changePrice'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> changed
              <code>{{ h.symbol }} #{{ h.nft }}</code> price from
              <code>{{ h.oldPrice }} {{ h.priceSymbol }}</code> to
              <code>{{ h.newPrice }} {{ h.priceSymbol }}</code>
            </template>

            <template v-else-if="h.operation === 'comments_authorReward'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> earned
              <code>{{ h.quantity }} {{ h.symbol }}</code> author reward for
              <code>{{ h.authorperm }}</code>
            </template>

            <template v-else-if="h.operation === 'comments_authorReward_stake'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> earned
              <code>{{ h.quantity }} {{ h.symbol }}</code> author staked reward for
              <code>{{ h.authorperm }}</code>
            </template>

            <template v-else-if="h.operation === 'comments_curationReward'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> earned
              <code>{{ h.quantity }} {{ h.symbol }}</code> curation reward for
              <code>{{ h.authorperm }}</code>
            </template>

            <template v-else-if="h.operation === 'comments_curationReward_stake'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> earned
              <code>{{ h.quantity }} {{ h.symbol }}</code> curation staked reward for
              <code>{{ h.authorperm }}</code>
            </template>

            <template v-else-if="h.operation === 'marketpools_swapTokens'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> swapped for
              <code>{{ h.quantity }} {{ h.symbol }}</code>
            </template>

            <template v-else-if="h.operation === 'witnesses_proposeRound'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> earned
              <code>{{ h.quantity }} {{ h.symbol }}</code> witness reward
              <code>{{ h.authorperm }}</code>
            </template>

            <template v-else-if="h.operation === 'witnesses_proposeRound_stake'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> earned
              <code>{{ h.quantity }} {{ h.symbol }}</code> witness reward
              <code>{{ h.authorperm }}</code>
            </template>

            <template v-else-if="h.operation === 'inflation_issueNewTokens'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> been issued
              <code>{{ h.quantity }} {{ h.symbol }}</code>
              <code>{{ h.authorperm }}</code>
            </template>

            <template v-else-if="h.operation === 'distribution_checkPendingDistributions'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> received
              <code>{{ h.quantity }} {{ h.symbol }}</code> distribution reward
              <code>{{ h.authorperm }}</code>
            </template>

            <template v-else-if="h.operation === 'claimdrops_create'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> created an claimdrop for
              <code>{{ h.quantity }} {{ h.symbol }}</code> ID:
              <code>{{ h.transactionId }}</code>
            </template>

            <template v-else-if="h.operation === 'airdrops_checkPendingAirdrops'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> has been airdropped
              <code>{{ h.quantity }} {{ h.symbol }}</code> staked.
            </template>

            <template v-else-if="h.operation === 'airdrops_checkPendingAirdrops_stake'">
              <a :href="`/@${h.account}`">@{{ h.account }}</a> has been airdropped
              <code>{{ h.quantity }} {{ h.symbol }}</code> staked.
            </template>

            <router-link
              :to="{ name: 'block', params: { block: h.blockNumber } }"
              class="small"
              style="user-select: none;"
              :title="new Date(h.timestamp * 1000).toGMTString()"
            >
              <timeago
                :datetime="new Date(h.timestamp * 1000)"
                :auto-update="60"
              />
            </router-link>

            <router-link
              :to="{ name: 'transaction', params: { txid: h.transactionId } }"
              class="small text-muted float-right"
              style="user-select: none;"
            >
              {{ h.transactionId.substr(0, 8) }}
            </router-link>
          </div>
        </div>
      </div>

      <div v-if="history.length === 0">
        No history found.
      </div>
    </div>

    <nav
      v-if="history.length >= limit"
      class="mt-3"
    >
      <ul class="pagination justify-content-center">
        <li class="page-item">
          <button
            id="prev"
            class="page-link"
            :disabled="page <= 1"
            @click.prevent="getPrevPage()"
          >
            Previous
          </button>
        </li>
        <li class="page-item">
          <button
            id="next"
            class="page-link"
            @click.prevent="getNextPage()"
          >
            Next
          </button>
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
  watch: {
    dataLoaded(loaded) {
      if (loaded) this.loader.hide();
    },
  },
  async created() {
    this.loader = this.$loading.show();
    this.username = this.$route.params.username;
    this.symbol = this.$route.query.symbol || null;
    this.page = Number(
      this.$route.query.page && this.$route.query.page > 1
        ? this.$route.query.page
        : 1,
    );

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
      const nodes = JSON.parse(localStorage.getItem('nodes'));

      const historyAPI = nodes?.historyAPI || 'https://enginehistory.rishipanthee.com/accountHistory';

      const { data } = await axios.get(
        historyAPI,
        {
          params,
        },
      );

      this.history = data;

      this.dataLoaded = true;
    },

    getNextPage() {
      this.page += 1;

      const query = { page: this.page };
      if (this.symbol) query.symbol = this.symbol;

      this.$router.push({
        name: 'explorer',
        params: { username: this.username },
        query,
      });
    },

    getPrevPage() {
      this.page = this.page > 1 ? this.page - 1 : 1;

      const query = { page: this.page };
      if (this.symbol) query.symbol = this.symbol;

      this.$router.push({
        name: 'explorer',
        params: { username: this.username },
        query,
      });
    },
  },
};
</script>
