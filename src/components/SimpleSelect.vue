<script setup lang="ts">

const props = defineProps<{
	title: string;
	values: (string | number)[];
}>();

const { title, values } = props;

</script>

<template>
	<div class="field">
		<label class="label">{{ title }}</label>
		<div class="select">
			<select>
				<option v-for="value in values" :key="value" :value="value">{{ value }}</option>
			</select>
		</div>
	</div>
</template>
