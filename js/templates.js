/**
 * templates.js — Template schemas, defaults, render functions
 */

function qpFormatDateDMY(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  var day = String(d.getDate()).padStart(2, '0');
  var month = String(d.getMonth() + 1).padStart(2, '0');
  var year = String(d.getFullYear()).slice(-2);
  return day + '.' + month + '.' + year;
}

function qpEscapeHtml(text) {
  if (text == null) return '';
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function qpNl2br(text) {
  return qpEscapeHtml(text).replace(/\n/g, '<br>');
}

function qpBenefitsToHtml(text) {
  if (!text) return '';
  var lines = text.split('\n').filter(function(l) { return l.trim(); });
  if (!lines.length) return '';
  return '<ul class="receipt-list">' + lines.map(function(l) {
    return '<li>' + qpEscapeHtml(l.trim()) + '</li>';
  }).join('') + '</ul>';
}

function qpStepsToHtml(text) {
  if (!text) return '';
  var lines = text.split('\n').filter(function(l) { return l.trim(); });
  if (!lines.length) return '';
  return '<ol class="receipt-list">' + lines.map(function(l) {
    return '<li>' + qpEscapeHtml(l.trim()) + '</li>';
  }).join('') + '</ol>';
}

function qpRenderLogo(shop) {
  if (shop.logo) {
    return '<div class="receipt-logo"><img src="' + qpEscapeHtml(shop.logo) + '" alt="logo"></div>';
  }
  if (shop.name) {
    return '<div class="receipt-logo-text">' + qpEscapeHtml(shop.name) + '</div>';
  }
  return '';
}

function qpRenderShopFooter(shop, opts, worker) {
  opts = opts || {};
  var html = '';

  if (shop.locations && shop.locations.length) {
    html += '<div class="receipt-section"><div class="receipt-label">' + qpT('locationsLabel') + '</div>';
    html += '<ul class="receipt-list">';
    shop.locations.forEach(function(loc) {
      html += '<li>' + qpEscapeHtml(loc.address) + '</li>';
    });
    html += '</ul></div>';
  }

  if (opts.showEmail) {
    var email = (worker && worker.email) ? worker.email : shop.email;
    if (email) {
      html += '<div class="receipt-section"><div class="receipt-label">' + qpT('emailLabel') + '</div><div class="receipt-value">' + qpEscapeHtml(email) + '</div></div>';
    }
  }

  if (opts.showPhone) {
    var phone = (worker && worker.phone) ? worker.phone : shop.phone;
    if (phone) {
      html += '<div class="receipt-section"><div class="receipt-label">' + qpT('phoneLabel') + '</div><div class="receipt-value">' + qpEscapeHtml(phone) + '</div></div>';
    }
  }

  if (opts.showWhatsApp) {
    var wa = (worker && worker.whatsapp) ? worker.whatsapp : shop.whatsapp;
    if (wa) {
      html += '<div class="receipt-section"><div class="receipt-label">' + qpT('whatsappLabel') + '</div><div class="receipt-value">' + qpEscapeHtml(wa) + '</div></div>';
    }
  }

  if (opts.showOpeningHours && shop.hours) {
    var hasHours = false;
    var days = { mon: qpT('mon'), tue: qpT('tue'), wed: qpT('wed'), thu: qpT('thu'), fri: qpT('fri'), sat: qpT('sat'), sun: qpT('sun') };
    var hoursHtml = '';
    Object.entries(days).forEach(function(entry) {
      var key = entry[0], label = entry[1];
      if (shop.hours[key]) {
        hasHours = true;
        hoursHtml += '<div class="receipt-hours-row"><span>' + label + '</span><span>' + qpEscapeHtml(shop.hours[key]) + '</span></div>';
      }
    });
    if (hasHours) {
      html += '<div class="receipt-section"><div class="receipt-label">' + qpT('openingHoursLabel') + '</div>' + hoursHtml + '</div>';
    }
  }

  return html;
}

var QP_TEMPLATES = {
  discount: {
    id: 'discount',
    nameKey: 'discountVoucher',
    descKey: 'discountVoucherDesc',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 7h10l-2 7H9L7 7z"/><path d="M8 14v4"/><path d="M16 14v4"/></svg>',
    fields: [
      { key: 'headline', labelKey: 'headline', type: 'text', default: 'EXCLUSIVE VOUCHER' },
      { key: 'code', labelKey: 'voucherCode', type: 'text', default: '' },
      { key: 'percent', labelKey: 'percentOff', type: 'number', default: '' },
      { key: 'description', labelKey: 'description', type: 'textarea', default: '' },
      { key: 'redemption', labelKey: 'redemptionNote', type: 'text', default: '' },
      { key: 'validUntil', labelKey: 'validUntil', type: 'date', default: '' },
      { key: 'workerId', labelKey: 'specialist', type: 'worker', default: '' },
      { key: 'cta', labelKey: 'callToAction', type: 'text', default: '' },
      { key: 'showFreeDelivery', labelKey: 'showFreeDelivery', type: 'checkbox', default: false },
      { key: 'freeDeliveryCopy', labelKey: 'freeDeliveryCopy', type: 'text', default: '' }
    ],
    render: function(data, shop, worker) {
      var html = qpRenderLogo(shop);
      html += '<div class="receipt-divider"></div>';
      html += '<div class="receipt-headline">' + qpEscapeHtml(data.headline) + '</div>';
      html += '<div class="receipt-divider"></div>';
      html += '<div class="receipt-center">';
      if (data.code) html += '<div class="receipt-line">Code &middot; ' + qpEscapeHtml(data.code) + '</div>';
      if (data.percent) html += '<div class="receipt-big">&bull; ' + qpEscapeHtml(data.percent) + '% OFF &bull;</div>';
      html += '</div>';
      if (data.description) html += '<div class="receipt-paragraph">' + qpNl2br(data.description) + '</div>';
      if (data.redemption) html += '<div class="receipt-paragraph receipt-small">' + qpEscapeHtml(data.redemption) + '</div>';
      if (data.validUntil) {
        html += '<div class="receipt-center receipt-label">' + qpT('validUntilLabel') + ' ' + qpFormatDateDMY(data.validUntil) + '</div>';
      }
      if (worker) {
        html += '<div class="receipt-center">' + qpEscapeHtml(worker.role) + '<br><strong>' + qpEscapeHtml(worker.name) + '</strong></div>';
      }
      html += '<div class="receipt-divider"></div>';
      html += qpRenderShopFooter(shop, { showEmail: true, showPhone: true, showWhatsApp: true }, worker);
      if (data.cta) {
        html += '<div class="receipt-divider"></div>';
        html += '<div class="receipt-center receipt-cta">' + qpNl2br(data.cta) + '</div>';
      }
      if (data.showFreeDelivery && data.freeDeliveryCopy) {
        html += '<div class="receipt-divider dotted"></div>';
        html += '<div class="receipt-center receipt-small">' + qpEscapeHtml(data.freeDeliveryCopy) + '</div>';
      }
      html += '<div class="receipt-divider"></div>';
      return html;
    }
  },

  businesscard: {
    id: 'businesscard',
    nameKey: 'businessCard',
    descKey: 'businessCardDesc',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 10h.01"/><path d="M8 14h.01"/><path d="M12 10h4"/><path d="M12 14h4"/></svg>',
    fields: [
      { key: 'tagline', labelKey: 'tagline', type: 'text', default: '' },
      { key: 'role', labelKey: 'specialistRole', type: 'text', default: '' },
      { key: 'workerId', labelKey: 'specialist', type: 'worker', default: '' },
      { key: 'showEmail', labelKey: 'showEmail', type: 'checkbox', default: false },
      { key: 'showPhone', labelKey: 'showPhone', type: 'checkbox', default: false },
      { key: 'showWhatsApp', labelKey: 'showWhatsApp', type: 'checkbox', default: false },
      { key: 'notes', labelKey: 'notesOptional', type: 'textarea', default: '' },
      { key: 'showHours', labelKey: 'showOpeningHours', type: 'checkbox', default: false },
      { key: 'cta', labelKey: 'callToAction', type: 'text', default: '' }
    ],
    render: function(data, shop, worker) {
      var html = qpRenderLogo(shop);
      html += '<div class="receipt-divider"></div>';
      html += '<div class="receipt-center">';
      if (data.tagline) html += '<div class="receipt-headline">' + qpEscapeHtml(data.tagline) + '</div>';
      if (data.role) html += '<div class="receipt-line">' + qpEscapeHtml(data.role) + '</div>';
      if (worker) {
        html += '<div class="receipt-line"><strong>' + qpEscapeHtml(worker.name) + '</strong></div>';
      }
      html += '</div>';
      html += '<div class="receipt-divider"></div>';
      if (data.notes) {
        html += '<div class="receipt-paragraph receipt-center">' + qpNl2br(data.notes) + '</div>';
        html += '<div class="receipt-divider"></div>';
      }
      var footerOpts = {
        showEmail: data.showEmail && !!(worker && worker.email || shop.email),
        showPhone: data.showPhone && !!(worker && worker.phone || shop.phone),
        showWhatsApp: data.showWhatsApp && !!(worker && worker.whatsapp || shop.whatsapp),
        showOpeningHours: data.showHours
      };
      html += qpRenderShopFooter(shop, footerOpts, worker);
      if (data.cta) {
        html += '<div class="receipt-divider"></div>';
        html += '<div class="receipt-center receipt-cta">' + qpNl2br(data.cta) + '</div>';
      }
      html += '<div class="receipt-divider"></div>';
      return html;
    }
  },

  facial: {
    id: 'facial',
    nameKey: 'facialVoucher',
    descKey: 'facialVoucherDesc',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/></svg>',
    fields: [
      { key: 'headline', labelKey: 'headline', type: 'text', default: '' },
      { key: 'subheadline', labelKey: 'subheadline', type: 'text', default: '' },
      { key: 'intro', labelKey: 'introParagraph', type: 'textarea', default: '' },
      { key: 'benefits', labelKey: 'benefits', type: 'textarea', default: '' },
      { key: 'code', labelKey: 'voucherCode', type: 'text', default: '' },
      { key: 'workerId', labelKey: 'specialist', type: 'worker', default: '' },
      { key: 'closing', labelKey: 'closingLine', type: 'text', default: '' }
    ],
    render: function(data, shop, worker) {
      var html = qpRenderLogo(shop);
      html += '<div class="receipt-divider"></div>';
      html += '<div class="receipt-center">';
      if (data.headline) html += '<div class="receipt-headline">' + qpEscapeHtml(data.headline) + '</div>';
      if (data.subheadline) html += '<div class="receipt-line">' + qpEscapeHtml(data.subheadline) + '</div>';
      html += '</div>';
      html += '<div class="receipt-divider"></div>';
      if (data.intro) html += '<div class="receipt-paragraph">' + qpNl2br(data.intro) + '</div>';
      if (data.benefits) html += qpBenefitsToHtml(data.benefits);
      html += '<div class="receipt-divider"></div>';
      html += '<div class="receipt-center">';
      if (data.code) html += '<div class="receipt-label">' + qpT('voucherCodeLabel') + ' ' + qpEscapeHtml(data.code) + '</div>';
      if (worker) html += '<div class="receipt-line">' + qpT('specialist') + ' ' + qpEscapeHtml(worker.name) + '</div>';
      html += '</div>';
      html += qpRenderShopFooter(shop, { showEmail: true, showPhone: true, showWhatsApp: true }, worker);
      if (data.closing) {
        html += '<div class="receipt-divider"></div>';
        html += '<div class="receipt-center receipt-cta">' + qpEscapeHtml(data.closing) + '</div>';
      }
      html += '<div class="receipt-divider"></div>';
      return html;
    }
  },

  skincare: {
    id: 'skincare',
    nameKey: 'skincareInstructions',
    descKey: 'skincareInstructionsDesc',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>',
    fields: [
      { key: 'product', labelKey: 'productName', type: 'text', default: '' },
      { key: 'steps', labelKey: 'usageSteps', type: 'textarea', default: '' },
      { key: 'frequency', labelKey: 'frequency', type: 'text', default: '' },
      { key: 'duration', labelKey: 'duration', type: 'text', default: '' },
      { key: 'notes', labelKey: 'notes', type: 'textarea', default: '' },
      { key: 'workerId', labelKey: 'specialist', type: 'worker', default: '' }
    ],
    render: function(data, shop, worker) {
      var html = qpRenderLogo(shop);
      html += '<div class="receipt-divider"></div>';
      html += '<div class="receipt-center">';
      html += '<div class="receipt-headline">' + qpT('skincarePlan') + '</div>';
      if (data.product) html += '<div class="receipt-line">' + qpEscapeHtml(data.product) + '</div>';
      html += '</div>';
      html += '<div class="receipt-divider"></div>';
      if (data.steps) {
        html += '<div class="receipt-label">' + qpT('usageLabel') + '</div>';
        html += qpStepsToHtml(data.steps);
      }
      html += '<div class="receipt-section">';
      if (data.frequency) html += '<div class="receipt-hours-row"><span>' + qpT('frequency') + '</span><span>' + qpEscapeHtml(data.frequency) + '</span></div>';
      if (data.duration) html += '<div class="receipt-hours-row"><span>' + qpT('duration') + '</span><span>' + qpEscapeHtml(data.duration) + '</span></div>';
      html += '</div>';
      if (data.notes) {
        html += '<div class="receipt-divider"></div>';
        html += '<div class="receipt-paragraph receipt-small">' + qpNl2br(data.notes) + '</div>';
      }
      html += '<div class="receipt-divider"></div>';
      if (worker) {
        html += '<div class="receipt-center">';
        html += '<div class="receipt-label">' + qpT('yourSpecialist') + '</div>';
        html += '<div class="receipt-line">' + qpEscapeHtml(worker.name) + ' &mdash; ' + qpEscapeHtml(worker.role) + '</div>';
        html += '</div>';
      }
      html += qpRenderShopFooter(shop, { showEmail: true, showPhone: true, showWhatsApp: true }, worker);
      html += '<div class="receipt-divider"></div>';
      return html;
    }
  }
};

function qpGetTemplateDefaults(templateId) {
  var tmpl = QP_TEMPLATES[templateId];
  if (!tmpl) return {};
  var defaults = {};
  tmpl.fields.forEach(function(f) {
    defaults[f.key] = f.default;
  });
  return defaults;
}

function qpBuildTemplateData(templateId, formValues) {
  var tmpl = QP_TEMPLATES[templateId];
  if (!tmpl) return {};
  var data = {};
  tmpl.fields.forEach(function(f) {
    var val = formValues[f.key];
    if (f.type === 'checkbox') {
      data[f.key] = !!val;
    } else if (f.type === 'number') {
      data[f.key] = val === '' ? '' : Number(val);
    } else {
      data[f.key] = val === undefined ? f.default : val;
    }
  });
  return data;
}

function qpRenderTemplate(templateId, data, shop, worker) {
  var tmpl = QP_TEMPLATES[templateId];
  if (!tmpl) return '<div class="receipt-error">Unknown template</div>';
  return tmpl.render(data, shop, worker);
}

/* Custom template renderer */
function qpRenderCustomTemplate(data, shop, worker) {
  var html = qpRenderLogo(shop);
  var content = data.content || '';
  content = content.replace(/{shop_name}/g, qpEscapeHtml(shop.name || ''));
  content = content.replace(/{shop_email}/g, qpEscapeHtml(shop.email || ''));
  content = content.replace(/{shop_phone}/g, qpEscapeHtml(shop.phone || ''));
  content = content.replace(/{shop_whatsapp}/g, qpEscapeHtml(shop.whatsapp || ''));
  if (worker) {
    content = content.replace(/{worker_name}/g, qpEscapeHtml(worker.name || ''));
    content = content.replace(/{worker_role}/g, qpEscapeHtml(worker.role || ''));
    content = content.replace(/{worker_phone}/g, qpEscapeHtml(worker.phone || ''));
    content = content.replace(/{worker_email}/g, qpEscapeHtml(worker.email || ''));
    content = content.replace(/{worker_whatsapp}/g, qpEscapeHtml(worker.whatsapp || ''));
  } else {
    content = content.replace(/{worker_name}/g, '');
    content = content.replace(/{worker_role}/g, '');
    content = content.replace(/{worker_phone}/g, '');
    content = content.replace(/{worker_email}/g, '');
    content = content.replace(/{worker_whatsapp}/g, '');
  }
  var locs = (shop.locations || []).map(function(l) { return l.address; }).join('\n');
  content = content.replace(/{locations}/g, qpEscapeHtml(locs));
  var hoursArr = [];
  var days = { mon: qpT('mon'), tue: qpT('tue'), wed: qpT('wed'), thu: qpT('thu'), fri: qpT('fri'), sat: qpT('sat'), sun: qpT('sun') };
  Object.entries(days).forEach(function(e) {
    if (shop.hours && shop.hours[e[0]]) hoursArr.push(e[1] + ': ' + shop.hours[e[0]]);
  });
  content = content.replace(/{hours}/g, qpEscapeHtml(hoursArr.join('\n')));
  html += '<div class="receipt-divider"></div>';
  html += '<div class="receipt-paragraph">' + qpNl2br(content) + '</div>';
  html += '<div class="receipt-divider"></div>';
  return html;
}
