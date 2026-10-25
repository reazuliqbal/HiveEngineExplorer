<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { formatDistanceToNow } from 'date-fns';

const props = defineProps({
  datetime: { type: [Date, Number, String], required: true },
  autoUpdate: { type: Number, default: 0 },
});

const now = ref(Date.now());
let timer = null;

onMounted(() => {
  if (props.autoUpdate > 0) {
    timer = setInterval(() => {
      now.value = Date.now();
    }, props.autoUpdate * 1000);
  }
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});

const label = computed(() => {
  now.value; // re-evaluate on every auto-update tick
  const date = props.datetime instanceof Date ? props.datetime : new Date(props.datetime);
  return formatDistanceToNow(date, { addSuffix: true });
});
</script>

<template>
  <span>{{ label }}</span>
</template>
