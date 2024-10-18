import { type IClosedResults, type IAppData } from '$lib';
import { writable } from 'svelte/store';

export const app_data = writable<IAppData>();

export const defaultAppData = {
	mode: 'MONEY',
	volumeType: 'LOTS',
	activeProfitableTrade: { profitAmount: null, keep: null, profitVolume: null, index: 0 },
	activeLosingTrade: { lossAmount: null, lossVolume: null, index: 0 },
	lossTrades: [{ lossAmount: null, lossVolume: null, index: 0 }],
	profitTrades: [{ profitAmount: null, keep: null, profitVolume: null, index: 0 }]
};

const defaultClosedResults = {
	applyAmount: 0,
	keepAmount: 0,
	losingTradesToClose: [],
	closePercentage: 0
};

export function reset_closed_results() {
	closed_results.set(defaultClosedResults);
}

export const closed_results = writable<IClosedResults>(defaultClosedResults);
