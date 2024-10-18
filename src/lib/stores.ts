import { type IClosedResults, type IAppData } from '$lib';
import { writable } from 'svelte/store';

export const app_data = writable<IAppData>();

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
