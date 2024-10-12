<script lang="ts">
	import { addProfitableTrade, deleteItem, type IProfitItem } from '$lib';
	import AddIcon from '$lib/icons/AddIcon.svelte';
	import BackIcon from '$lib/icons/BackIcon.svelte';
	import DeleteIcon from '$lib/icons/DeleteIcon.svelte';
	import { app_data } from '$lib/stores';

	let profitItem: IProfitItem = $app_data.activeProfitableTrade;

	$: ((_) => {
		$app_data.profitTrades[profitItem.index] = profitItem;
	})(profitItem);

	app_data.subscribe((apd) => {
		if (
			apd.activeProfitableTrade.index !== profitItem.index ||
			apd.activeProfitableTrade.keepPips !== profitItem.keepPips ||
			apd.activeProfitableTrade.profitAmount !== profitItem.profitAmount ||
			apd.activeProfitableTrade.profitVolume !== profitItem.profitVolume
		) {
			profitItem = apd.activeProfitableTrade;
		}
	});
</script>

<div class="section winning">
	<div class="group_label">
		<div class="text">Winning Trade</div>
		<div class="flex items-center justify-center space-x-2 control_btns">
			{#if profitItem.index >= 1}
				<button
					on:click={() => {
						app_data.update((d) => {
							const foundItem = d.profitTrades.find((item) => item.index === profitItem.index - 1);

							if (foundItem) d.activeProfitableTrade = foundItem;

							return d;
						});
					}}
				>
					<BackIcon />
				</button>
			{/if}

			{#if $app_data.profitTrades.length > 1}
				<button on:click={() => deleteItem(profitItem)}>
					<DeleteIcon />
				</button>
			{/if}

			{#if $app_data.profitTrades.length > 1}
				<div>
					{profitItem.index + 1} of {$app_data.profitTrades.length}
				</div>
			{/if}

			<button
				class="rotate-180"
				on:click={() => {
					if ($app_data.profitTrades.length - 1 === $app_data.activeProfitableTrade.index) {
						addProfitableTrade();
					} else {
						app_data.update((d) => {
							const foundItem = d.profitTrades.find((item) => item.index === profitItem.index + 1);

							if (foundItem) d.activeProfitableTrade = foundItem;

							return d;
						});
					}
				}}
			>
				{#if $app_data.profitTrades.length - 1 === $app_data.activeProfitableTrade.index}
					<AddIcon />
				{:else}
					<BackIcon />
				{/if}
			</button>
		</div>
	</div>

	<div class="input_group">
		<div class="input_wrapper">
			<label for="keep_pips">Keep Pips</label>
			<input type="number" name="keep_pips" id="keep_pips" bind:value={profitItem.keepPips} />
		</div>

		<div class="input_wrapper">
			<label for="profit">Profit</label>
			<input type="number" name="profit" id="profit" bind:value={profitItem.profitAmount} />
		</div>

		<div class="input_wrapper">
			<label for="profit_volume">Volume ({$app_data.volumeType.toLowerCase()})</label>
			<input type="number" name="profit_volume" id="profit" bind:value={profitItem.profitVolume} />
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

	.section.winning {
		@apply bg-blue-50;
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
