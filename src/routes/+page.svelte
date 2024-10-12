<script lang="ts">
	import { browser } from '$app/environment';
	import { addLosingTrade, addProfitableTrade } from '$lib';
	import ClosingTrades from '$lib/comps/ClosingTrades.svelte';
	import LosingTrade from '$lib/comps/LosingTrade.svelte';
	import ProfitableTrade from '$lib/comps/ProfitableTrade.svelte';
	import CopyIcon from '$lib/icons/CopyIcon.svelte';
	import { app_data, closed_results } from '$lib/stores';
	import { onMount } from 'svelte';

	function getBrowserInstance(): typeof chrome | null {
		// Get extension api Chrome or Firefox
		const browserInstance = browser && (window.chrome || (window as any)['browser']);
		return browserInstance || null;
	}

	async function saveAppData() {
		const instance = getBrowserInstance();
		instance &&
			(await instance.storage.local.set({
				trim_the_hedge_calculator_data: $app_data
			}));
	}

	async function getAppData() {
		const instance = getBrowserInstance();

		if (instance) {
			const info = (await instance.storage.local.get()).trim_the_hedge_calculator_data;
			if (!info) {
				await saveAppData();
			} else {
				app_data.set(info);
				if (!info?.profitTrades?.length) {
					addProfitableTrade();
				}
				if (!info?.lossTrades?.length) {
					addLosingTrade();
				}
			}
		}
	}

	onMount(() => {
		getAppData();

		return async () => {
			await saveAppData();
		};
	});

	app_data.subscribe((data) => {
		const amount_to_keep = data.profitTrades
			.filter((t) => t.keepPips >= 0 && t.profitAmount >= 0 && t.profitVolume >= 0)
			.map(
				(t) =>
					(t.profitVolume / (data.volumeType === 'UNITS' ? 100000 : 1)) * data.pipValue * t.keepPips
			)
			.reduce((a, b) => a + b);

		const total_profit = data.profitTrades
			.filter((t) => t.keepPips >= 0 && t.profitAmount >= 0 && t.profitVolume >= 0)
			.map((t) => t.profitAmount)
			.reduce((a, b) => a + b);

		let remaining_amount = total_profit - amount_to_keep;
		const losingTrades = data.lossTrades
			.filter((t) => !Object.is(Number(t.lossAmount), NaN) && t.lossVolume)
			.map((t) => ({
				...t,
				lossAmount: Math.abs(t.lossAmount),
				lossVolume: Math.abs(t.lossVolume)
			}))
			.sort((a, b) => b.lossAmount - a.lossAmount);

		const closedTrades: { lossAmount: number; lossVolume: number; closeVolume: number }[] = [];

		let was_edited = false;

		while (remaining_amount > 0) {
			// Close an additional losing trade
			// Check each trade and close them based on whether they can be fully closed or not, we can first implement a one trade policy though where we only close one trade of the traders' chosing
			const tradeToTrim = losingTrades[0];

			if (
				!tradeToTrim ||
				Object.is(Math.abs(tradeToTrim.lossAmount), NaN) ||
				Object.is(Math.abs(tradeToTrim.lossVolume), NaN) ||
				Object.is(Number(tradeToTrim.lossAmount), NaN) ||
				Object.is(Number(tradeToTrim.lossVolume), NaN)
			) {
				break;
			}

			was_edited = true;
			if (tradeToTrim.lossAmount < remaining_amount) {
				closedTrades.push({ ...tradeToTrim, closeVolume: tradeToTrim.lossVolume });
				remaining_amount -= tradeToTrim.lossAmount;
				losingTrades.shift();
			} else {
				// Trim this position only
				const close_partial_lots =
					Math.floor(
						(remaining_amount / Math.abs(tradeToTrim.lossAmount)) *
							(tradeToTrim.lossVolume / (data.volumeType === 'UNITS' ? 100000 : 1)) *
							100
					) / 100;
				closedTrades.push({
					...tradeToTrim,
					closeVolume: close_partial_lots * (data.volumeType === 'UNITS' ? 100000 : 1)
				});
				remaining_amount -= remaining_amount;
			}
		}

		if (was_edited) {
			const closedResults = {
				applyAmount: total_profit - amount_to_keep,
				closePercentage:
					closedTrades.length && data.lossTrades.length
						? closedTrades.map((t) => t.closeVolume).reduce((a, b) => a + b) /
							data.lossTrades
								.filter((t) => !Object.is(Number(t.lossAmount), NaN) && t.lossVolume >= 0)
								.map((t) => t.lossVolume)
								.reduce((a, b) => a + b)
						: 0,
				keepAmount: amount_to_keep,
				losingTradesToClose: closedTrades
			};

			closed_results.set(closedResults);
		}

		saveAppData();
	});
</script>

<main class="w-full h-full bg-slate-50">
	<header
		class="flex flex-col items-center justify-center w-full px-3 py-3 space-y-2 text-slate-200 bg-slate-800"
	>
		<div class="logo">
			<img src="ssfx.jpg" alt="SSFx" class="w-8 h-8 rounded-full" />
		</div>
		<h1 class="flex flex-col items-center justify-center h-full whitespace-nowrap">
			<div class="text-2xl font-semibold heading_text">Trim The Hedge Calculator</div>
			<div class="text-xs tagline">
				made with love <a class="text-cyan-300" href="http://gicharu.com">@gicharu</a>
			</div>
		</h1>
	</header>

	<section class="w-full calculator h-[556px]" data-simplebar>
		<div class="section">
			<div class="input_group">
				<div class="input_wrapper">
					<label for="pip_value">Pip Value</label>
					<input type="number" name="pip_value" id="pip_value" bind:value={$app_data.pipValue} />
				</div>

				<div class="input_wrapper">
					<label for="volume">Volume Type</label>
					<select name="volume" id="volume" bind:value={$app_data.volumeType}>
						<option value="LOTS">LOTS</option>
						<option value="UNITS">UNITS</option>
					</select>
				</div>
			</div>
		</div>

		<ProfitableTrade />

		<!-- <LosingTrade loss_trade_index={0} /> -->

		<div class="py-4 summary_section text-slate-200 bg-slate-800 min-h-[220px]">
			<div class="keep_amount">
				<div class="font-semibold">Keep Amount:</div>
				<div class="content">
					<button
						on:click={() =>
							navigator.clipboard.writeText(
								(+($closed_results.keepAmount || 0).toFixed(2)).toString()
							)}
					>
						<div>
							{+($closed_results.keepAmount || 0).toFixed(2)}
						</div>
						<div>
							<CopyIcon />
						</div>
					</button>
				</div>
			</div>
			<div class="keep_amount">
				<div class="font-semibold">Apply Amount:</div>
				<div class="content">
					<button
						on:click={() =>
							navigator.clipboard.writeText(
								(+($closed_results.applyAmount || 0).toFixed(2)).toString()
							)}
					>
						<div>
							{+($closed_results.applyAmount || 0).toFixed(2)}
						</div>
						<div>
							<CopyIcon />
						</div>
					</button>
				</div>
			</div>

			<div class="close_partial">
				<div class="font-semibold">Close Percentage:</div>
				<div class="content">
					<button>
						<div>
							{+($closed_results.closePercentage * 100).toFixed(2)}%
						</div>
					</button>
				</div>
			</div>

			<!-- Close Summary -->
			<ClosingTrades trade_to_close={$closed_results.losingTradesToClose} />

			<!-- {#if $close_partial_volume > $loss_volume}
					<div class="remaining_profit">
						<div class="font-semibold">Apply to Next Trade:</div>
						<div class="content">
							<div>
								{+($profit_amount - ($keep_amount + $loss_amount)).toFixed(2)}
							</div>
							<div>
								<CopyIcon />
							</div>
						</div>
					</div>
				{/if} -->
			<div class="w-full h-10 spacer"></div>
		</div>
	</section>
</main>

<style lang="postcss">
	.calculator {
		@apply border w-full;

		.section {
			@apply px-3 w-full flex flex-col items-start justify-start py-2;
		}

		.input_group {
			@apply flex items-start justify-between space-x-2 -mt-2 w-full;
		}

		.input_wrapper {
			@apply flex items-start justify-start flex-col w-full py-3;

			label {
				@apply font-semibold pb-1;
			}

			input,
			select {
				@apply px-3 border py-1 w-full;
				@apply w-full h-9 border-slate-300;
			}
		}

		.summary_section {
			@apply w-full px-4 py-2;

			& > div {
				@apply font-medium flex items-center justify-between;
			}

			.content {
				@apply text-cyan-400;

				button {
					@apply flex items-center justify-end space-x-2;
				}
			}
		}
	}
</style>
