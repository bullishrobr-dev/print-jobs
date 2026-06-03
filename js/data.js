/**
 * data.js — LocalStorage persistence & default data for Quick Prints
 */

var QP_STORAGE_KEYS = {
  SHOP: 'qp_shop',
  WORKERS: 'qp_workers',
  EDITOR_STATE: 'qp_editor_state'
};

var QP_DEFAULT_SHOP = {
  name: 'Zero Lines',
  logo: '',
  email: 'info@zerolines.life',
  phone: '+35054005198',
  whatsapp: '+35054005198',
  locations: [
    { id: 'loc1', name: '247 Main St', address: '247 Main street GX11 1AA Gibraltar' },
    { id: 'loc2', name: '61 Main St', address: '61 Main street GX11 1AA Gibraltar' }
  ],
  hours: {
    mon: '09:00 - 18:00',
    tue: '09:00 - 18:00',
    wed: '09:00 - 18:00',
    thu: '09:00 - 18:00',
    fri: '09:00 - 18:00',
    sat: '10:00 - 17:00',
    sun: 'Closed'
  }
};

var QP_DEFAULT_WORKERS = [
  { id: 'w1', name: 'Rob', role: 'Skincare Specialist', phone: '+35054005198', email: 'info@zerolines.life' }
];

var _qpMemoryShop = null;
var _qpMemoryWorkers = null;
var _qpStorageOk = false;

try {
  localStorage.setItem('__qp_test__', '1');
  localStorage.removeItem('__qp_test__');
  _qpStorageOk = true;
} catch (e) {
  _qpStorageOk = false;
  console.warn('localStorage not available — using in-memory storage');
}

function _qpGetRaw(key) {
  if (_qpStorageOk) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  return null;
}

function _qpSetRaw(key, value) {
  if (_qpStorageOk) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }
}

function _qpRemoveRaw(key) {
  if (_qpStorageOk) {
    try { localStorage.removeItem(key); } catch (e) {}
  }
}

function qpGetShop() {
  if (_qpMemoryShop) return JSON.parse(JSON.stringify(_qpMemoryShop));
  var raw = _qpGetRaw(QP_STORAGE_KEYS.SHOP);
  if (!raw) {
    _qpSetRaw(QP_STORAGE_KEYS.SHOP, JSON.stringify(QP_DEFAULT_SHOP));
    _qpMemoryShop = JSON.parse(JSON.stringify(QP_DEFAULT_SHOP));
    return _qpMemoryShop;
  }
  try {
    var parsed = JSON.parse(raw);
    var merged = Object.assign({}, QP_DEFAULT_SHOP, parsed);
    merged.locations = parsed.locations || QP_DEFAULT_SHOP.locations;
    merged.hours = parsed.hours || QP_DEFAULT_SHOP.hours;
    _qpMemoryShop = merged;
    return JSON.parse(JSON.stringify(merged));
  } catch {
    _qpMemoryShop = JSON.parse(JSON.stringify(QP_DEFAULT_SHOP));
    return _qpMemoryShop;
  }
}

function qpSetShop(shop) {
  _qpMemoryShop = JSON.parse(JSON.stringify(shop));
  _qpSetRaw(QP_STORAGE_KEYS.SHOP, JSON.stringify(shop));
}

function qpGetWorkers() {
  if (_qpMemoryWorkers) return JSON.parse(JSON.stringify(_qpMemoryWorkers));
  var raw = _qpGetRaw(QP_STORAGE_KEYS.WORKERS);
  if (!raw) {
    _qpSetRaw(QP_STORAGE_KEYS.WORKERS, JSON.stringify(QP_DEFAULT_WORKERS));
    _qpMemoryWorkers = JSON.parse(JSON.stringify(QP_DEFAULT_WORKERS));
    return _qpMemoryWorkers;
  }
  try {
    var parsed = JSON.parse(raw);
    var result = Array.isArray(parsed) ? parsed : JSON.parse(JSON.stringify(QP_DEFAULT_WORKERS));
    _qpMemoryWorkers = result;
    return JSON.parse(JSON.stringify(result));
  } catch {
    _qpMemoryWorkers = JSON.parse(JSON.stringify(QP_DEFAULT_WORKERS));
    return _qpMemoryWorkers;
  }
}

function qpSetWorkers(workers) {
  _qpMemoryWorkers = JSON.parse(JSON.stringify(workers));
  _qpSetRaw(QP_STORAGE_KEYS.WORKERS, JSON.stringify(workers));
}

function qpAddWorker(worker) {
  var workers = qpGetWorkers();
  worker.id = 'w' + Date.now();
  workers.push(worker);
  qpSetWorkers(workers);
  return worker;
}

function qpUpdateWorker(id, updates) {
  var workers = qpGetWorkers();
  var idx = workers.findIndex(function(w) { return w.id === id; });
  if (idx !== -1) {
    workers[idx] = Object.assign({}, workers[idx], updates);
    qpSetWorkers(workers);
  }
}

function qpRemoveWorker(id) {
  var workers = qpGetWorkers().filter(function(w) { return w.id !== id; });
  qpSetWorkers(workers);
}

function qpGetWorkerById(id) {
  return qpGetWorkers().find(function(w) { return w.id === id; }) || null;
}

function qpResetToDefaults() {
  _qpMemoryShop = null;
  _qpMemoryWorkers = null;
  _qpSetRaw(QP_STORAGE_KEYS.SHOP, JSON.stringify(QP_DEFAULT_SHOP));
  _qpSetRaw(QP_STORAGE_KEYS.WORKERS, JSON.stringify(QP_DEFAULT_WORKERS));
  _qpRemoveRaw(QP_STORAGE_KEYS.EDITOR_STATE);
}

function qpSaveEditorState(templateId, data) {
  var all = JSON.parse(_qpGetRaw(QP_STORAGE_KEYS.EDITOR_STATE) || '{}');
  all[templateId] = data;
  _qpSetRaw(QP_STORAGE_KEYS.EDITOR_STATE, JSON.stringify(all));
}

function qpGetEditorState(templateId) {
  var all = JSON.parse(_qpGetRaw(QP_STORAGE_KEYS.EDITOR_STATE) || '{}');
  return all[templateId] || null;
}
