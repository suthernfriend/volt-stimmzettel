<script setup lang="ts">

const props = defineProps<{
	documentUrl: string;
}>();

</script>

<template>
	<iframe :src="documentUrl" width="100%" height="700px"></iframe>
</template>

<style lang="scss" scoped>
</style>
