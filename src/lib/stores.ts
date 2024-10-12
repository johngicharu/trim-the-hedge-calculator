import { type IClosedResults, type IAppData } from '$lib';
import { writable } from 'svelte/store';

export const app_data = writable<IAppData>({
	pipValue: 10,
	volumeType: 'LOTS',
	activeProfitableTrade: { profitAmount: 0, keepPips: 10, profitVolume: 0, index: 0 },
	activeLosingTrade: { lossAmount: 0, lossVolume: 0, index: 0 },
	lossTrades: [{ lossAmount: 0, lossVolume: 0, index: 0 }],
	profitTrades: [{ profitAmount: 0, keepPips: 10, profitVolume: 0, index: 0 }]
});

export const closed_results = writable<IClosedResults>({
	applyAmount: 0,
	keepAmount: 0,
	losingTradesToClose: [],
	closePercentage: 0
});
