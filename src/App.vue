<template>
  <div>
    <UHeader
      :ui="{
        root: 'bg-neutral-800 border-b border-neutral-700/60',
        title: 'text-white',
        toggle: 'text-neutral-300 hover:text-white hover:bg-neutral-700/50',
      }"
    >
      <template #title>
        <ULink
          :to="{ name: 'home' }"
          class="text-white text-xl font-bold"
        >
          HE Explorer
        </ULink>
      </template>

      <div class="flex items-center gap-2">
        <UInput
          :model-value="account"
          size="sm"
          placeholder="Account name"
          aria-label="Account"
          class="w-40"
          @update:model-value="account = $event.trim().toLowerCase()"
          @keyup.enter="getAccountHistory"
        />
        <UInput
          :model-value="symbol"
          size="sm"
          placeholder="Token symbol"
          aria-label="Token"
          class="w-36"
          @update:model-value="symbol = $event.trim().toUpperCase()"
          @keyup.enter="getAccountHistory"
        />
        <UButton
          color="error"
          variant="outline"
          size="sm"
          class="text-red-400 ring-red-400/60 hover:text-red-300"
          :disabled="account.length < 3"
          @click="getAccountHistory"
        >
          Search
        </UButton>
      </div>

      <template #right>
        <UButton
          :icon="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
          color="neutral"
          variant="ghost"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          class="text-neutral-300 hover:text-white hover:bg-neutral-700/50"
          @click="toggle()"
        />
        <UButton
          color="neutral"
          variant="ghost"
          label="Settings"
          class="text-neutral-300 hover:text-white hover:bg-neutral-700/50"
          @click="settingsOpen = true"
        />
        <UButton
          :to="{ name: 'richlist' }"
          color="neutral"
          variant="ghost"
          label="Richlist"
          class="text-neutral-300 hover:text-white hover:bg-neutral-700/50"
        />
      </template>

      <template #body>
        <div class="flex flex-col gap-3 pt-2">
          <div class="flex items-center gap-2">
            <UInput
              :model-value="account"
              placeholder="Account name"
              aria-label="Account"
              class="flex-1"
              @update:model-value="account = $event.trim().toLowerCase()"
              @keyup.enter="getAccountHistory"
            />
            <UInput
              :model-value="symbol"
              placeholder="Token symbol"
              aria-label="Token"
              class="flex-1"
              @update:model-value="symbol = $event.trim().toUpperCase()"
              @keyup.enter="getAccountHistory"
            />
            <UButton
              color="error"
              variant="outline"
              :disabled="account.length < 3"
              @click="getAccountHistory"
            >
              Search
            </UButton>
          </div>

          <UButton
            color="neutral"
            variant="ghost"
            label="Settings"
            class="justify-start"
            @click="settingsOpen = true"
          />
          <UButton
            :to="{ name: 'richlist' }"
            color="neutral"
            variant="ghost"
            label="Richlist"
            class="justify-start"
          />
          <UButton
            :icon="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
            color="neutral"
            variant="ghost"
            :label="isDark ? 'Light mode' : 'Dark mode'"
            class="justify-start"
            @click="toggle()"
          />
        </div>
      </template>
    </UHeader>

    <RouterView :key="route.fullPath" />

    <footer class="app-footer">
      <p>
        made with ❤️ by
        <a
          href="https://hive.blog/@reazuliqbal"
          class="text-primary"
        >@reazuliqbal</a>
      </p>

      <div class="text-muted">
        Please vote my witness
      </div>

      <ul class="mt-2 flex list-none items-center justify-center gap-2 p-0">
        <li>
          <a
            href="#"
            class="text-primary"
            @click.prevent="voteHiveWitness"
          >Hive</a>
        </li>
        <li class="text-muted">
          &
        </li>
        <li>
          <a
            href="#"
            class="text-primary"
            @click.prevent="voteHiveEngineWitness"
          >Hive-Engine</a>
        </li>
      </ul>
    </footer>

    <UModal
      v-model:open="settingsOpen"
      title="Settings"
      :dismissible="false"
    >
      <template #body>
        <form
          class="space-y-4"
          @submit.stop.prevent="saveSettings"
        >
          <UFormField label="Hive RPC node">
            <UInput
              id="hiveRPC"
              v-model="hiveRPC"
              required
              class="w-full"
            />
          </UFormField>

          <UFormField label="Hive Engine RPC node">
            <UInput
              id="hiveEngineRPC"
              v-model="hiveEngineRPC"
              required
              class="w-full"
            />
          </UFormField>

          <UFormField label="Hive Engine History API">
            <UInput
              id="historyAPI"
              v-model="historyAPI"
              required
              class="w-full"
            />
          </UFormField>

          <UButton
            type="submit"
            color="primary"
          >
            Save
          </UButton>
        </form>
      </template>
    </UModal>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useDarkMode from './composables/useDarkMode';

const b64uLookup = {
  '/': '_', _: '/', '+': '-', '-': '+', '=': '.', '.': '=',
};
const b64uEncode = (str) => btoa(str).replace(/(\+|\/|=)/g, (m) => b64uLookup[m]);

const route = useRoute();
const router = useRouter();

const { isDark, toggle } = useDarkMode();

const account = ref('');
const symbol = ref('');
const hiveRPC = ref('');
const hiveEngineRPC = ref('');
const historyAPI = ref('');
const settingsOpen = ref(false);

const isHiveKeychain = () => !!window.hive_keychain;

watch(() => route.fullPath, () => {
  account.value = route.params.username || '';
  symbol.value = route.query.symbol || '';
}, { immediate: true });

let nodes = localStorage.getItem('nodes');

if (nodes) {
  nodes = JSON.parse(nodes);
}

hiveRPC.value = nodes?.hiveRPC || 'https://api.deathwing.me';
hiveEngineRPC.value = nodes?.hiveEngineRPC || 'https://enginerpc.com';
historyAPI.value = nodes?.historyAPI || 'https://accounts.hive-engine.com/accountHistory';

function getAccountHistory() {
  if (
    account.value !== route.params.username
    || symbol.value !== route.query.symbol
  ) {
    const query = {};

    if (symbol.value) query.symbol = symbol.value;
    router.push({
      name: 'explorer',
      params: { username: account.value },
      query,
    });
  }
}

function saveSettings() {
  localStorage.setItem(
    'nodes',
    JSON.stringify({
      hiveRPC: hiveRPC.value,
      hiveEngineRPC: hiveEngineRPC.value,
      historyAPI: historyAPI.value,
    }),
  );

  settingsOpen.value = false;
}

function voteHiveWitness() {
  if (isHiveKeychain()) {
    window.hive_keychain.requestWitnessVote(null, 'reazuliqbal', true, () => { });
  } else {
    window.open('https://hivesigner.com/sign/account-witness-vote?witness=reazuliqbal&approve=1', '_blank');
  }
}

function voteHiveEngineWitness() {
  const json = JSON.stringify({
    contractName: 'witnesses',
    contractAction: 'approve',
    contractPayload: {
      witness: 'hewitness',
    },
  });

  if (isHiveKeychain()) {
    window.hive_keychain.requestCustomJson(null, 'ssc-mainnet-hive', 'Active', json, 'Hive-Engine Witness Vote', () => { });
  } else {
    const op = b64uEncode(JSON.stringify(['custom_json', {
      required_auths: ['__signer'], required_posting_auths: [], id: 'ssc-mainnet-hive', json,
    }]));

    window.open(`https://hivesigner.com/sign/op/${op}?authority=active`, '_blank');
  }
}
</script>
