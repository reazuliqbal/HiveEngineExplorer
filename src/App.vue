<template>
  <div id="app">
    <b-navbar toggleable="sm" type="dark" variant="dark">
      <div class="container-fluid">
        <b-navbar-brand :to="{ name: 'home' }">HE Explorer</b-navbar-brand>
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

        <b-collapse id="nav-collapse" is-nav>
          <b-nav-form>
            <b-form-input
              v-model="account"
              class="mr-sm-2"
              size="sm"
              placeholder="Account name"
              aria-label="Account"
              @input="account = $event.toLowerCase()"
              trim
            ></b-form-input>
            <b-form-input
              v-model="symbol"
              class="mr-sm-2"
              size="sm"
              placeholder="Token symbol"
              aria-label="Token"
              @input="symbol = $event.toUpperCase()"
              trim
            ></b-form-input>
            <b-button
              variant="outline-danger"
              size="sm"
              @click.prevent="getAccountHistory"
              :disabled="account.length < 3"
              >Search</b-button
            >
          </b-nav-form>

          <b-navbar-nav class="ml-auto">
            <b-nav-item v-b-modal.modal-settings>Settings</b-nav-item>
            <b-nav-item :to="{ name: 'richlist' }">Richlist</b-nav-item>
          </b-navbar-nav>
        </b-collapse>
      </div>
    </b-navbar>

    <router-view :key="$route.fullPath" />

    <footer class="footer">
      <p>
        Vote for
        <a
          href="https://hivesigner.com/sign/account-witness-vote?witness=bdcommunity&approve=1"
          >@BDCommunity</a
        >
        as a Hive witness.
      </p>
      <p>
        made with ❤️ by
        <a href="https://hive.blog/@reazuliqbal">@reazuliqbal</a>
      </p>
    </footer>
    <b-modal id="modal-settings" no-close-on-backdrop ref="modal" title="Settings" hide-footer>
      <form ref="form" @submit.stop.prevent="saveSettings">
        <label>Hive Engine RPC node</label>
        <b-form-input
          id="hiveEngineRPC"
          v-model="hiveEngineRPC"
          required
        ></b-form-input>
        <br />
        <label>Hive Engine History API</label>
        <b-form-input
          id="historyAPI"
          v-model="historyAPI"
          required
        ></b-form-input>
        <br />
        <b-button type="submit" variant="primary">Save</b-button>
      </form>
    </b-modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      account: '',
      symbol: '',
      hiveEngineRPC: '',
      historyAPI: '',
    };
  },
  created() {
    this.account = this.$route.params.username || '';
    this.symbol = this.$route.query.symbol || '';
    const nodes = JSON.parse(localStorage.getItem('nodes'));
    if (nodes) {
      this.hiveEngineRPC = nodes.hiveEngineRPC;
      this.historyAPI = nodes.historyAPI;
    } else {
      localStorage.setItem(
        'nodes',
        JSON.stringify({
          hiveEngineRPC: 'https://api.hive-engine.com/rpc',
          historyAPI: 'https://accounts.hive-engine.com/accountHistory',
        }),
      );
      this.hiveEngineRPC = 'https://api.hive-engine.com/rpc';
      this.historyAPI = 'https://accounts.hive-engine.com/accountHistory';
    }
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
          hiveEngineRPC: this.hiveEngineRPC,
          historyAPI: this.historyAPI,
        }),
      );
      // Hide the modal manually
      this.$nextTick(() => {
        this.$bvModal.hide('modal-settings');
      });
    },
  },
};
</script>

<style lang="scss">
</style>
