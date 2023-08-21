<script setup lang="ts">

import { computed } from "vue";

const props = defineProps<{
  title: string;
  values: { [key: string]: string };
  modelValue: string;
}>();

const allValues = computed(() => {
  return Object.entries(props.values)
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([key, value]) => key);
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const selected = computed({
  get: () => props.modelValue,
  set: (value: string) => emit("update:modelValue", value)
});

const { title, values } = props;

</script>

<template>
  <div class="field">
    <label class="label">{{ title }}</label>
    <div class="select">
      <select v-model="selected">
        <option v-for="value in allValues" :key="value" :value="value">
          {{ props.values[value] }}
        </option>
      </select>
    </div>
  </div>
</template>
