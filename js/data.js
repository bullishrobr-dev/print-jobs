/**
 * data.js — LocalStorage persistence & default data for Quick Prints
 */

var QP_STORAGE_KEYS = {
  SHOP: 'qp2_shop',
  WORKERS: 'qp2_workers',
  EDITOR_STATE: 'qp2_editor_state',
  LANG: 'qp2_lang',
  VERSION: 'qp2_version'
};
var QP_DATA_VERSION = '2.4';

var QP_DEFAULT_SHOP = {
  name: '',
  tagline: '',
  logo: '',
  email: '',
  phone: '',
  whatsapp: '',
  website: '',
  locations: [],
  hours: ''
};

var QP_DEFAULT_WORKERS = [];

var _qpMemoryShop = null;
var _qpMemoryWorkers = null;
var _qpStorageOk = false;

try {
  localStorage.setItem('__qp_test__', '1');
  localStorage.removeItem('__qp_test__');
  _qpStorageOk = true;
} catch (e) {
  _qpStorageOk = false;
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

function _qpCheckVersion() {
  var v = _qpGetRaw(QP_STORAGE_KEYS.VERSION);
  if (v !== QP_DATA_VERSION) {
    _qpSetRaw(QP_STORAGE_KEYS.VERSION, QP_DATA_VERSION);
    qpResetToDefaults();
  }
}

function qpGetShop() {
  _qpCheckVersion();
  if (_qpMemoryShop) return JSON.parse(JSON.stringify(_qpMemoryShop));
  var raw = _qpGetRaw(QP_STORAGE_KEYS.SHOP);
  if (!raw) {
    _qpMemoryShop = JSON.parse(JSON.stringify(QP_DEFAULT_SHOP));
    return JSON.parse(JSON.stringify(_qpMemoryShop));
  }
  try {
    var parsed = JSON.parse(raw);
    var merged = Object.assign({}, QP_DEFAULT_SHOP, parsed);
    merged.locations = parsed.locations || [];
    // Backward compatibility: old format was {mon: '9-5', tue: '9-5', ...}
    if (parsed.hours && typeof parsed.hours === 'object' && !(parsed.hours instanceof Array)) {
      var hoursArr = [];
      var dayNames = {mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun'};
      for (var k in dayNames) {
        if (parsed.hours[k]) hoursArr.push(dayNames[k] + ': ' + parsed.hours[k]);
      }
      merged.hours = hoursArr.join(', ');
    } else {
      merged.hours = parsed.hours || '';
    }
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
  _qpCheckVersion();
  if (_qpMemoryWorkers) return JSON.parse(JSON.stringify(_qpMemoryWorkers));
  var raw = _qpGetRaw(QP_STORAGE_KEYS.WORKERS);
  if (!raw) {
    _qpMemoryWorkers = JSON.parse(JSON.stringify(QP_DEFAULT_WORKERS));
    return JSON.parse(JSON.stringify(_qpMemoryWorkers));
  }
  try {
    var parsed = JSON.parse(raw);
    var result = Array.isArray(parsed) ? parsed : [];
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
  var lang = qpGetLang();
  var all = JSON.parse(_qpGetRaw(QP_STORAGE_KEYS.EDITOR_STATE) || '{}');
  // Migrate old flat format if needed
  if (all[templateId] && !all.en && !all.es && !all.fr) {
    var old = JSON.parse(JSON.stringify(all));
    all = {};
    all[lang] = old;
  }
  if (!all[lang]) all[lang] = {};
  all[lang][templateId] = data;
  _qpSetRaw(QP_STORAGE_KEYS.EDITOR_STATE, JSON.stringify(all));
}

function qpGetEditorState(templateId) {
  var lang = qpGetLang();
  var all = JSON.parse(_qpGetRaw(QP_STORAGE_KEYS.EDITOR_STATE) || '{}');
  // Backward compat: old flat format (no language keys)
  if (all[templateId] && !all.en && !all.es && !all.fr) {
    return all[templateId] || null;
  }
  if (all[lang] && all[lang][templateId]) {
    return all[lang][templateId] || null;
  }
  return null;
}

function qpGetLang() {
  return _qpGetRaw(QP_STORAGE_KEYS.LANG) || 'en';
}

function qpSetLang(lang) {
  _qpSetRaw(QP_STORAGE_KEYS.LANG, lang);
}
