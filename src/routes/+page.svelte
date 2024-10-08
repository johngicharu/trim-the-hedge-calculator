<script lang="ts">
	import CopyIcon from '$lib/icons/CopyIcon.svelte';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	const keep_amount = writable<number>();
	const keep_pips = writable<number>();
	const pip_value = writable<number>(10);
	const volume_type = writable<'UNITS' | 'LOTS'>('LOTS');
	const close_partial_volume = writable<number>();
	const loss_volume = writable<number>();
	const loss_amount = writable<number>();
	const profit_amount = writable<number>();
	const profit_volume = writable<number>();

	$: info = '';

	onMount(() => {
		// @ts-ignore
		storage.local.set('trim_the_hedge_calculator_data', { pipValue: 7.7 });
		// @ts-ignore
		info = storage.local.get('trim_the_hedge_calculator_data');
	});

	$: if ($keep_pips && $profit_amount && $loss_amount && $loss_volume && $profit_volume) {
		const amount_to_keep =
			($profit_volume / ($volume_type === 'UNITS' ? 100000 : 1)) * $pip_value * $keep_pips;

		keep_amount.set(Math.floor(amount_to_keep * 100) / 100);
		const apply = $profit_amount - amount_to_keep;
		close_partial_volume.set(
			Math.floor(
				(apply / Math.abs($loss_amount)) *
					($loss_volume / ($volume_type === 'UNITS' ? 100000 : 1)) *
					100
			) / 100
		);
	}
</script>

<main class="bg-slate-50 min-w-96">
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

	{info}
	<section class="w-full calculator">
		<div class="section">
			<div class="input_group">
				<div class="input_wrapper">
					<label for="pip_value">Pip Value</label>
					<input type="number" name="pip_value" id="pip_value" bind:value={$pip_value} />
				</div>

				<div class="input_wrapper">
					<label for="volume">Volume Type</label>
					<select name="volume" id="volume" bind:value={$volume_type}>
						<option value="LOTS">LOTS</option>
						<option value="UNITS">UNITS</option>
					</select>
				</div>
			</div>
		</div>

		<div class="section winning">
			<div class="group_label">Winning Trade</div>
			<div class="input_group">
				<div class="input_wrapper">
					<label for="keep_pips">Keep Pips</label>
					<input type="number" name="keep_pips" id="keep_pips" bind:value={$keep_pips} />
				</div>

				<div class="input_wrapper">
					<label for="profit">Profit</label>
					<input type="number" name="profit" id="profit" bind:value={$profit_amount} />
				</div>

				<div class="input_wrapper">
					<label for="profit_volume">Volume ({$volume_type.toLowerCase()})</label>
					<input type="number" name="profit_volume" id="profit" bind:value={$profit_volume} />
				</div>
			</div>
		</div>

		<div class="section losing">
			<div class="group_label">Losing Trade</div>
			<div class="input_group">
				<div class="input_wrapper">
					<label for="loss">Loss</label>
					<input type="number" name="loss" id="loss" bind:value={$loss_amount} />
				</div>

				<div class="input_wrapper">
					<label for="loss_volume">Volume ({$volume_type.toLowerCase()})</label>
					<input type="number" name="loss_volume" id="loss_volume" bind:value={$loss_volume} />
				</div>
			</div>
		</div>

		{#if $keep_pips && $profit_amount && $loss_amount && $loss_volume && $profit_volume}
			<div class="py-4 summary_section text-slate-200 bg-slate-800">
				<div class="keep_amount">
					<div class="font-semibold">Keep Amount:</div>
					<div class="content">
						<button on:click={() => navigator.clipboard.writeText($keep_amount.toString())}>
							<div>
								{$keep_amount}
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
									($profit_amount - $keep_amount).toFixed(2).toString()
								)}
						>
							<div>
								{+($profit_amount - $keep_amount).toFixed(2)}
							</div>
							<div>
								<CopyIcon />
							</div>
						</button>
					</div>
				</div>
				<div class="close_partial">
					<div class="font-semibold">Close Partial:</div>
					<div class="content">
						<button
							on:click={() =>
								navigator.clipboard.writeText(
									($close_partial_volume > $loss_volume
										? $loss_volume
										: $close_partial_volume
									).toString()
								)}
						>
							<div>
								{$close_partial_volume > $loss_volume ? $loss_volume : $close_partial_volume}
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
						<button
							on:click={() =>
								navigator.clipboard.writeText(
									($close_partial_volume > $loss_volume
										? 100
										: +(
												($close_partial_volume /
													($loss_volume / ($volume_type === 'UNITS' ? 100000 : 1))) *
												100
											).toFixed(2)
									).toString()
								)}
						>
							<div>
								{$close_partial_volume > $loss_volume
									? 100
									: +(
											($close_partial_volume /
												($loss_volume / ($volume_type === 'UNITS' ? 100000 : 1))) *
											100
										).toFixed(2)}%
							</div>
							<div>
								<CopyIcon />
							</div>
						</button>
					</div>
				</div>

				{#if $close_partial_volume > $loss_volume}
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
				{/if}
			</div>
		{/if}
	</section>
</main>

<style lang="postcss">
	.calculator {
		@apply border w-full;

		.section {
			@apply px-3 w-full flex flex-col items-start justify-start py-2;
		}

		.group_label {
			@apply font-semibold text-sm pt-2;
		}

		.section.winning {
			@apply bg-blue-50;
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
