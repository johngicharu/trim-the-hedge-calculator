<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let defaultValue: number | null | undefined;
	export let maxDecimals = 0;

	let internalValue: string = (defaultValue || '').toString();

	const format = (node: HTMLInputElement, formatFunction: (value: string) => string) => {
		function updateValue(e: Event) {
			// If all the values are zeros
			if (
				node.value
					.replace(',', '')
					.split('')
					.every((a) => a === '0')
			) {
				node.value = node.value.replace(',', '');
				return;
			}

			node.value = formatFunction(node.value);
		}

		function handleKeyUpAndDownEvents(e: KeyboardEvent) {
			if (e.code === 'ArrowUp') {
				node.value = formatFunction(
					(
						(parseFloat(node.value.replace(',', '') || '0') ?? 0) +
						1 / Math.pow(10, maxDecimals)
					).toString()
				);
			}
			if (e.code === 'ArrowDown') {
				node.value = formatFunction(
					(
						(parseFloat(node.value.replace(',', '') || '0') ?? 0) -
						1 / Math.pow(10, maxDecimals)
					).toString()
				);
			}
		}

		node.addEventListener('input', updateValue);
		node.addEventListener('paste', updateValue);
		node.addEventListener('keydown', handleKeyUpAndDownEvents);

		// Format on intial hydration
		node.value = formatFunction(node.value);

		return {
			destroy() {
				node.removeEventListener('input', updateValue);
				node.removeEventListener('paste', updateValue);
			}
		};
	};

	const formattedNumber = (value: string) => {
		value = value.trim();

		if (!value) {
			return '';
		}

		if (value.replace(/[^\.]/g, '').length > 1) {
			const first = value.indexOf('.');

			value = `${value.slice(0, first)}.${value.slice(first + 1, value.length).replace('.', '')}`;
		}

		if (
			value.endsWith('.') ||
			(value.endsWith('0') && value.split('').filter((e) => e === '.').length === 1)
		) {
			return value;
		}

		const onlyNumbers = value.replace(/[^(\d|\.)]/g, '');
		const parsed = parseFloat(onlyNumbers).toLocaleString('en-US', {
			minimumFractionDigits: 0,
			maximumFractionDigits: maxDecimals
		});

		return isNaN(parseFloat(parsed)) ? internalValue : parsed;
	};

	function changeFunc(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		try {
			if (
				!isNaN(parseFloat(e.currentTarget.value.replace(new RegExp(',', 'g'), ''))) &&
				!e.currentTarget.value.endsWith('.')
			) {
				dispatch('update', parseFloat(e.currentTarget.value.replace(new RegExp(',', 'g'), '')));

				return;
			}

			throw new Error('Failed to parse');
		} catch (error) {
			//console.log(e.currentTarget.value);
			// if (e.currentTarget.value === '') {
			// 	dispatch('update', 0);
			// 	return;
			// }
			//	console.error('Error Parsing Value: ', e.currentTarget.value);
		}
	}
</script>

<input
	use:format={formattedNumber}
	bind:value={internalValue}
	class="w-full px-3 py-1 border h-9 border-slate-300"
	type="text"
	{...$$props}
	on:input={changeFunc}
/>
