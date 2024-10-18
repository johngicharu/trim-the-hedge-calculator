import { get } from 'svelte/store';
import { app_data } from './stores';

export const MAX_TRADES = 10;

export const defaultAppData = () => {
	const resetTime = Date.now();

	return {
		mode: 'MONEY',
		volumeType: 'LOTS',
		activeProfitableTrade: {
			profitAmount: null,
			keep: null,
			profitVolume: null,
			index: 0,
			resetTimestamp: resetTime
		},
		activeLosingTrade: { lossAmount: null, lossVolume: null, index: 0, resetTimestamp: resetTime },
		lossTrades: [{ lossAmount: null, lossVolume: null, index: 0, resetTimestamp: resetTime }],
		profitTrades: [
			{ profitAmount: null, keep: null, profitVolume: null, index: 0, resetTimestamp: resetTime }
		]
	} as IAppData;
};

// place files you want to import through the `$lib` alias in this folder.
export type IProfitItem = {
	keep: number | null;
	profitAmount: number | null;
	profitVolume: number | null;
	index: number;
	resetTimestamp: number;
};

export type ILossItem = {
	lossAmount: number | null;
	lossVolume: number | null;
	index: number;
	resetTimestamp: number;
};

export type IAppData = {
	volumeType: 'UNITS' | 'LOTS';
	mode: 'MONEY' | 'PIPS';
	activeProfitableTrade: IProfitItem;
	activeLosingTrade: ILossItem;
	profitTrades: IProfitItem[];
	lossTrades: ILossItem[];
};

export type IClosedResults = {
	applyAmount: number;
	keepAmount: number;
	losingTradesToClose: { lossAmount: number; lossVolume: number; closeVolume: number }[];
	closePercentage: number;
};

export async function addProfitableTrade() {
	if (get(app_data).profitTrades.length >= MAX_TRADES) return;

	app_data.update((d) => {
		const newItem = {
			keep: d.activeProfitableTrade?.keep || 10,
			profitAmount: null,
			profitVolume: null,
			index: d.profitTrades.length,
			resetTimestamp: d.activeProfitableTrade.resetTimestamp
		};

		d.profitTrades.push(newItem);
		d.activeProfitableTrade = newItem;

		return d;
	});
}

export async function addLosingTrade() {
	if (get(app_data).lossTrades.length >= MAX_TRADES) return;

	app_data.update((d) => {
		const newLoss = {
			lossAmount: null,
			lossVolume: null,
			index: d.lossTrades.length,
			resetTimestamp: d.activeLosingTrade.resetTimestamp
		};

		d.lossTrades.push(newLoss);
		d.activeLosingTrade = newLoss;

		return d;
	});
}

export function deleteItem(item: IProfitItem | ILossItem) {
	const fieldName: 'profitTrades' | 'lossTrades' =
		'lossAmount' in item ? 'lossTrades' : 'profitTrades';
	const typeName: 'activeLosingTrade' | 'activeProfitableTrade' =
		'lossAmount' in item ? 'activeLosingTrade' : 'activeProfitableTrade';
	const newIndex = item.index === 0 ? 0 : item.index - 1;

	app_data.update((data) => {
		const fixedItems = data[fieldName]
			.filter((tr) => tr.index !== item.index)
			.map((tr, index) => ({ ...tr, index }));

		return {
			...data,
			[fieldName]: fixedItems,
			[typeName]: fixedItems[newIndex]
		};
	});
}

export function isNumber(val: any): boolean {
	return typeof val === 'number' && !Object.is(Number(val), NaN);
}

export function resetDefaults(field: 'activeProfitableTrade' | 'activeLosingTrade' | 'all') {
	app_data.update((data) => {
		const defaultData = defaultAppData();

		if (field === 'activeProfitableTrade') {
			data.activeProfitableTrade = defaultData.activeProfitableTrade;
			data.profitTrades = defaultData.profitTrades;
		} else if (field === 'activeLosingTrade') {
			data.activeLosingTrade = defaultData.activeLosingTrade;
			data.lossTrades = defaultData.lossTrades;
		} else if (field === 'all') {
			data = defaultData;
		}

		return data;
	});
}
