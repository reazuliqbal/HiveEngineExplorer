<template>
  <div id="app">
    <b-navbar
      toggleable="sm"
      type="dark"
      variant="dark"
    >
      <div class="container-fluid">
        <b-navbar-brand :to="{ name: 'home' }">
          HE Explorer
        </b-navbar-brand>
        <b-navbar-toggle target="nav-collapse" />

        <b-collapse
          id="nav-collapse"
          is-nav
        >
          <b-nav-form>
            <b-form-input
              v-model="account"
              class="mr-sm-2"
              size="sm"
              placeholder="Account name"
              aria-label="Account"
              trim
              @input="account = $event.toLowerCase()"
              @keyup.enter.native="getAccountHistory"
            />
            <b-form-input
              v-model="symbol"
              class="mr-sm-2"
              size="sm"
              placeholder="Token symbol"
              aria-label="Token"
              trim
              @input="symbol = $event.toUpperCase()"
              @keyup.enter.native="getAccountHistory"
            />
            <b-button
              variant="outline-danger"
              size="sm"
              :disabled="account.length < 3"
              @click.prevent="getAccountHistory"
            >
              Search
            </b-button>
          </b-nav-form>

          <b-navbar-nav class="ml-auto">
            <b-nav-item v-b-modal.modal-settings>
              Settings
            </b-nav-item>
            <b-nav-item :to="{ name: 'richlist' }">
              Richlist
            </b-nav-item>
          </b-navbar-nav>
        </b-collapse>
      </div>
    </b-navbar>

    <router-view :key="$route.fullPath" />

    <footer class="footer">
      <p>
        made with ❤️ by
        <a href="https://hive.blog/@reazuliqbal">@reazuliqbal</a>
      </p>

      <div>Please vote my witness</div>

      <ul class="list-inline">
        <li class="list-inline-item">
          <a
            href="#"
            @click.prevent="voteHiveWitness"
          >Hive</a>
        </li>
        <li class="list-inline-item">
          &
        </li>
        <li class="list-inline-item">
          <a
            href="#"
            @click.prevent="voteHiveEngineWitness"
          >Hive-Engine</a>
        </li>
      </ul>
    </footer>

    <b-modal
      id="modal-settings"
      ref="modal"
      no-close-on-backdrop
      title="Settings"
      hide-footer
    >
      <form
        ref="form"
        @submit.stop.prevent="saveSettings"
      >
        <b-form-group label="Hive RPC node">
          <b-form-input
            id="hiveRPC"
            v-model="hiveRPC"
            required
            trim
          />
        </b-form-group>

        <b-form-group label="Hive Engine RPC node">
          <b-form-input
            id="hiveEngineRPC"
            v-model="hiveEngineRPC"
            required
            trim
          />
        </b-form-group>

        <b-form-group label="Hive Engine History API">
          <b-form-input
            id="historyAPI"
            v-model="historyAPI"
            required
            trim
          />
        </b-form-group>

        <b-button
          type="submit"
          variant="primary"
        >
          Save
        </b-button>
      </form>
    </b-modal>
  </div>
</template>

<script>

const b64uLookup = {
  '/': '_', _: '/', '+': '-', '-': '+', '=': '.', '.': '=',
};
const b64uEncode = (str) => btoa(str).replace(/(\+|\/|=)/g, (m) => b64uLookup[m]);

export default {
  data() {
    return {
      account: '',
      symbol: '',
      hiveRPC: '',
      hiveEngineRPC: '',
      historyAPI: '',
    };
  },

  computed: {
    isHiveKeychain() {
      return !!window.hive_keychain;
    },
  },

  watch: {
    $route: {
      immediate: true,
      handler() {
        this.account = this.$route.params.username || '';
        this.symbol = this.$route.query.symbol || '';
      },
    },
  },

  created() {
    let nodes = localStorage.getItem('nodes');

    if (nodes) {
      nodes = JSON.parse(nodes);
    }

    this.hiveRPC = nodes?.hiveRPC || 'https://api.deathwing.me';
    this.hiveEngineRPC = nodes?.hiveEngineRPC || 'https://enginerpc.com';
    this.historyAPI = nodes?.historyAPI || 'https://enginehistory.rishipanthee.com/accountHistory';
  },

  methods: {
    getAccountHistory() {
      if (
        this.account !== this.$route.params.username
        || this.symbol !== this.$route.query.symbol
      ) {
        const query = {};

        if (this.symbol) query.symbol = this.symbol;
        this.$router.push({
          name: 'explorer',
          params: { username: this.account },
          query,
        });
      }
    },

    saveSettings() {
      localStorage.setItem(
        'nodes',
        JSON.stringify({
          hiveRPC: this.hiveRPC,
          hiveEngineRPC: this.hiveEngineRPC,
          historyAPI: this.historyAPI,
        }),
      );
      // Hide the modal manually
      this.$nextTick(() => {
        this.$bvModal.hide('modal-settings');
      });
    },

    voteHiveWitness() {
      if (this.isHiveKeychain) {
        window.hive_keychain.requestWitnessVote(null, 'reazuliqbal', true, () => { });
      } else {
        window.open('https://hivesigner.com/sign/account-witness-vote?witness=reazuliqbal&approve=1', '_blank');
      }
    },

    voteHiveEngineWitness() {
      const json = JSON.stringify({
        contractName: 'witnesses',
        contractAction: 'approve',
        contractPayload: {
          witness: 'hewitness',
        },
      });

      if (this.isHiveKeychain) {
        window.hive_keychain.requestCustomJson(null, 'ssc-mainnet-hive', 'Active', json, 'Hive-Engine Witness Vote', () => { });
      } else {
        const op = b64uEncode(JSON.stringify(['custom_json', {
          required_auths: ['__signer'], required_posting_auths: [], id: 'ssc-mainnet-hive', json,
        }]));

        window.open(`https://hivesigner.com/sign/op/${op}?authority=active`, '_blank');
      }
    },
  },
};
</script>

<style lang="scss">
</style>
