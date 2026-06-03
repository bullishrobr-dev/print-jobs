/**
 * app.js — Main application logic for Quick Prints
 */

/* ============================================
   STATE
   ============================================ */
var qpCurrentView = 'templates';
var qpCurrentTemplateId = null;
var qpCurrentEditorData = {};

/* ============================================
   DOM REFS
   ============================================ */
var qpViews = {
  templates: document.getElementById('view-templates'),
  editor: document.getElementById('view-editor'),
  settings: document.getElementById('view-settings')
};
var qpPageTitle = document.getElementById('page-title');
var qpPageSubtitle = document.getElementById('page-subtitle');
var qpNavLinks = document.querySelectorAll('.sidebar-nav a');

/* ============================================
   ROUTING
   ============================================ */
function qpSwitchView(viewName) {
  qpCurrentView = viewName;
  Object.keys(qpViews).forEach(function(key) {
    qpViews[key].classList.remove('active');
  });
  if (qpViews[viewName]) qpViews[viewName].classList.add('active');

  qpNavLinks.forEach(function(link) {
    link.classList.toggle('active', link.dataset.view === viewName);
  });

  if (viewName === 'templates') {
    qpPageTitle.textContent = 'Quick prints';
    qpPageSubtitle.textContent = 'Print business cards, vouchers, and skincare plans straight to the thermal printer.';
    qpPageSubtitle.style.display = '';
    qpRenderTemplatesGrid();
  } else if (viewName === 'editor') {
    qpPageTitle.textContent = 'Quick prints';
    qpPageSubtitle.style.display = 'none';
  } else if (viewName === 'settings') {
    qpPageTitle.textContent = 'Settings';
    qpPageSubtitle.textContent = 'Manage your shop details, workers, and locations.';
    qpPageSubtitle.style.display = '';
    qpRenderSettings();
  }
}

qpNavLinks.forEach(function(link) {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    qpSwitchView(link.dataset.view);
  });
});

/* ============================================
   TEMPLATES GRID
   ============================================ */
function qpRenderTemplatesGrid() {
  var grid = document.getElementById('templates-grid');
  if (!grid) return;
  grid.innerHTML = '';
  Object.keys(QP_TEMPLATES).forEach(function(key) {
    var tmpl = QP_TEMPLATES[key];
    var card = document.createElement('div');
    card.className = 'template-card';
    card.innerHTML = '<div class="icon">' + tmpl.icon + '</div><div><h3>' + qpEscapeHtml(tmpl.name) + '</h3><p>' + qpEscapeHtml(tmpl.description) + '</p></div>';
    card.addEventListener('click', function() {
      qpOpenEditor(tmpl.id);
    });
    grid.appendChild(card);
  });
}

/* ============================================
   EDITOR
   ============================================ */
function qpOpenEditor(templateId) {
  qpCurrentTemplateId = templateId;
  var tmpl = QP_TEMPLATES[templateId];
  if (!tmpl) return;

  var saved = qpGetEditorState(templateId);
  qpCurrentEditorData = saved ? Object.assign({}, qpGetTemplateDefaults(templateId), saved) : qpGetTemplateDefaults(templateId);

  var titleEl = document.getElementById('editor-form-title');
  if (titleEl) titleEl.textContent = tmpl.name;

  qpBuildEditorForm(tmpl);
  qpUpdatePreview();
  qpSwitchView('editor');
}

function qpBuildEditorForm(tmpl) {
  var container = document.getElementById('editor-form-body');
  if (!container) return;
  var workers = qpGetWorkers();

  // Toolbar
  var toolbar = document.createElement('div');
  toolbar.className = 'editor-toolbar';
  toolbar.innerHTML = '<button class="btn btn-secondary btn-sm" id="btn-back">&larr; Back to templates</button><button class="btn btn-secondary btn-sm" id="btn-reset">Reset fields</button><button class="btn btn-primary btn-sm" id="btn-print">&#128424; Print</button>';

  container.innerHTML = '';
  container.appendChild(toolbar);

  document.getElementById('btn-back').addEventListener('click', function() {
    qpSwitchView('templates');
  });
  document.getElementById('btn-reset').addEventListener('click', function() {
    qpCurrentEditorData = qpGetTemplateDefaults(qpCurrentTemplateId);
    qpBuildEditorForm(tmpl);
    qpUpdatePreview();
  });
  document.getElementById('btn-print').addEventListener('click', qpDoPrint);

  // Form fields
  tmpl.fields.forEach(function(field) {
    var group = document.createElement('div');
    group.className = 'form-group';

    if (field.type === 'checkbox') {
      group.innerHTML = '<label class="checkbox-row"><input type="checkbox" name="' + field.key + '"' + (qpCurrentEditorData[field.key] ? ' checked' : '') + '><span>' + qpEscapeHtml(field.label) + '</span></label>';
    } else if (field.type === 'worker') {
      var options = '<option value="">-- Select --</option>';
      workers.forEach(function(w) {
        options += '<option value="' + w.id + '"' + (qpCurrentEditorData[field.key] === w.id ? ' selected' : '') + '>' + qpEscapeHtml(w.name) + ' — ' + qpEscapeHtml(w.role) + '</option>';
      });
      group.innerHTML = '<label>' + qpEscapeHtml(field.label) + '</label><select name="' + field.key + '">' + options + '</select>';
    } else if (field.type === 'textarea') {
      group.innerHTML = '<label>' + qpEscapeHtml(field.label) + '</label><textarea name="' + field.key + '" rows="4">' + qpEscapeHtml(qpCurrentEditorData[field.key] || '') + '</textarea>';
    } else {
      group.innerHTML = '<label>' + qpEscapeHtml(field.label) + '</label><input type="' + field.type + '" name="' + field.key + '" value="' + qpEscapeHtml(qpCurrentEditorData[field.key] || '') + '">';
    }

    if (field.type === 'textarea' && (field.key === 'benefits' || field.key === 'steps')) {
      var hint = document.createElement('div');
      hint.className = 'hint';
      hint.textContent = 'Enter one item per line';
      group.appendChild(hint);
    }

    container.appendChild(group);
  });

  // Bind inputs
  container.querySelectorAll('input, select, textarea').forEach(function(el) {
    el.addEventListener('input', qpOnEditorInput);
    el.addEventListener('change', qpOnEditorInput);
  });
}

function qpOnEditorInput(e) {
  var el = e.target;
  var key = el.name;
  var tmpl = QP_TEMPLATES[qpCurrentTemplateId];
  if (!tmpl) return;
  var field = tmpl.fields.find(function(f) { return f.key === key; });
  if (!field) return;

  if (field.type === 'checkbox') {
    qpCurrentEditorData[key] = el.checked;
  } else if (field.type === 'number') {
    qpCurrentEditorData[key] = el.value === '' ? '' : Number(el.value);
  } else {
    qpCurrentEditorData[key] = el.value;
  }

  qpSaveEditorState(qpCurrentTemplateId, qpCurrentEditorData);
  qpUpdatePreview();
}

function qpUpdatePreview() {
  var tmpl = QP_TEMPLATES[qpCurrentTemplateId];
  if (!tmpl) return;

  var shop = qpGetShop();
  var data = qpBuildTemplateData(qpCurrentTemplateId, qpCurrentEditorData);
  var worker = data.workerId ? qpGetWorkerById(data.workerId) : null;

  var html = qpRenderTemplate(qpCurrentTemplateId, data, shop, worker);
  var previewEl = document.getElementById('receipt-preview');
  if (previewEl) previewEl.innerHTML = html;
}

function qpDoPrint() {
  window.print();
}

/* ============================================
   SETTINGS
   ============================================ */
var qpSettingsShop = null;
var qpSettingsWorkers = [];

function qpRenderSettings() {
  qpSettingsShop = qpGetShop();
  qpSettingsWorkers = qpGetWorkers();

  // Shop info
  var elName = document.getElementById('shop-name');
  var elEmail = document.getElementById('shop-email');
  var elPhone = document.getElementById('shop-phone');
  var elLogo = document.getElementById('shop-logo');
  if (elName) elName.value = qpSettingsShop.name;
  if (elEmail) elEmail.value = qpSettingsShop.email;
  if (elPhone) elPhone.value = qpSettingsShop.phone;
  if (elLogo) elLogo.value = qpSettingsShop.logo;

  ['name', 'email', 'phone', 'logo'].forEach(function(key) {
    var el = document.getElementById('shop-' + key);
    if (el) {
      el.oninput = function(e) {
        qpSettingsShop[key] = e.target.value;
        qpSetShop(qpSettingsShop);
      };
    }
  });

  qpRenderLocations();
  qpRenderHours();
  qpRenderWorkersList();

  var btnAddLoc = document.getElementById('btn-add-location');
  var btnAddWorker = document.getElementById('btn-add-worker');
  var btnReset = document.getElementById('btn-reset-all');
  if (btnAddLoc) btnAddLoc.onclick = qpAddLocationRow;
  if (btnAddWorker) btnAddWorker.onclick = function() { qpShowWorkerForm(); };
  if (btnReset) btnReset.onclick = function() {
    if (confirm('Are you sure? This will erase all shop data and workers.')) {
      qpResetToDefaults();
      qpRenderSettings();
    }
  };
}

/* --- Locations --- */
function qpRenderLocations() {
  var container = document.getElementById('locations-list');
  if (!container) return;
  container.innerHTML = '';
  qpSettingsShop.locations.forEach(function(loc, idx) {
    var row = document.createElement('div');
    row.className = 'location-row';
    row.innerHTML = '<div class="form-group"><label>Name</label><input type="text" data-idx="' + idx + '" data-field="name" value="' + qpEscapeHtml(loc.name) + '"></div><div class="form-group"><label>Address</label><input type="text" data-idx="' + idx + '" data-field="address" value="' + qpEscapeHtml(loc.address) + '"></div><button class="btn btn-danger btn-sm" data-remove-idx="' + idx + '">&times;</button>';
    container.appendChild(row);
  });

  container.querySelectorAll('input').forEach(function(input) {
    input.oninput = function(e) {
      var idx = Number(e.target.dataset.idx);
      var field = e.target.dataset.field;
      qpSettingsShop.locations[idx][field] = e.target.value;
      qpSetShop(qpSettingsShop);
    };
  });

  container.querySelectorAll('[data-remove-idx]').forEach(function(btn) {
    btn.onclick = function() {
      var idx = Number(btn.dataset.removeIdx);
      qpSettingsShop.locations.splice(idx, 1);
      qpSetShop(qpSettingsShop);
      qpRenderLocations();
    };
  });
}

function qpAddLocationRow() {
  qpSettingsShop.locations.push({ id: 'loc' + Date.now(), name: '', address: '' });
  qpSetShop(qpSettingsShop);
  qpRenderLocations();
}

/* --- Hours --- */
function qpRenderHours() {
  var container = document.getElementById('hours-grid');
  if (!container) return;
  var days = [
    { key: 'mon', label: 'Monday' },
    { key: 'tue', label: 'Tuesday' },
    { key: 'wed', label: 'Wednesday' },
    { key: 'thu', label: 'Thursday' },
    { key: 'fri', label: 'Friday' },
    { key: 'sat', label: 'Saturday' },
    { key: 'sun', label: 'Sunday' }
  ];
  container.innerHTML = '';
  days.forEach(function(d) {
    var label = document.createElement('label');
    label.textContent = d.label;
    var input = document.createElement('input');
    input.type = 'text';
    input.value = qpSettingsShop.hours[d.key] || '';
    input.placeholder = '09:00 - 18:00';
    input.oninput = function(e) {
      qpSettingsShop.hours[d.key] = e.target.value;
      qpSetShop(qpSettingsShop);
    };
    container.appendChild(label);
    container.appendChild(input);
  });
}

/* --- Workers --- */
function qpRenderWorkersList() {
  var container = document.getElementById('workers-list');
  if (!container) return;
  container.innerHTML = '';
  qpSettingsWorkers.forEach(function(w) {
    var card = document.createElement('div');
    card.className = 'worker-card';
    card.innerHTML = '<div class="worker-card-info"><h4>' + qpEscapeHtml(w.name) + '</h4><p>' + qpEscapeHtml(w.role) + ' &middot; ' + qpEscapeHtml(w.phone) + ' &middot; ' + qpEscapeHtml(w.email) + '</p></div><div class="worker-card-actions"><button class="btn btn-sm btn-secondary" data-edit="' + w.id + '">Edit</button><button class="btn btn-sm btn-danger" data-remove="' + w.id + '">Remove</button></div>';
    container.appendChild(card);
  });

  container.querySelectorAll('[data-edit]').forEach(function(btn) {
    btn.onclick = function() {
      qpShowWorkerForm(btn.dataset.edit);
    };
  });
  container.querySelectorAll('[data-remove]').forEach(function(btn) {
    btn.onclick = function() {
      if (confirm('Remove this worker?')) {
        qpRemoveWorker(btn.dataset.remove);
        qpRenderWorkersList();
      }
    };
  });
}

function qpShowWorkerForm(workerId) {
  var worker = workerId ? qpGetWorkers().find(function(w) { return w.id === workerId; }) : null;
  var name = worker ? worker.name : '';
  var role = worker ? worker.role : '';
  var phone = worker ? worker.phone : '';
  var email = worker ? worker.email : '';

  var container = document.getElementById('workers-list');
  if (!container) return;
  var existing = container.querySelector('.settings-section');
  if (existing) existing.remove();

  var section = document.createElement('div');
  section.className = 'settings-section';
  section.style.marginTop = '10px';
  section.innerHTML = '<div class="settings-section-header">' + (worker ? 'Edit' : 'Add') + ' Worker</div><div class="settings-section-body"><div class="settings-grid"><div class="form-group"><label>Name</label><input type="text" id="w-name" value="' + qpEscapeHtml(name) + '"></div><div class="form-group"><label>Role</label><input type="text" id="w-role" value="' + qpEscapeHtml(role) + '"></div><div class="form-group"><label>Phone</label><input type="text" id="w-phone" value="' + qpEscapeHtml(phone) + '"></div><div class="form-group"><label>Email</label><input type="text" id="w-email" value="' + qpEscapeHtml(email) + '"></div></div><div style="margin-top:14px; display:flex; gap:8px;"><button class="btn btn-primary btn-sm" id="w-save">Save</button><button class="btn btn-secondary btn-sm" id="w-cancel">Cancel</button></div></div>';
  container.prepend(section);

  document.getElementById('w-save').onclick = function() {
    var data = {
      name: document.getElementById('w-name').value.trim(),
      role: document.getElementById('w-role').value.trim(),
      phone: document.getElementById('w-phone').value.trim(),
      email: document.getElementById('w-email').value.trim()
    };
    if (!data.name) { alert('Name is required'); return; }
    if (worker) {
      qpUpdateWorker(worker.id, data);
    } else {
      qpAddWorker(data);
    }
    qpRenderWorkersList();
  };
  document.getElementById('w-cancel').onclick = function() {
    var sec = container.querySelector('.settings-section');
    if (sec) sec.remove();
  };
}

/* ============================================
   UTILS
   ============================================ */
function qpEscapeHtml(text) {
  if (text == null) return '';
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* ============================================
   INIT
   ============================================ */
function qpInit() {
  try {
    qpRenderTemplatesGrid();
    console.log('Quick Prints initialized successfully');
  } catch (err) {
    console.error('Quick Prints init error:', err);
    var grid = document.getElementById('templates-grid');
    if (grid) grid.innerHTML = '<p style="padding:20px;color:#c00;">Error loading app. Check console.</p>';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', qpInit);
} else {
  qpInit();
}
