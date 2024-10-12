<script lang="ts">
	import { app_data } from '$lib/stores';
	import { addLosingTrade, deleteItem, MAX_TRADES, type ILossItem } from '$lib';
	import AddIcon from '$lib/icons/AddIcon.svelte';
	import BackIcon from '$lib/icons/BackIcon.svelte';
	import DeleteIcon from '$lib/icons/DeleteIcon.svelte';

	let lossItem: ILossItem = $app_data.activeLosingTrade;

	$: ((_) => {
		$app_data.lossTrades[lossItem.index] = lossItem;
	})(lossItem);

	app_data.subscribe((apd) => {
		if (
			apd.activeLosingTrade.index !== lossItem.index ||
			apd.activeLosingTrade.lossAmount !== lossItem.lossAmount ||
			apd.activeLosingTrade.lossVolume !== lossItem.lossVolume
		) {
			lossItem = apd.activeLosingTrade;
		}
	});
</script>

<div class="section losing">
	<div class="pb-2 group_label">
		<div class="text">Losing Trade</div>

		<div class="grid grid-cols-5 grid-rows-1 control_btns">
			<button
				class:opacity-0={lossItem.index < 1}
				class:pointer-events-none={lossItem.index < 1}
				on:click={() => {
					app_data.update((d) => {
						const foundItem = d.lossTrades.find((item) => item.index === lossItem.index - 1);

						if (foundItem) d.activeLosingTrade = foundItem;

						return d;
					});
				}}
			>
				<BackIcon />
			</button>

			<button
				on:click={() => deleteItem(lossItem)}
				class:opacity-0={$app_data.lossTrades.length < 2}
				class:pointer-events-none={$app_data.lossTrades.length < 2}
			>
				<DeleteIcon />
			</button>

			<div class="col-span-2 w-14" class:opacity-0={$app_data.lossTrades.length < 2}>
				{lossItem.index + 1} of {$app_data.lossTrades.length}
			</div>

			<button
				class="rotate-180"
				class:opacity-0={$app_data.lossTrades.length >= MAX_TRADES &&
					$app_data.activeLosingTrade.index === MAX_TRADES - 1}
				class:pointer-events-none={$app_data.lossTrades.length >= MAX_TRADES &&
					$app_data.activeLosingTrade.index === MAX_TRADES - 1}
				on:click={() => {
					if ($app_data.lossTrades.length - 1 === $app_data.activeLosingTrade.index) {
						addLosingTrade();
					} else {
						app_data.update((d) => {
							const foundItem = d.lossTrades.find((item) => item.index === lossItem.index + 1);

							if (foundItem) d.activeLosingTrade = foundItem;

							return d;
						});
					}
				}}
			>
				{#if $app_data.lossTrades.length - 1 === $app_data.activeLosingTrade.index && $app_data.lossTrades.length < MAX_TRADES}
					<AddIcon />
				{:else}
					<BackIcon />
				{/if}
			</button>
		</div>
	</div>
	<div class="input_group">
		<div class="input_wrapper">
			<label for="loss">Loss</label>
			<input type="number" name="loss" id="loss" bind:value={lossItem.lossAmount} />
		</div>

		<div class="input_wrapper">
			<label for="loss_volume">Volume ({$app_data.volumeType.toLowerCase()})</label>
			<input type="number" name="loss_volume" id="loss_volume" bind:value={lossItem.lossVolume} />
		</div>
	</div>
</div>

<style lang="postcss">
	.section {
		@apply px-3 w-full flex flex-col items-start justify-start py-2;
	}

	.group_label {
		@apply font-semibold text-sm pt-2 flex items-center justify-between w-full;
	}

	.section.losing {
		@apply bg-red-50;
	}

	.input_group {
		@apply flex items-start justify-between space-x-2 -mt-2 w-full;
	}

	.input_wrapper {
		@apply flex items-start justify-start flex-col w-full py-3;

		label {
			@apply font-semibold pb-1;
		}

		input {
			@apply px-3 border py-1 w-full;
			@apply w-full h-9 border-slate-300;
		}
	}
</style>
