<script lang="ts">
	import { app_data } from '$lib/stores';
	import { onMount } from 'svelte';

	export let profit_trade_index: number = 0;

	let keep_pips: number;
	let profit_amount: number;
	$: volume_type = $app_data.volumeType;
	let profit_volume: number;

	onMount(() => {
		if ($app_data.profitTrades[profit_trade_index]) {
			keep_pips = $app_data.profitTrades[profit_trade_index].keepPips;
			profit_amount = $app_data.profitTrades[profit_trade_index].profitAmount;
			profit_volume = $app_data.profitTrades[profit_trade_index].profitVolume;
		}

		return () => {
			if ($app_data.profitTrades[profit_trade_index]) {
				if (
					$app_data.profitTrades[profit_trade_index].keepPips !== keep_pips ||
					$app_data.profitTrades[profit_trade_index].profitAmount !== profit_amount ||
					$app_data.profitTrades[profit_trade_index].profitVolume !== profit_volume
				) {
					$app_data.profitTrades[profit_trade_index] = {
						keepPips: keep_pips,
						profitAmount: profit_amount,
						profitVolume: profit_volume
					};
				}
			}
		};
	});

	$: if (keep_pips >= 0 && profit_amount >= 0 && profit_volume > 0) {
		if (
			$app_data.profitTrades[profit_trade_index] &&
			($app_data.profitTrades[profit_trade_index].keepPips !== keep_pips ||
				$app_data.profitTrades[profit_trade_index].profitAmount !== profit_amount ||
				$app_data.profitTrades[profit_trade_index].profitVolume !== profit_volume)
		) {
			$app_data.profitTrades[profit_trade_index] = {
				keepPips: keep_pips,
				profitAmount: profit_amount,
				profitVolume: profit_volume
			};
		}
	}
</script>

<div class="section winning">
	<div class="group_label">
		<div class="text">Winning Trade</div>
	</div>
	<div class="input_group">
		<div class="input_wrapper">
			<label for="keep_pips">Keep Pips</label>
			<input type="number" name="keep_pips" id="keep_pips" bind:value={keep_pips} />
		</div>

		<div class="input_wrapper">
			<label for="profit">Profit</label>
			<input type="number" name="profit" id="profit" bind:value={profit_amount} />
		</div>

		<div class="input_wrapper">
			<label for="profit_volume">Volume ({volume_type.toLowerCase()})</label>
			<input type="number" name="profit_volume" id="profit" bind:value={profit_volume} />
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
		@apply flex items-start justify-between space-x-2 -mt-2;
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
