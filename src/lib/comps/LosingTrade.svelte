<script lang="ts">
	import { app_data } from '$lib/stores';
	import { onMount } from 'svelte';

	export let loss_trade_index: number = 0;

	let loss_amount: number;
	$: volume_type = $app_data.volumeType;
	let loss_volume: number;

	onMount(() => {
		if ($app_data.lossTrades[loss_trade_index]) {
			loss_amount = $app_data.lossTrades[loss_trade_index].lossAmount;
			loss_volume = $app_data.lossTrades[loss_trade_index].lossVolume;
		}

		return () => {
			if ($app_data.lossTrades[loss_trade_index]) {
				if (
					$app_data.lossTrades[loss_trade_index].lossAmount !== loss_amount ||
					$app_data.lossTrades[loss_trade_index].lossVolume !== loss_volume
				) {
					$app_data.lossTrades[loss_trade_index] = {
						lossAmount: Math.abs(loss_amount),
						lossVolume: loss_volume
					};
				}
			}
		};
	});

	$: if (!Object.is(Math.abs(loss_amount), NaN) && loss_volume > 0) {
		if (
			$app_data.lossTrades[loss_trade_index] &&
			($app_data.lossTrades[loss_trade_index].lossAmount !== loss_amount ||
				$app_data.lossTrades[loss_trade_index].lossVolume !== loss_volume)
		) {
			$app_data.lossTrades[loss_trade_index] = {
				lossAmount: Math.abs(loss_amount),
				lossVolume: loss_volume
			};
		}
	}
</script>

<div class="section losing">
	<div class="group_label">Losing Trade</div>
	<div class="input_group">
		<div class="input_wrapper">
			<label for="loss">Loss</label>
			<input type="number" name="loss" id="loss" bind:value={loss_amount} />
		</div>

		<div class="input_wrapper">
			<label for="loss_volume">Volume ({volume_type.toLowerCase()})</label>
			<input type="number" name="loss_volume" id="loss_volume" bind:value={loss_volume} />
		</div>
	</div>
</div>

<style lang="postcss">
	.section {
		@apply px-3 w-full flex flex-col items-start justify-start py-2;
	}

	.group_label {
		@apply font-semibold text-sm pt-2;
	}

	.section.losing {
		@apply bg-red-50;
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
