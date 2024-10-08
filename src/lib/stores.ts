import { writable } from 'svelte/store';

export const app_data = writable<{
	pipValue: number;
	volumeType: 'UNITS' | 'LOTS';
	profitTrades: {
		keepPips: number;
		profitAmount: number;
		profitVolume: number;
	}[];
	lossTrades: {
		lossAmount: number;
		lossVolume: number;
	}[];
}>({
	pipValue: 10,
	volumeType: 'LOTS',
	profitTrades: [
		{
			keepPips: 10,
			profitAmount: 0,
			profitVolume: 0
		}
	],
	lossTrades: [
		{
			lossAmount: 0,
			lossVolume: 0
		}
	]
});
