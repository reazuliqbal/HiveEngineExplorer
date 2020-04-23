<template>
  <div id="app">
    <b-navbar toggleable="sm" type="dark" variant="dark">
      <div class="container-fluid">
        <b-navbar-brand :to="{name: 'home'}">HE Explorer</b-navbar-brand>
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

        <b-collapse id="nav-collapse" is-nav>
          <b-nav-form>
            <b-form-input
              v-model="account"
              class="mr-sm-2"
              size="sm"
              placeholder="Account name"
              aria-label="Account"
              @input="account=$event.toLowerCase()"
              trim
            ></b-form-input>
            <b-form-input
              v-model="symbol"
              class="mr-sm-2"
              size="sm"
              placeholder="Token symbol"
              aria-label="Token"
              @input="symbol=$event.toUpperCase()"
              trim
            ></b-form-input>
            <b-button
              variant="outline-danger"
              size="sm"
              @click.prevent="getAccountHistory"
              :disabled="account.length < 3"
            >Search</b-button>
          </b-nav-form>

          <b-navbar-nav class="ml-auto">
            <b-nav-item :to="{name: 'richlist'}">Richlist</b-nav-item>
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
        >@BDCommunity</a> as a Hive witness.
      </p>
      <p>
        made with ❤️ by
        <a href="https://hive.blog/@reazuliqbal">@reazuliqbal</a>
      </p>
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      account: '',
      symbol: '',
    };
  },
  created() {
    this.account = this.$route.params.username || '';
    this.symbol = this.$route.query.symbol || '';
  },
  methods: {
    getAccountHistory() {
      if (this.account !== this.$route.params.username
      || this.symbol !== this.$route.query.symbol) {
        const query = {};

        if (this.symbol) query.symbol = this.symbol;
        this.$router.push({ name: 'explorer', params: { username: this.account }, query });
      }
    },
  },
};
</script>

<style lang="scss">
</style>
