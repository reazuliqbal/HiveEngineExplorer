<template>
  <div class="px-3 pt-3 pb-3">
    <template v-if="dataLoaded">
      <div class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 class="mt-0 mb-0 sm:m-0">
          {{ symbol }} Richlist
        </h3>
        <div class="flex items-center gap-2">
          <UInput
            :model-value="token"
            name="symbol"
            placeholder="Token symbol"
            @update:model-value="token = $event.toUpperCase()"
            @keyup.enter="getRichList"
          />
          <UButton
            color="info"
            variant="outline"
            :disabled="token.length < 1"
            @click="getRichList"
          >
            GO
          </UButton>
        </div>
      </div>

      <div class="overflow-x-auto">
        <UTable
          ref="table"
          v-model:pagination="pagination"
          v-model:sorting="sorting"
          :data="richlist"
          :columns="columns"
          :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
          class="mt-4"
        >
          <template #empty>
            <h6 class="text-base font-semibold">
              Nothing to show.
            </h6>
          </template>

          <template #account-cell="{ row }">
            <a
              :href="`https://hive.blog/@${row.original.account}`"
              class="text-primary"
            >{{ row.original.account }}</a>
          </template>

          <template #balance-cell="{ row }">
            {{ addCommas(row.original.balance.toString()) }}
          </template>

          <template #stake-header>
            <span title="Sum of Stake, Delegation Out, and Pending Undelegations">STAKE</span>
          </template>
          <template #stake-cell="{ row }">
            {{ addCommas(row.original.stake.toString()) }}
          </template>

          <template #pendingUnstake-cell="{ row }">
            {{ addCommas(row.original.pendingUnstake.toString()) }}
          </template>

          <template #delegationsOut-cell="{ row }">
            {{ addCommas(row.original.delegationsOut.toString()) }}
          </template>

          <template #delegationsIn-cell="{ row }">
            {{ addCommas(row.original.delegationsIn.toString()) }}
          </template>

          <template #total-header>
            <span title="Sum of Balance, Pending Unstake, Pending Undelegations, and Delegations In, minus the Delegation Out">TOTAL</span>
          </template>
          <template #total-cell="{ row }">
            {{ addCommas(row.original.total.toString()) }}
          </template>
        </UTable>
      </div>

      <div class="mt-4 flex justify-center">
        <UPagination
          :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
          :items-per-page="table?.tableApi?.getState().pagination.pageSize"
          :total="table?.tableApi?.getFilteredRowModel().rows.length"
          @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Big from 'big.js';
import { getPaginationRowModel } from '@tanstack/vue-table';
import { useLoading } from 'vue-loading-overlay';
import HE from '../modules/HE';
import { addCommas } from '../helpers';

const route = useRoute();
const router = useRouter();

const loading = useLoading();
const loader = loading.show({ color: 'red' });

const symbol = ref(null);
const token = ref('');
const richlist = ref([]);
const dataLoaded = ref(false);

const table = ref(null);
const pagination = ref({
  pageIndex: 0,
  pageSize: 50,
});
const sorting = ref([
  { id: 'total', desc: true },
]);

const numericColumn = (key, header) => ({
  accessorKey: key,
  header,
  accessorFn: (row) => parseFloat(row[key]),
});

const columns = [
  { accessorKey: 'index', header: '#' },
  { accessorKey: 'account', header: 'ACCOUNT' },
  numericColumn('balance', 'BALANCE'),
  numericColumn('stake', 'STAKE'),
  numericColumn('pendingUnstake', 'PENDING UNSTAKE'),
  numericColumn('delegationsOut', 'DELEGATION OUT'),
  numericColumn('delegationsIn', 'DELEGATION IN'),
  numericColumn('total', 'TOTAL'),
];

watch(dataLoaded, () => {
  loader.hide();
});

watch(symbol, async (s) => {
  await loadRichlist(s);
});

init();

async function init() {
  const { symbol: s } = route.params;

  if (!s) {
    loader.hide();

    symbol.value = 'BEE';
    router.push({ name: 'richlist', params: { symbol: 'BEE' } });
  } else {
    symbol.value = s;
  }

  token.value = symbol.value;
}

async function loadRichlist(t) {
  dataLoaded.value = false;

  const holders = [];
  const limit = 1000;
  let lastId = 0;
  let newData;

  do {
    const data = await HE.getTokenHolders(t, lastId, limit);

    newData = data.length;

    if (newData > 0) {
      lastId = data.at(-1)._id;
      holders.push(...data);

      if (data.length < limit) {
        newData = 0;
      }
    }
  } while (newData > 0);

  richlist.value = holders.map((h) => {
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
    .map((t2, index) => ({
      index,
      ...t2,
    }));

  dataLoaded.value = true;
}

function getRichList() {
  if (token.value !== symbol.value) {
    router.push({ name: 'richlist', params: { symbol: token.value } });
  }
}
</script>
