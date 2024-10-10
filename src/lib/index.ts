// place files you want to import through the `$lib` alias in this folder.
export type IAppData = {
	pipValue: number;
	volumeType: 'UNITS' | 'LOTS';
	activeProfitableTradeIndex: number;
	activeLosingTradeIndex: number;
	profitTrades: {
		keepPips: number;
		profitAmount: number;
		profitVolume: number;
	}[];
	lossTrades: {
		lossAmount: number;
		lossVolume: number;
	}[];
};

export type IClosedResults = {
	applyAmount: number;
	keepAmount: number;
	losingTradesToClose: { lossAmount: number; lossVolume: number; closeVolume: number }[];
	closePercentage: number;
};
