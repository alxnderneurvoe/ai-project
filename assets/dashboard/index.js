import { DashboardApi } from './api.js';
import { DeviceStore } from './store.js';
import { DashboardUI } from './ui.js';

const api = new DashboardApi('api');
const store = new DeviceStore();
const currentRole = window.CURRENT_USER_ROLE || 'viewer';

const dashboard = new DashboardUI({ api, store, currentRole });
window.dashboard = dashboard;
dashboard.init();
