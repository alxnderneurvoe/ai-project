import { HistoryApi } from './api.js';
import { HistoryStore } from './store.js';
import { HistoryUI } from './ui.js';

const api = new HistoryApi('api');
const store = new HistoryStore();
const historyApp = new HistoryUI({ api, store });

window.historyApp = historyApp;
historyApp.init();
