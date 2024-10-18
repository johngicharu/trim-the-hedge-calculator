<script lang="ts">
	import { addProfitableTrade, deleteItem, MAX_TRADES } from '$lib';
	import AddIcon from '$lib/icons/AddIcon.svelte';
	import BackIcon from '$lib/icons/BackIcon.svelte';
	import DeleteIcon from '$lib/icons/DeleteIcon.svelte';
	import { app_data } from '$lib/stores';
	import FormattedNumber from './FormattedNumber.svelte';
</script>

{#key `${$app_data.activeProfitableTrade.index}_${$app_data.activeProfitableTrade.resetTimestamp}}`}
	<div class="section winning">
		<div class="pb-2 group_label">
			<div class="text">Profitable Trade</div>
			<div class="grid grid-cols-5 grid-rows-1 control_btns">
				<button
					class:opacity-0={$app_data.activeProfitableTrade.index < 1}
					class:pointer-events-none={$app_data.activeProfitableTrade.index < 1}
					on:click={() => {
						app_data.update((d) => {
							const foundItem = d.profitTrades.find(
								(item) => item.index === d.activeProfitableTrade.index - 1
							);

							if (foundItem) d.activeProfitableTrade = foundItem;

							return d;
						});
					}}
				>
					<BackIcon />
				</button>

				<button
					on:click={() => deleteItem($app_data.activeProfitableTrade)}
					class:opacity-0={$app_data.profitTrades.length < 2}
					class:pointer-events-none={$app_data.profitTrades.length < 2}
				>
					<DeleteIcon />
				</button>

				<div class="col-span-2 w-14" class:opacity-0={$app_data.profitTrades.length < 2}>
					{$app_data.activeProfitableTrade.index + 1} of {$app_data.profitTrades.length}
				</div>

				<button
					class="rotate-180"
					class:opacity-0={$app_data.profitTrades.length >= MAX_TRADES &&
						$app_data.activeProfitableTrade.index === MAX_TRADES - 1}
					class:pointer-events-none={$app_data.profitTrades.length >= MAX_TRADES &&
						$app_data.activeProfitableTrade.index === MAX_TRADES - 1}
					on:click={() => {
						if ($app_data.profitTrades.length - 1 === $app_data.activeProfitableTrade.index) {
							addProfitableTrade();
						} else {
							app_data.update((d) => {
								const foundItem = d.profitTrades.find(
									(item) => item.index === d.activeProfitableTrade.index + 1
								);

								if (foundItem) d.activeProfitableTrade = foundItem;

								return d;
							});
						}
					}}
				>
					{#if $app_data.profitTrades.length - 1 === $app_data.activeProfitableTrade.index && $app_data.profitTrades.length < MAX_TRADES}
						<AddIcon />
					{:else}
						<BackIcon />
					{/if}
				</button>
			</div>
		</div>

		<div class="input_group">
			<div class="input_wrapper">
				<label for="keep_value">Keep ({$app_data.mode === 'MONEY' ? '$' : 'Pips'})</label>
				<FormattedNumber
					name="keep"
					id="keep"
					defaultValue={$app_data.activeProfitableTrade.keep}
					on:update={(e) => {
						app_data.update((data) => {
							data.activeProfitableTrade.keep = e.detail;
							data.profitTrades[data.activeProfitableTrade.index] = data.activeProfitableTrade;

							return data;
						});
					}}
					maxDecimals={2}
				/>
			</div>

			<div class="input_wrapper">
				<label for="profit">Profit ({$app_data.mode === 'MONEY' ? '$' : 'Pips'})</label>
				<FormattedNumber
					name="profitAmount"
					id="profitAmount"
					defaultValue={$app_data.activeProfitableTrade.profitAmount}
					on:update={(e) => {
						app_data.update((data) => {
							data.activeProfitableTrade.profitAmount = e.detail;
							data.profitTrades[data.activeProfitableTrade.index] = data.activeProfitableTrade;

							return data;
						});
					}}
					maxDecimals={2}
				/>
			</div>

			<div class="input_wrapper">
				<label for="profit_volume">Volume ({$app_data.volumeType.toLowerCase()})</label>
				<FormattedNumber
					name="profitVolume"
					id="profitVolume"
					defaultValue={$app_data.activeProfitableTrade.profitVolume}
					on:update={(e) => {
						app_data.update((data) => {
							data.activeProfitableTrade.profitVolume = e.detail;
							data.profitTrades[data.activeProfitableTrade.index] = data.activeProfitableTrade;

							return data;
						});
					}}
					maxDecimals={$app_data.volumeType === 'UNITS' ? 0 : 2}
				/>
			</div>
		</div>
	</div>
{/key}

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
	}
</style>
