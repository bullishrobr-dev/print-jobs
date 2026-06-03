/**
 * app.js — Main application logic for Quick Prints v2
 */

var qpCurrentView = 'templates';
var qpCurrentTemplateId = null;
var qpCurrentEditorData = {};
var qpCustomTemplates = [];

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
    qpPageTitle.textContent = qpT('appName');
    qpPageSubtitle.textContent = qpT('appTagline');
    qpPageSubtitle.style.display = '';
    qpRenderTemplatesGrid();
  } else if (viewName === 'editor') {
    qpPageTitle.textContent = qpT('appName');
    qpPageSubtitle.style.display = 'none';
  } else if (viewName === 'settings') {
    qpPageTitle.textContent = qpT('settings');
    qpPageSubtitle.textContent = qpT('settingsTagline');
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
   LANGUAGE SWITCHER
   ============================================ */
function qpRenderLangSwitcher() {
  var container = document.getElementById('lang-switcher');
  if (!container) return;
  var langs = [{ code: 'en', label: 'EN' }, { code: 'es', label: 'ES' }, { code: 'fr', label: 'FR' }];
  var current = qpGetLang();
  container.innerHTML = '';
  langs.forEach(function(l) {
    var btn = document.createElement('button');
    btn.className = 'lang-btn' + (l.code === current ? ' active' : '');
    btn.textContent = l.label;
    btn.onclick = function() {
      qpSetLang(l.code);
      location.reload();
    };
    container.appendChild(btn);
  });
}

/* ============================================
   TEMPLATES GRID
   ============================================ */
function qpRenderTemplatesGrid() {
  var grid = document.getElementById('templates-grid');
  if (!grid) return;
  grid.innerHTML = '';

  // Built-in templates
  Object.keys(QP_TEMPLATES).forEach(function(key) {
    var tmpl = QP_TEMPLATES[key];
    var card = document.createElement('div');
    card.className = 'template-card';
    card.innerHTML = '<div class="icon">' + tmpl.icon + '</div><div><h3>' + qpEscapeHtml(qpT(tmpl.nameKey)) + '</h3><p>' + qpEscapeHtml(qpT(tmpl.descKey)) + '</p></div>';
    card.addEventListener('click', function() { qpOpenEditor(tmpl.id); });
    grid.appendChild(card);
  });

  // Custom templates
  qpCustomTemplates.forEach(function(ct) {
    var card = document.createElement('div');
    card.className = 'template-card';
    card.innerHTML = '<div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></div><div><h3>' + qpEscapeHtml(ct.name) + '</h3><p>' + qpT('customTemplateDesc') + '</p></div>';
    card.addEventListener('click', function() { qpOpenCustomEditor(ct.id); });
    grid.appendChild(card);
  });

  // Add Custom Template card
  var addCard = document.createElement('div');
  addCard.className = 'template-card';
  addCard.style.borderStyle = 'dashed';
  addCard.style.borderColor = '#cbd5e1';
  addCard.innerHTML = '<div class="icon" style="background:#f1f5f9;color:#64748b;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></div><div><h3>' + qpEscapeHtml(qpT('customTemplate')) + '</h3><p>' + qpEscapeHtml(qpT('customTemplateDesc')) + '</p></div>';
  addCard.addEventListener('click', qpShowCustomBuilder);
  grid.appendChild(addCard);
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
  if (titleEl) titleEl.textContent = qpT(tmpl.nameKey);
  qpBuildEditorForm(tmpl);
  qpUpdatePreview();
  qpSwitchView('editor');
}

function qpOpenCustomEditor(templateId) {
  var ct = qpCustomTemplates.find(function(c) { return c.id === templateId; });
  if (!ct) return;
  qpCurrentTemplateId = 'custom_' + templateId;
  qpCurrentEditorData = { content: ct.content || '' };
  var titleEl = document.getElementById('editor-form-title');
  if (titleEl) titleEl.textContent = ct.name;
  qpBuildCustomEditorForm(ct);
  qpUpdateCustomPreview();
  qpSwitchView('editor');
}

function qpBuildEditorForm(tmpl) {
  var container = document.getElementById('editor-form-body');
  if (!container) return;
  var workers = qpGetWorkers();
  container.innerHTML = '';

  var toolbar = document.createElement('div');
  toolbar.className = 'editor-toolbar';
  toolbar.innerHTML = '<button class="btn btn-secondary btn-sm" id="btn-back">&larr; ' + qpT('backToTemplates') + '</button><button class="btn btn-secondary btn-sm" id="btn-reset">' + qpT('resetFields') + '</button><button class="btn btn-primary btn-sm" id="btn-print">' + qpT('print') + '</button>';
  container.appendChild(toolbar);

  document.getElementById('btn-back').addEventListener('click', function() { qpSwitchView('templates'); });
  document.getElementById('btn-reset').addEventListener('click', function() {
    qpCurrentEditorData = qpGetTemplateDefaults(qpCurrentTemplateId);
    qpBuildEditorForm(tmpl);
    qpUpdatePreview();
  });
  document.getElementById('btn-print').addEventListener('click', qpDoPrint);

  tmpl.fields.forEach(function(field) {
    var group = document.createElement('div');
    group.className = 'form-group';
    var label = qpT(field.labelKey) || field.labelKey;

    if (field.type === 'checkbox') {
      group.innerHTML = '<label class="checkbox-row"><input type="checkbox" name="' + field.key + '"' + (qpCurrentEditorData[field.key] ? ' checked' : '') + '><span>' + qpEscapeHtml(label) + '</span></label>';
    } else if (field.type === 'worker') {
      var options = '<option value="">-- ' + qpT('specialist') + ' --</option>';
      workers.forEach(function(w) {
        options += '<option value="' + w.id + '"' + (qpCurrentEditorData[field.key] === w.id ? ' selected' : '') + '>' + qpEscapeHtml(w.name) + ' &mdash; ' + qpEscapeHtml(w.role) + '</option>';
      });
      group.innerHTML = '<label>' + qpEscapeHtml(label) + '</label><select name="' + field.key + '">' + options + '</select>';
    } else if (field.type === 'textarea') {
      group.innerHTML = '<label>' + qpEscapeHtml(label) + '</label><textarea name="' + field.key + '" rows="4">' + qpEscapeHtml(qpCurrentEditorData[field.key] || '') + '</textarea>';
    } else {
      group.innerHTML = '<label>' + qpEscapeHtml(label) + '</label><input type="' + field.type + '" name="' + field.key + '" value="' + qpEscapeHtml(qpCurrentEditorData[field.key] || '') + '">';
    }

    if (field.type === 'textarea' && (field.key === 'benefits' || field.key === 'steps')) {
      var hint = document.createElement('div');
      hint.className = 'hint';
      hint.textContent = qpT('onePerLine');
      group.appendChild(hint);
    }
    container.appendChild(group);
  });

  container.querySelectorAll('input, select, textarea').forEach(function(el) {
    el.addEventListener('input', qpOnEditorInput);
    el.addEventListener('change', qpOnEditorInput);
  });
}

function qpBuildCustomEditorForm(ct) {
  var container = document.getElementById('editor-form-body');
  if (!container) return;
  container.innerHTML = '';

  var toolbar = document.createElement('div');
  toolbar.className = 'editor-toolbar';
  toolbar.innerHTML = '<button class="btn btn-secondary btn-sm" id="btn-back">&larr; ' + qpT('backToTemplates') + '</button><button class="btn btn-primary btn-sm" id="btn-print">' + qpT('print') + '</button>';
  container.appendChild(toolbar);

  document.getElementById('btn-back').addEventListener('click', function() { qpSwitchView('templates'); });
  document.getElementById('btn-print').addEventListener('click', qpDoPrint);

  var group = document.createElement('div');
  group.className = 'form-group';
  group.innerHTML = '<label>' + qpT('customTemplateContent') + '</label><textarea name="custom_content" rows="12">' + qpEscapeHtml(qpCurrentEditorData.content || '') + '</textarea><div class="hint">' + qpT('customTemplateHint') + '</div>';
  container.appendChild(group);

  container.querySelector('textarea').addEventListener('input', function(e) {
    qpCurrentEditorData.content = e.target.value;
    qpUpdateCustomPreview();
  });
}

function qpOnEditorInput(e) {
  var el = e.target;
  var key = el.name;
  var tmpl = QP_TEMPLATES[qpCurrentTemplateId];
  if (!tmpl) return;
  var field = tmpl.fields.find(function(f) { return f.key === key; });
  if (!field) return;
  if (field.type === 'checkbox') qpCurrentEditorData[key] = el.checked;
  else if (field.type === 'number') qpCurrentEditorData[key] = el.value === '' ? '' : Number(el.value);
  else qpCurrentEditorData[key] = el.value;
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

function qpUpdateCustomPreview() {
  var shop = qpGetShop();
  var worker = null;
  var html = qpRenderCustomTemplate(qpCurrentEditorData, shop, worker);
  var previewEl = document.getElementById('receipt-preview');
  if (previewEl) previewEl.innerHTML = html;
}

function qpDoPrint() {
  var previewEl = document.getElementById('receipt-preview');
  if (!previewEl) return;
  var receiptHtml = previewEl.innerHTML;

  var iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '1px';
  iframe.style.height = '1px';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  var doc = iframe.contentWindow.document;
  doc.open();
  doc.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Print</title><style>');
  doc.write('body{margin:0;padding:0;background:#fff;font-family:\'Courier New\',Courier,monospace;font-size:10.5px;line-height:1.5;color:#000;text-align:center;}');
  doc.write('.receipt{width:80mm;min-height:60px;background:#fff;padding:4mm 3mm;margin:0 auto;box-sizing:border-box;}');
  doc.write('.receipt-logo{margin-bottom:6px;}');
  doc.write('.receipt-logo img{max-width:55mm;max-height:16mm;}');
  doc.write('.receipt-logo-text{font-size:15px;font-weight:bold;letter-spacing:1px;margin-bottom:6px;}');
  doc.write('.receipt-divider{border-top:1px solid #000;margin:6px 0;}');
  doc.write('.receipt-divider.dotted{border-top-style:dashed;}');
  doc.write('.receipt-headline{font-size:11px;font-weight:bold;letter-spacing:0.5px;margin:3px 0;}');
  doc.write('.receipt-big{font-size:13px;font-weight:bold;margin:4px 0;}');
  doc.write('.receipt-line{margin:2px 0;}');
  doc.write('.receipt-paragraph{text-align:left;margin:4px 0;}');
  doc.write('.receipt-paragraph.receipt-small{font-size:9.5px;}');
  doc.write('.receipt-paragraph.receipt-center{text-align:center;}');
  doc.write('.receipt-label{font-weight:bold;font-size:9.5px;margin-top:4px;text-transform:uppercase;}');
  doc.write('.receipt-cta{font-weight:bold;font-size:9.5px;}');
  doc.write('.receipt-list{text-align:left;margin:4px 0 4px 14px;padding:0;}');
  doc.write('.receipt-list li{margin:1px 0;}');
  doc.write('.receipt-section{margin:6px 0;text-align:left;}');
  doc.write('.receipt-hours-row{display:flex;justify-content:space-between;font-size:9.5px;padding:1px 0;}');
  doc.write('.receipt-error{color:#c00;font-weight:bold;}');
  doc.write('</style></head><body>');
  doc.write('<div class="receipt">' + receiptHtml + '</div>');
  doc.write('</body></html>');
  doc.close();

  iframe.onload = function() {
    setTimeout(function() {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(function() {
        document.body.removeChild(iframe);
      }, 1000);
    }, 200);
  };
  // Trigger onload manually for some browsers
  if (doc.readyState === 'complete') {
    iframe.onload();
  }
}

/* ============================================
   CUSTOM TEMPLATE BUILDER
   ============================================ */
function qpShowCustomBuilder() {
  qpSwitchView('editor');
  var container = document.getElementById('editor-form-body');
  if (!container) return;
  container.innerHTML = '';

  var titleEl = document.getElementById('editor-form-title');
  if (titleEl) titleEl.textContent = qpT('customTemplateBuilder');

  var toolbar = document.createElement('div');
  toolbar.className = 'editor-toolbar';
  toolbar.innerHTML = '<button class="btn btn-secondary btn-sm" id="btn-back">&larr; ' + qpT('backToTemplates') + '</button>';
  container.appendChild(toolbar);
  document.getElementById('btn-back').addEventListener('click', function() { qpSwitchView('templates'); });

  var nameGroup = document.createElement('div');
  nameGroup.className = 'form-group';
  nameGroup.innerHTML = '<label>' + qpT('customTemplateName') + '</label><input type="text" id="ct-name">';
  container.appendChild(nameGroup);

  var contentGroup = document.createElement('div');
  contentGroup.className = 'form-group';
  contentGroup.innerHTML = '<label>' + qpT('customTemplateContent') + '</label><textarea id="ct-content" rows="10"></textarea><div class="hint">' + qpT('customTemplateHint') + '</div>';
  container.appendChild(contentGroup);

  var btn = document.createElement('button');
  btn.className = 'btn btn-success';
  btn.textContent = qpT('create');
  btn.onclick = function() {
    var name = document.getElementById('ct-name').value.trim();
    var content = document.getElementById('ct-content').value;
    if (!name) { alert('Name required'); return; }
    qpCustomTemplates.push({ id: 'ct' + Date.now(), name: name, content: content });
    qpSwitchView('templates');
  };
  container.appendChild(btn);

  document.getElementById('receipt-preview').innerHTML = '<div class="receipt-preview" style="display:flex;align-items:center;justify-content:center;color:#999;">' + qpT('preview') + '</div>';
}

/* ============================================
   SETTINGS
   ============================================ */
var qpSettingsShop = null;
var qpSettingsWorkers = [];

function qpRenderSettings() {
  qpSettingsShop = qpGetShop();
  qpSettingsWorkers = qpGetWorkers();

  document.getElementById('shop-name').value = qpSettingsShop.name;
  document.getElementById('shop-email').value = qpSettingsShop.email;
  document.getElementById('shop-phone').value = qpSettingsShop.phone;
  document.getElementById('shop-whatsapp').value = qpSettingsShop.whatsapp;

  var logoPreview = document.getElementById('logo-preview');
  if (logoPreview) {
    if (qpSettingsShop.logo) {
      logoPreview.src = qpSettingsShop.logo;
      logoPreview.style.display = 'block';
    } else {
      logoPreview.style.display = 'none';
    }
  }

  ['name', 'email', 'phone', 'whatsapp'].forEach(function(key) {
    var el = document.getElementById('shop-' + key);
    if (el) {
      el.oninput = function(e) {
        qpSettingsShop[key] = e.target.value;
        qpSetShop(qpSettingsShop);
      };
    }
  });

  var logoInput = document.getElementById('shop-logo-file');
  if (logoInput) {
    logoInput.onchange = function(e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        qpSettingsShop.logo = ev.target.result;
        qpSetShop(qpSettingsShop);
        var preview = document.getElementById('logo-preview');
        if (preview) {
          preview.src = ev.target.result;
          preview.style.display = 'block';
        }
      };
      reader.readAsDataURL(file);
    };
  }
  // Clear logo button
  var clearLogo = document.getElementById('btn-clear-logo');
  if (clearLogo) {
    clearLogo.onclick = function() {
      qpSettingsShop.logo = '';
      qpSetShop(qpSettingsShop);
      var preview = document.getElementById('logo-preview');
      if (preview) preview.style.display = 'none';
      if (logoInput) logoInput.value = '';
    };
  }

  qpRenderLocations();
  qpRenderHours();
  qpRenderWorkersList();

  var btnAddLoc = document.getElementById('btn-add-location');
  var btnAddWorker = document.getElementById('btn-add-worker');
  var btnReset = document.getElementById('btn-reset-all');
  if (btnAddLoc) btnAddLoc.onclick = qpAddLocationRow;
  if (btnAddWorker) btnAddWorker.onclick = function() { qpShowWorkerForm(); };
  if (btnReset) btnReset.onclick = function() {
    if (confirm('Are you sure?')) {
      qpResetToDefaults();
      qpRenderSettings();
    }
  };
}

function qpRenderLocations() {
  var container = document.getElementById('locations-list');
  if (!container) return;
  container.innerHTML = '';
  if (!qpSettingsShop.locations.length) {
    container.innerHTML = '<div class="empty-state">' + qpT('add') + ' ' + qpT('locations').toLowerCase() + '</div>';
    return;
  }
  qpSettingsShop.locations.forEach(function(loc, idx) {
    var row = document.createElement('div');
    row.className = 'location-row';
    row.innerHTML = '<div class="form-group"><label>' + qpT('name') + '</label><input type="text" data-idx="' + idx + '" data-field="name" value="' + qpEscapeHtml(loc.name) + '"></div><div class="form-group"><label>' + qpT('address') + '</label><input type="text" data-idx="' + idx + '" data-field="address" value="' + qpEscapeHtml(loc.address) + '"></div><button class="btn btn-danger btn-sm" data-remove-idx="' + idx + '">&times;</button>';
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

function qpRenderHours() {
  var container = document.getElementById('hours-grid');
  if (!container) return;
  var days = [
    { key: 'mon', label: qpT('mon') },
    { key: 'tue', label: qpT('tue') },
    { key: 'wed', label: qpT('wed') },
    { key: 'thu', label: qpT('thu') },
    { key: 'fri', label: qpT('fri') },
    { key: 'sat', label: qpT('sat') },
    { key: 'sun', label: qpT('sun') }
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

function qpRenderWorkersList() {
  var container = document.getElementById('workers-list');
  if (!container) return;
  container.innerHTML = '';
  if (!qpSettingsWorkers.length) {
    container.innerHTML = '<div class="empty-state">' + qpT('addWorker') + '</div>';
    return;
  }
  qpSettingsWorkers.forEach(function(w) {
    var card = document.createElement('div');
    card.className = 'worker-card';
    var contact = [];
    if (w.phone) contact.push(w.phone);
    if (w.whatsapp) contact.push('WA: ' + w.whatsapp);
    if (w.email) contact.push(w.email);
    card.innerHTML = '<div class="worker-card-info"><h4>' + qpEscapeHtml(w.name) + '</h4><p>' + qpEscapeHtml(w.role) + (contact.length ? ' &middot; ' + qpEscapeHtml(contact.join(' &middot; ')) : '') + '</p></div><div class="worker-card-actions"><button class="btn btn-sm btn-secondary" data-edit="' + w.id + '">' + qpT('edit') + '</button><button class="btn btn-sm btn-danger" data-remove="' + w.id + '">' + qpT('remove') + '</button></div>';
    container.appendChild(card);
  });
  container.querySelectorAll('[data-edit]').forEach(function(btn) {
    btn.onclick = function() { qpShowWorkerForm(btn.dataset.edit); };
  });
  container.querySelectorAll('[data-remove]').forEach(function(btn) {
    btn.onclick = function() {
      if (confirm('Remove?')) {
        qpRemoveWorker(btn.dataset.remove);
        qpRenderWorkersList();
      }
    };
  });
}

function qpShowWorkerForm(workerId) {
  var worker = workerId ? qpGetWorkers().find(function(w) { return w.id === workerId; }) : null;
  var container = document.getElementById('workers-list');
  if (!container) return;
  var existing = container.querySelector('.settings-section');
  if (existing) existing.remove();

  var section = document.createElement('div');
  section.className = 'settings-section';
  section.style.marginTop = '10px';
  section.innerHTML = '<div class="settings-section-header">' + (worker ? qpT('edit') : qpT('addWorker')) + '</div><div class="settings-section-body"><div class="settings-grid"><div class="form-group"><label>' + qpT('name') + '</label><input type="text" id="w-name" value="' + qpEscapeHtml(worker ? worker.name : '') + '"></div><div class="form-group"><label>' + qpT('role') + '</label><input type="text" id="w-role" value="' + qpEscapeHtml(worker ? worker.role : '') + '"></div><div class="form-group"><label>' + qpT('phone') + '</label><input type="text" id="w-phone" value="' + qpEscapeHtml(worker ? worker.phone : '') + '"></div><div class="form-group"><label>' + qpT('whatsapp') + '</label><input type="text" id="w-whatsapp" value="' + qpEscapeHtml(worker ? worker.whatsapp : '') + '"></div><div class="form-group"><label>' + qpT('email') + '</label><input type="text" id="w-email" value="' + qpEscapeHtml(worker ? worker.email : '') + '"></div></div><div style="margin-top:14px; display:flex; gap:8px;"><button class="btn btn-primary btn-sm" id="w-save">' + qpT('save') + '</button><button class="btn btn-secondary btn-sm" id="w-cancel">' + qpT('cancel') + '</button></div></div>';
  container.prepend(section);

  document.getElementById('w-save').onclick = function() {
    var data = {
      name: document.getElementById('w-name').value.trim(),
      role: document.getElementById('w-role').value.trim(),
      phone: document.getElementById('w-phone').value.trim(),
      whatsapp: document.getElementById('w-whatsapp').value.trim(),
      email: document.getElementById('w-email').value.trim()
    };
    if (!data.name) { alert(qpT('name') + ' required'); return; }
    if (worker) qpUpdateWorker(worker.id, data);
    else qpAddWorker(data);
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
    qpRenderLangSwitcher();
    qpRenderTemplatesGrid();
    console.log('Quick Prints initialized');
  } catch (err) {
    console.error('Init error:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', qpInit);
} else {
  qpInit();
}
