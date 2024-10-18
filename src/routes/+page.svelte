<script lang="ts">
	import { browser } from '$app/environment';
	import { addLosingTrade, addProfitableTrade, type IAppData, type IClosedResults } from '$lib';
	import ClosingTrades from '$lib/comps/ClosingTrades.svelte';
	import LosingTrade from '$lib/comps/LosingTrade.svelte';
	import ProfitableTrade from '$lib/comps/ProfitableTrade.svelte';
	import CopyIcon from '$lib/icons/CopyIcon.svelte';
	import { app_data, closed_results, defaultAppData } from '$lib/stores';
	import { onMount } from 'svelte';

	function getBrowserInstance(): typeof chrome | null {
		// Get extension api Chrome or Firefox
		const browserInstance = browser && (window.chrome || (window as any)['browser']);
		return browserInstance || null;
	}

	let cached_data: IAppData;
	$: cached_data;

	async function saveAppData(data: IAppData) {
		const instance = getBrowserInstance();

		try {
			instance &&
				(await instance.storage.local.set({
					trim_the_hedge_calculator_data: data
				}));
		} catch (error) {
			// console.error(error);
		}
	}

	async function getAppData() {
		const instance = getBrowserInstance();

		if (instance) {
			try {
				const info = (await instance.storage.local.get())?.trim_the_hedge_calculator_data;

				if (info) {
					app_data.set(info);
					cached_data = info;

					if (!info?.profitTrades?.length) {
						addProfitableTrade();
					}
					if (!info?.lossTrades?.length) {
						addLosingTrade();
					}
				}
			} catch (err: any) {
				app_data.set(defaultAppData);
			}
		} else {
			app_data.set(defaultAppData);
		}
	}

	onMount(() => {
		getAppData();

		return async () => {
			await saveAppData($app_data);
		};
	});

	app_data.subscribe((data) => {
		if (!data) return;
		/**
			Calculate the total profit
			Always calculate in pips for the close volume
			We also need the total profit captured though to show the user
			If money -> Convert to pips given the volume
			If pips -> Use the one with the most pips first, and trim that first. So, we sort based on pips from lowest to highest
			Then we pop an item from the end until we are either, done with the profit being distributed or done with the losses to be closed or, the profit could not close the current loss trade
			Push the results to a new array of trades to close
		*/
		let totalProfit = 0;
		let totalKeepProfit = 0;
		let totalApplyProfit = 0;

		for (let i = 0; i < data.profitTrades.length; i++) {
			const profitTrade = data.profitTrades[i];
			profitTrade.keep = profitTrade.keep || 0;
			profitTrade.profitAmount = profitTrade.profitAmount || 0;
			profitTrade.profitVolume = profitTrade.profitVolume || 0;

			if (profitTrade.profitAmount > 0 && profitTrade.profitVolume > 0) {
				totalProfit +=
					data.mode === 'MONEY'
						? profitTrade.profitAmount
						: profitTrade.profitAmount * profitTrade.profitVolume;
				totalKeepProfit +=
					data.mode === 'MONEY'
						? profitTrade.keep || 0
						: (profitTrade.keep || 0) * profitTrade.profitVolume;
			}
		}

		totalApplyProfit = totalProfit - totalKeepProfit;

		// Go through the losing trades
		let totalLoss = 0;
		let totalLossVolume = 0;
		const lossTrades: { pips: number; volume: number; value: number }[] = [];

		for (let i = 0; i < data.lossTrades.length; i++) {
			const lossTrade = data.lossTrades[i];
			lossTrade.lossVolume = lossTrade.lossVolume || 0;
			lossTrade.lossAmount = lossTrade.lossAmount || 0;

			lossTrade.lossVolume = Math.abs(lossTrade.lossVolume);
			lossTrade.lossAmount = Math.abs(lossTrade.lossAmount);

			if (lossTrade.lossAmount > 0 && lossTrade.lossVolume > 0) {
				totalLoss +=
					data.mode === 'MONEY'
						? lossTrade.lossAmount
						: lossTrade.lossAmount * lossTrade.lossVolume;
				totalLossVolume += lossTrade.lossVolume;
				lossTrades.push({
					volume: lossTrade.lossVolume,
					pips:
						data.mode === 'MONEY'
							? lossTrade.lossAmount / lossTrade.lossVolume
							: lossTrade.lossAmount,
					value:
						data.mode === 'MONEY'
							? lossTrade.lossAmount
							: lossTrade.lossAmount * lossTrade.lossVolume
				});
			}
		}

		// Sort the lossTrades list
		if (lossTrades.length > 1) lossTrades.sort((a, b) => a.pips - b.pips);

		const closedResults: IClosedResults = {
			keepAmount: totalKeepProfit,
			applyAmount: totalApplyProfit,
			closePercentage: 0,
			losingTradesToClose: []
		};
		let totalCloseTradesVolume = 0;
		let totalProfitUsedToCloseTrades = 0;

		function trimTrade(
			trade: { pips: number; volume: number; value: number },
			profitValue: number
		) {
			const roundFactor = data.volumeType === 'UNITS' ? 1 : 100;
			let closeVolume =
				Math.floor((profitValue / trade.value) * trade.volume * roundFactor) / roundFactor;

			if (closeVolume > trade.volume) {
				closeVolume = trade.volume;
			}

			return { closeVolume, applyProfitUsed: closeVolume * trade.pips };
		}

		while (lossTrades.length && totalApplyProfit > 0) {
			// TODO -> remember to check if the current trimmed volume is 0 or less than 0
			const tradeToTrim = lossTrades[lossTrades.length - 1];
			const { applyProfitUsed, closeVolume } = trimTrade(tradeToTrim, totalApplyProfit);

			if (closeVolume < (data.volumeType === 'UNITS' ? 1 : 0.01)) {
				// Found a trade that cannot be trimmed
				break;
			}

			lossTrades.pop();
			closedResults.losingTradesToClose.push({
				closeVolume: closeVolume,
				lossVolume: tradeToTrim.volume,
				lossAmount: data.mode === 'MONEY' ? tradeToTrim.value : tradeToTrim.pips
			});
			totalCloseTradesVolume += closeVolume;
			totalProfitUsedToCloseTrades += applyProfitUsed;
			totalApplyProfit = totalProfit - (totalKeepProfit + totalProfitUsedToCloseTrades);
		}

		closedResults.keepAmount = totalProfit - totalProfitUsedToCloseTrades;
		closedResults.applyAmount = totalProfitUsedToCloseTrades;
		closedResults.closePercentage = totalCloseTradesVolume / totalLossVolume;

		if (closedResults.losingTradesToClose.length) {
			closed_results.set(closedResults);
		}

		saveAppData(data);
	});
</script>

{#if $app_data}
	<main class="w-full h-full bg-slate-50">
		<header
			class="flex flex-col items-center justify-center w-full px-3 py-3 space-y-2 text-slate-200 bg-slate-800"
		>
			<div class="logo">
				<img src="ssfx.jpg" alt="SSFx" class="w-8 h-8 rounded-full" />
			</div>
			<h1 class="flex flex-col items-center justify-center h-full whitespace-nowrap">
				<div class="text-2xl font-semibold heading_text">
					Trim The Hedge Calculator {$app_data.mode}
				</div>
				<div class="text-xs tagline">
					made with love <a class="text-cyan-300" target="_blank" href="http://gicharu.com"
						>@gicharu</a
					>
					{cached_data?.activeProfitableTrade?.profitAmount || ''}
				</div>
			</h1>
		</header>

		<section
			class="w-full calculator h-[488px] max-h-[488px]"
			data-simplebar
			data-simplebar-auto-hide={false}
		>
			<div class="section">
				<div class="input_group">
					<div class="input_wrapper">
						<label for="mode">Mode</label>
						<select name="mode" id="mode" bind:value={$app_data.mode}>
							<option value="MONEY">MONEY</option>
							<option value="PIPS">PIPS</option>
						</select>
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
			<LosingTrade />

			<div class="py-4 summary_section text-slate-200 bg-slate-800 min-h-[200px]">
				{#if $app_data.mode === 'MONEY'}
					<div class="keep_amount">
						<div class="font-semibold">Keep ({$app_data.mode === 'MONEY' ? '$' : 'Pips'}):</div>
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
						<div class="font-semibold">Apply ({$app_data.mode === 'MONEY' ? '$' : 'Pips'}):</div>
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
				{/if}

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
				<div class="w-full h-5 spacer"></div>
			</div>
		</section>
	</main>
{/if}

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
