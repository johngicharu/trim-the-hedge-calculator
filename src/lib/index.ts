import { get } from 'svelte/store';
import { app_data } from './stores';

export const MAX_TRADES = 10;

// place files you want to import through the `$lib` alias in this folder.
export type IProfitItem = {
	keepPips: number;
	profitAmount: number;
	profitVolume: number;
	index: number;
};

export type ILossItem = {
	lossAmount: number;
	lossVolume: number;
	index: number;
};

export type IAppData = {
	pipValue: number;
	volumeType: 'UNITS' | 'LOTS';
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

	console.log('Add Profitable Trade');
	app_data.update((d) => {
		const newItem = {
			keepPips: d.profitTrades[d.profitTrades.length - 1]?.keepPips || 10,
			profitAmount: 0,
			profitVolume: 0,
			index: d.profitTrades.length
		};
		d.profitTrades.push(newItem);

		return {
			...d,
			activeProfitableTrade: newItem
		};
	});
}

export async function addLosingTrade() {
	if (get(app_data).lossTrades.length >= MAX_TRADES) return;

	console.log('Add Losing Trade');

	app_data.update((d) => {
		const newLoss = {
			lossAmount: 0,
			lossVolume: 0,
			index: d.lossTrades.length
		};

		d.lossTrades.push(newLoss);

		return {
			...d,
			activeLosingTrade: newLoss
		};
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
