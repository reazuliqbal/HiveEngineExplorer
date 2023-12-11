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
              @keyup.enter.native="getRichList"
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
import Big from 'big.js';
import HE from '../modules/HE';
import { addCommas } from '../helpers';

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
          key: 'balance', label: 'BALANCE', sortable: true, formatter: (n) => addCommas(n),
        },
        {
          key: 'stake', label: 'STAKE', sortable: true, headerTitle: 'Sum of Stake, Delegation Out, and Pending Undelegations', formatter: (n) => addCommas(n),
        },
        {
          key: 'pendingUnstake', label: 'PENDING UNSTAKE', sortable: true, formatter: (n) => addCommas(n),
        },
        {
          key: 'delegationsOut', label: 'DELEGATION OUT', sortable: true, formatter: (n) => addCommas(n),
        },
        {
          key: 'delegationsIn', label: 'DELEGATION IN', sortable: true, formatter: (n) => addCommas(n),
        },
        {
          key: 'total', label: 'TOTAL', sortable: true, headerTitle: 'Sum of Balance, Pending Unstake, Pending Undelegations, and Delegations In, minus the Delegation Out', formatter: (n) => addCommas(n),
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

      const holders = [];
      const limit = 1000;
      let lastId = 0;
      let newData = 0;

      do {
        const data = await HE.getTokenHolders(token, lastId, limit);

        newData = data.length;

        if (newData > 0) {
          lastId = data.at(-1)._id;
          holders.push(...data);

          if (data.length < limit) {
            newData = 0;
          }
        }
      } while (newData > 0);

      this.richlist = holders.map((h) => {
        const balance = new Big(h.balance);
        const stake = new Big(h.stake);
        const pendingUnstake = new Big(h.pendingUnstake);
        const pendingUndelegations = new Big(h.pendingUndelegations);
        const delegationsOut = new Big(h.delegationsOut);
        const delegationsIn = new Big(h.delegationsIn);

        return {
          account: h.account,
          balance,
          stake,
          pendingUnstake,
          pendingUndelegations,
          delegationsIn,
          delegationsOut,
          total: balance
            .plus(stake)
            .plus(pendingUnstake)
            .plus(pendingUndelegations)
            .plus(delegationsIn)
            .minus(delegationsOut),
        };
      })
        .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
        .map((t, index) => ({
          index,
          ...t,
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
