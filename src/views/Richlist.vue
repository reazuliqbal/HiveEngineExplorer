<template>
  <div class="container-fluid pt-3 pb-3">
    <template v-if="dataLoaded">
      <b-row>
        <b-col
          sm="6"
          class="mt-3"
        >
          <h3>{{ symbol }} Richlist</h3>
        </b-col>
        <b-col
          sm="6"
          class="mt-3 d-flex justify-content-sm-end"
        >
          <b-form
            inline
            class="ml-auto"
            @submit.prevent
          >
            <b-input
              v-model="token"
              name="symbol"
              @input="token = $event.toUpperCase()"
            />
            <b-button
              variant="outline-info"
              :disabled="token.length < 1"
              @click.passive="getRichList"
            >
              GO
            </b-button>
          </b-form>
        </b-col>
      </b-row>

      <b-table
        v-if="dataLoaded"
        id="richlistTable"
        responsive
        striped
        borderless
        sort-icon-left
        :items="richlist"
        :fields="richlistFields"
        :per-page="perPage"
        :current-page="currentPage"
        :caption-top="true"
        sort-by="total"
        :sort-desc="true"
        class="mt-4"
        show-empty
      >
        <template v-slot:empty>
          <h6>Nothing to show.</h6>
        </template>
        <template v-slot:cell(index)="data">
          {{ data.item.index + 1 }}
        </template>
        <template v-slot:cell(account)="data">
          <a :href="`https://hive.blog/@${data.item.account}`">{{
            data.item.account
          }}</a>
        </template>
        <template v-slot:cell(delegationsIn)="data">
          {{
            data.item.delegationsIn || 0
          }}
        </template>
        <template v-slot:cell(delegationsOut)="data">
          {{
            data.item.delegationsOut || 0
          }}
        </template>
      </b-table>

      <b-pagination
        v-if="dataLoaded"
        v-model="currentPage"
        :total-rows="rows"
        :per-page="perPage"
        aria-controls="tokensTable"
        align="center"
      />
    </template>
  </div>
</template>

<script>
import HE from '../modules/HE';

export default {
  name: 'Richlist',
  data() {
    return {
      symbol: null,
      token: '',
      richlist: [],
      currentPage: 1,
      perPage: 50,
      richlistFields: [
        { key: 'index', label: '#', sortable: true },
        { key: 'account', label: 'ACCOUNT', sortable: true },
        {
          key: 'balance', label: 'BALANCE', sortable: true, formatter: (n) => n.toFixed(3),
        },
        {
          key: 'stake', label: 'STAKE', sortable: true, headerTitle: 'Sum of Stake, Delegation Out, and Pending Undelegations', formatter: (n) => n.toFixed(3),
        },
        {
          key: 'pendingUnstake', label: 'PENDING UNSTAKE', sortable: true, formatter: (n) => n.toFixed(3),
        },
        {
          key: 'delegationsOut', label: 'DELEGATION OUT', sortable: true, formatter: (n) => n.toFixed(3),
        },
        {
          key: 'delegationsIn', label: 'DELEGATION IN', sortable: true, formatter: (n) => n.toFixed(3),
        },
        {
          key: 'total', label: 'TOTAL', sortable: true, headerTitle: 'Sum of Balance, Pending Unstake, Pending Undelegations, and Delegations In, minus the Delegation Out', formatter: (n) => n.toFixed(3),
        },
      ],
      dataLoaded: false,
      loader: null,
    };
  },

  computed: {
    rows() {
      return this.richlist.length;
    },
  },
  watch: {
    dataLoaded() {
      this.loader.hide();
    },
    async symbol(symbol) {
      await this.loadRichlist(symbol);
    },
  },
  async created() {
    this.loader = this.$loading.show();

    const { symbol } = this.$route.params;

    if (!symbol) {
      if (this.loader.isActive) this.loader.hide();

      this.symbol = 'BEE';
      this.$router.push({ name: 'richlist', params: { symbol: 'BEE' } });
    } else {
      this.symbol = symbol;
    }

    this.token = this.symbol;
  },
  methods: {
    async loadRichlist(token) {
      this.dataLoaded = false;

      let offset = 0;
      const query = await HE.getTokenHolders(token, offset);

      offset += 1000;
      let newHolders = await HE.getTokenHolders(token, offset);

      while (newHolders.length > 0) {
        query.push(...newHolders);
        offset += 1000;
        // eslint-disable-next-line no-await-in-loop
        newHolders = await HE.getTokenHolders(token, offset);
      }

      this.richlist = query.map((h) => {
        const balance = (h.balance) ? Number(h.balance) : 0;
        const stake = (h.stake) ? Number(h.stake) : 0;
        const pendingUnstake = (h.pendingUnstake) ? Number(h.pendingUnstake) : 0;
        const pendingUndelegations = (h.pendingUndelegations) ? Number(h.pendingUndelegations) : 0;
        const delegationsOut = (h.delegationsOut) ? Number(h.delegationsOut) : 0;
        const delegationsIn = (h.delegationsIn) ? Number(h.delegationsIn) : 0;

        return {
          account: h.account,
          balance,
          stake: stake + pendingUndelegations + delegationsOut,
          pendingUnstake,
          pendingUndelegations,
          delegationsIn,
          delegationsOut,
          total: balance + pendingUnstake + pendingUndelegations
           + delegationsIn - delegationsOut,
        };
      })
        .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
        .map((t, index) => ({
          index,
          account: t.account,
          balance: t.balance,
          stake: t.stake,
          pendingUnstake: t.pendingUnstake,
          delegationsOut: t.delegationsOut,
          delegationsIn: t.delegationsIn,
          total: t.total,
        }));

      this.dataLoaded = true;
    },

    getRichList() {
      if (this.token !== this.symbol) {
        this.$router.push({ name: 'richlist', params: { symbol: this.token } });
      }
    },
  },
};
</script>
