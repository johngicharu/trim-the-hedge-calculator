<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let defaultValue: number | null | undefined;
	export let maxDecimals = 30;

	let internalValue: string = (defaultValue || '').toString();

	const format = (node: HTMLInputElement, formatFunction: (value: string) => string) => {
		function updateValue(e: Event) {
			node.value = formatFunction(node.value);
		}

		node.addEventListener('input', updateValue);
		node.addEventListener('paste', updateValue);

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
	class="px-3 border py-1 w-full h-9 border-slate-300"
	type="text"
	{...$$props}
	on:input={changeFunc}
/>
