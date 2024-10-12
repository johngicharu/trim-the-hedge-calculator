<script lang="ts">
	import CopyIcon from '$lib/icons/CopyIcon.svelte';
	import { app_data } from '$lib/stores';

	export let trade_to_close: { lossAmount: number; lossVolume: number; closeVolume: number }[];
</script>

<div class="pt-5 close_summary">
	<div class="font-medium">Close Summary</div>
	<div class="closing_trades_container">
		<div class="flex items-center justify-between profits">
			<div class="pl-2 font-medium text-gray-400">Profitable Positions</div>
			<div class="pl-4 content text-cyan-400">ALL</div>
		</div>

		<div class="losing_trades">
			<div class="pl-2 font-medium text-gray-400">Losing Positions</div>
			<div class="list">
				{#each trade_to_close as close_item}
					<div class="flex items-center justify-between w-full pl-4 text-sm">
						<div class="flex items-center justify-start space-x-1">
							<div class="lowercase partial_close">
								<button
									on:click={() => navigator.clipboard.writeText(close_item.closeVolume.toString())}
									class="flex items-center justify-between lowercase text-cyan-400"
								>
									<div class="data">
										{close_item.closeVolume}
										{$app_data.volumeType}
									</div>
									<div>
										<CopyIcon />
									</div>
								</button>
							</div>
							<div class="text-gray-400 spacer">Of</div>
							<div class="lowercase total">
								{close_item.lossVolume}
								{$app_data.volumeType}
								<span class="italic text-gray-400">
									(-{$app_data.mode === 'MONEY' ? '$' : ''}{close_item.lossAmount}
									{$app_data.mode === 'MONEY' ? 'Trade ' : 'pip Trade'})
								</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
