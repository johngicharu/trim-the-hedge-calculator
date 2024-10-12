import { app_data } from './stores';

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
	app_data.update((d) => {
		d.lossTrades.push({
			lossAmount: 0,
			lossVolume: 0,
			index: d.lossTrades.length
		});

		return {
			...d,
			activeLosingTrade: {
				lossAmount: 0,
				lossVolume: 0,
				index: d.lossTrades.length
			}
		};
	});
}

export function isNumber(val: any): boolean {
	return typeof val === 'number' && !Object.is(Number(val), NaN);
}
