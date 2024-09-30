<script lang="ts">
	import { writable } from 'svelte/store';

	const keep_amount = writable<number>(0);
	const keep_volume = writable<number>(0);
	const volume_type = writable<'UNITS' | 'LOTS'>('UNITS');
	const close_partial_volume = writable<number>(0);
	const loss_volume = writable<number>(0);
	const loss_amount = writable<number>(0);
	const profit_amount = writable<number>(0);
	const profit_volume = writable<number>(0);

	$: if ($keep_volume && $profit_amount && $loss_amount && $loss_volume && $profit_volume) {
		keep_amount.set($profit_volume * ($keep_volume / ($volume_type === 'UNITS' ? 100000 : 1)));
		const apply =
			$profit_amount - $profit_volume * ($keep_volume / ($volume_type === 'UNITS' ? 100000 : 1));
		close_partial_volume.set(
			(apply / Math.abs($loss_amount)) * ($loss_volume / ($volume_type === 'UNITS' ? 100000 : 1))
		);
	}
</script>

<main class="content">
	<header class="flex items-center justify-center w-full px-3 py-5">
		<h1 class="h-full text-2xl font-semibold whitespace-nowrap">Trim The Hedge Calculator</h1>
	</header>

	<section class="calculator">
		<div class="input_wrapper">
			<label for="keep_pips">Keep Pips</label>
			<input type="number" name="keep_pips" id="keep_pips" bind:value={$keep_volume} />
		</div>

		<div class="input_wrapper">
			<select name="volume" id="volume" bind:value={$volume_type}>
				<option value="UNITS">UNITS</option>
				<option value="VOLUME">VOLUME</option>
			</select>
		</div>

		<div class="input_wrapper">
			<label for="profit">Profit</label>
			<input type="number" name="profit" id="profit" bind:value={$profit_amount} />
		</div>

		<div class="input_wrapper">
			<label for="profit_volume">Profit Volume</label>
			<input type="number" name="profit_volume" id="profit" bind:value={$profit_volume} />
		</div>

		<div class="input_wrapper">
			<label for="loss">Loss</label>
			<input type="number" name="loss" id="loss" bind:value={$loss_amount} />
		</div>

		<div class="input_wrapper">
			<label for="loss_volume">Loss Volume</label>
			<input type="number" name="loss_volume" id="loss_volume" bind:value={$loss_volume} />
		</div>

		{#if $keep_volume && $profit_amount && $loss_amount && $loss_volume && $profit_volume}
			<div class="summary_section">
				<div class="keep_amount">Keep Amount: {$keep_amount}</div>
				<div class="close_partial">Close Partial: {$close_partial_volume}</div>
				<div class="close_partial">
					Close Percentage: {($close_partial_volume /
						($loss_volume / ($volume_type === 'UNITS' ? 100000 : 1))) *
						100}%
				</div>
			</div>
		{/if}
	</section>
</main>

<style lang="postcss">
	.calculator {
		@apply border w-full;

		.input_wrapper {
			@apply flex items-start justify-start flex-col w-full py-3 px-5;

			label {
				@apply font-semibold;
			}

			input {
				@apply px-3 border py-1 w-full;
			}

			select {
				@apply w-full px-3 py-2;
			}
		}

		.summary_section {
			@apply w-full px-4 py-2;

			div {
				@apply font-medium;
			}
		}
	}
</style>
