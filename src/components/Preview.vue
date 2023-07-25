<script setup lang="ts">

const props = defineProps<{
	documentUrl: string;
}>();

</script>

<template>
	<div class="columns">
		<div class="column is-four-fifths">
			<h2 class="title is-2">Preview</h2>
		</div>
		<div class="column">
			<div class="field is-grouped">
				<p class="control">
					<button class="button">
						<span class="icon is-small"><i class="fas fa-align-left"></i></span>
						<span>Left</span>
					</button>
				</p>
				<p class="control">
					<button class="button is-primary">Ergebniszettel</button>
				</p>
			</div>
		</div>
	</div>
	<div>
		<iframe :src="documentUrl" width="100%" height="700px"></iframe>
	</div>
</template>

<style lang="scss" scoped>
</style>
