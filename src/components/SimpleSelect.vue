<script setup lang="ts">

import { computed } from "vue";

const props = defineProps<{
	title: string;
	values: (string)[];
	modelValue: string;
}>();

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
				<option v-for="value in values" :key="value" :value="value">
					{{ value }}
				</option>
			</select>
		</div>
	</div>
</template>
