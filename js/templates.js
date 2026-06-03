/**
 * templates.js — Template schemas, default values, and render functions
 */

function qpFormatDateDMY(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return day + '.' + month + '.' + year;
}

function qpEscapeHtml(text) {
  if (text == null) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function qpNl2br(text) {
  return qpEscapeHtml(text).replace(/\n/g, '<br>');
}

function qpBenefitsToHtml(text) {
  if (!text) return '';
  const lines = text.split('\n').filter(function(l) { return l.trim(); });
  if (!lines.length) return '';
  return '<ul class="receipt-list">' + lines.map(function(l) {
    return '<li>' + qpEscapeHtml(l.trim()) + '</li>';
  }).join('') + '</ul>';
}

function qpStepsToHtml(text) {
  if (!text) return '';
  const lines = text.split('\n').filter(function(l) { return l.trim(); });
  if (!lines.length) return '';
  return '<ol class="receipt-list">' + lines.map(function(l) {
    return '<li>' + qpEscapeHtml(l.trim()) + '</li>';
  }).join('') + '</ol>';
}

function qpRenderLogo(shop) {
  if (shop.logo) {
    return '<div class="receipt-logo"><img src="' + qpEscapeHtml(shop.logo) + '" alt="' + qpEscapeHtml(shop.name) + '"></div>';
  }
  return '<div class="receipt-logo-text">' + qpEscapeHtml(shop.name) + '</div>';
}

function qpRenderShopFooter(shop, opts, worker) {
  opts = opts || {};
  var html = '';

  if (shop.locations && shop.locations.length) {
    html += '<div class="receipt-section"><div class="receipt-label">LOCATIONS:</div>';
    html += '<ul class="receipt-list">';
    shop.locations.forEach(function(loc) {
      html += '<li>' + qpEscapeHtml(loc.address) + '</li>';
    });
    html += '</ul></div>';
  }

  if (opts.showEmail) {
    var email = (worker && worker.email) ? worker.email : shop.email;
    if (email) {
      html += '<div class="receipt-section"><div class="receipt-label">EMAIL:</div><div class="receipt-value">' + qpEscapeHtml(email) + '</div></div>';
    }
  }

  if (opts.showPhone) {
    var phone = (worker && worker.phone) ? worker.phone : shop.phone;
    if (phone) {
      html += '<div class="receipt-section"><div class="receipt-label">PHONE/WHATSAPP:</div><div class="receipt-value">' + qpEscapeHtml(phone) + '</div></div>';
    }
  }

  if (opts.showOpeningHours && shop.hours) {
    html += '<div class="receipt-section"><div class="receipt-label">OPENING HOURS:</div>';
    var days = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
    Object.entries(days).forEach(function(entry) {
      var key = entry[0], label = entry[1];
      if (shop.hours[key]) {
        html += '<div class="receipt-hours-row"><span>' + label + '</span><span>' + qpEscapeHtml(shop.hours[key]) + '</span></div>';
      }
    });
    html += '</div>';
  }

  return html;
}

var QP_TEMPLATES = {
  discount: {
    id: 'discount',
    name: 'Discount Voucher',
    description: 'Percent-off code valid for a single purchase.',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 7h10l-2 7H9L7 7z"/><path d="M8 14v4"/><path d="M16 14v4"/></svg>',
    fields: [
      { key: 'headline', label: 'Headline', type: 'text', default: 'ZERO LINES EXCLUSIVE VOUCHER' },
      { key: 'code', label: 'Voucher Code', type: 'text', default: 'X83RLK' },
      { key: 'percent', label: 'Percent Off', type: 'number', default: '20' },
      { key: 'description', label: 'Description', type: 'textarea', default: 'Valid on your next skincare product purchase in-store. Limited time only!' },
      { key: 'redemption', label: 'Redemption Note', type: 'text', default: 'Present this voucher at checkout to redeem your discount.' },
      { key: 'validUntil', label: 'Valid Until', type: 'date', default: '' },
      { key: 'workerId', label: 'Skincare Specialist', type: 'worker', default: '' },
      { key: 'cta', label: 'Call to Action', type: 'text', default: 'Visit us today and redeem your unique offer!' },
      { key: 'showFreeDelivery', label: 'Show "free delivery" line', type: 'checkbox', default: false },
      { key: 'freeDeliveryCopy', label: 'Free Delivery Copy', type: 'text', default: 'Contact us for a FREE delivery with your discount!' }
    ],
    render: function(data, shop, worker) {
      var html = qpRenderLogo(shop);
      html += '<div class="receipt-divider"></div>';
      html += '<div class="receipt-headline">' + qpEscapeHtml(data.headline) + '</div>';
      html += '<div class="receipt-divider"></div>';
      html += '<div class="receipt-center">';
      html += '<div class="receipt-line">Code · ' + qpEscapeHtml(data.code) + '</div>';
      html += '<div class="receipt-big">• ' + qpEscapeHtml(data.percent) + '% OFF •</div>';
      html += '</div>';
      html += '<div class="receipt-paragraph">' + qpNl2br(data.description) + '</div>';
      html += '<div class="receipt-paragraph receipt-small">' + qpEscapeHtml(data.redemption) + '</div>';
      if (data.validUntil) {
        html += '<div class="receipt-center receipt-label">VALID UNTIL ' + qpFormatDateDMY(data.validUntil) + '</div>';
      }
      if (worker) {
        html += '<div class="receipt-center">' + qpEscapeHtml(worker.role) + '<br><strong>' + qpEscapeHtml(worker.name) + '</strong></div>';
      }
      html += '<div class="receipt-divider"></div>';

      var footerOpts = { showEmail: true, showPhone: true };
      html += qpRenderShopFooter(shop, footerOpts, worker);

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
    name: 'Business Card',
    description: 'Specialist card with locations, hours, and contact.',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 10h.01"/><path d="M8 14h.01"/><path d="M12 10h4"/><path d="M12 14h4"/></svg>',
    fields: [
      { key: 'tagline', label: 'Tagline', type: 'text', default: 'Your Skin, Refined.' },
      { key: 'role', label: 'Specialist Role', type: 'text', default: 'Skincare Specialist' },
      { key: 'workerId', label: 'Specialist', type: 'worker', default: '' },
      { key: 'showEmail', label: 'Show my email on the card', type: 'checkbox', default: false },
      { key: 'showPhone', label: 'Show my phone / WhatsApp on the card', type: 'checkbox', default: false },
      { key: 'notes', label: 'Notes (optional)', type: 'textarea', default: '' },
      { key: 'showHours', label: 'Show opening hours', type: 'checkbox', default: true },
      { key: 'cta', label: 'Call to Action', type: 'text', default: 'Visit us in-store and ask for your free skincare consultation today!' }
    ],
    render: function(data, shop, worker) {
      var html = qpRenderLogo(shop);
      html += '<div class="receipt-divider"></div>';
      html += '<div class="receipt-center">';
      html += '<div class="receipt-headline">' + qpEscapeHtml(data.tagline) + '</div>';
      html += '<div class="receipt-line">' + qpEscapeHtml(data.role) + '</div>';
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
    name: 'Facial / Treatment Voucher',
    description: 'Complimentary treatment voucher with benefits list.',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/></svg>',
    fields: [
      { key: 'headline', label: 'Headline', type: 'text', default: '• COMPLIMENTARY FACIAL •' },
      { key: 'subheadline', label: 'Sub-headline', type: 'text', default: 'Red + Infrared LED Therapy Session + Complimentary Refreshment' },
      { key: 'intro', label: 'Intro Paragraph', type: 'textarea', default: 'Discover the benefits of this advanced non-invasive technology, designed for total skin and body rejuvenation:' },
      { key: 'benefits', label: 'Benefits (one per line)', type: 'textarea', default: 'Smooths fine lines and wrinkles\nLifts and tones facial muscles\nStimulates collagen and elastin\nMinimises visible pores\nEvens out skin tone and texture\nRepairs sun-damaged and aging skin\nImproves blood flow and circulation\nReduces inflammation and redness\nEases joint and muscle pain\nRelieves tension in the face and body\nSupports healing of broken capillaries\nHelps with the appearance of leg veins\nDeeply relaxing and calming experience' },
      { key: 'code', label: 'Voucher Code', type: 'text', default: 'FACELIFT25' },
      { key: 'workerId', label: 'Skincare Specialist', type: 'worker', default: '' },
      { key: 'closing', label: 'Closing Line', type: 'text', default: 'Ask in-store for full treatment details!' }
    ],
    render: function(data, shop, worker) {
      var html = qpRenderLogo(shop);
      html += '<div class="receipt-divider"></div>';
      html += '<div class="receipt-center">';
      html += '<div class="receipt-headline">' + qpEscapeHtml(data.headline) + '</div>';
      html += '<div class="receipt-line">' + qpEscapeHtml(data.subheadline) + '</div>';
      html += '</div>';
      html += '<div class="receipt-divider"></div>';

      if (data.intro) {
        html += '<div class="receipt-paragraph">' + qpNl2br(data.intro) + '</div>';
      }

      if (data.benefits) {
        html += qpBenefitsToHtml(data.benefits);
      }

      html += '<div class="receipt-divider"></div>';
      html += '<div class="receipt-center">';
      html += '<div class="receipt-label">VOUCHER CODE ' + qpEscapeHtml(data.code) + '</div>';
      if (worker) {
        html += '<div class="receipt-line">SKINCARE SPECIALIST ' + qpEscapeHtml(worker.name) + '</div>';
      }
      html += '</div>';

      var footerOpts = { showEmail: true, showPhone: true };
      html += qpRenderShopFooter(shop, footerOpts, worker);

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
    name: 'Skincare Instructions',
    description: 'Personalised product-use plan with schedule checkboxes.',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>',
    fields: [
      { key: 'product', label: 'Product Name', type: 'text', default: 'Yubari King Wrinkle Eraser' },
      { key: 'steps', label: 'Usage Steps (one per line)', type: 'textarea', default: 'Cleanse face thoroughly and pat dry\nApply a pea-sized amount to target areas\nGently massage in circular motions until absorbed\nFollow with moisturiser and SPF in the morning' },
      { key: 'frequency', label: 'Frequency', type: 'text', default: 'Morning & Evening' },
      { key: 'duration', label: 'Duration', type: 'text', default: '4 weeks' },
      { key: 'notes', label: 'Notes', type: 'textarea', default: 'For best results, use consistently. Avoid contact with eyes. If irritation occurs, discontinue use.' },
      { key: 'workerId', label: 'Skincare Specialist', type: 'worker', default: '' }
    ],
    render: function(data, shop, worker) {
      var html = qpRenderLogo(shop);
      html += '<div class="receipt-divider"></div>';
      html += '<div class="receipt-center">';
      html += '<div class="receipt-headline">SKINCARE PLAN</div>';
      html += '<div class="receipt-line">' + qpEscapeHtml(data.product) + '</div>';
      html += '</div>';
      html += '<div class="receipt-divider"></div>';

      if (data.steps) {
        html += '<div class="receipt-label">USAGE:</div>';
        html += qpStepsToHtml(data.steps);
      }

      html += '<div class="receipt-section">';
      html += '<div class="receipt-hours-row"><span>Frequency</span><span>' + qpEscapeHtml(data.frequency) + '</span></div>';
      html += '<div class="receipt-hours-row"><span>Duration</span><span>' + qpEscapeHtml(data.duration) + '</span></div>';
      html += '</div>';

      if (data.notes) {
        html += '<div class="receipt-divider"></div>';
        html += '<div class="receipt-paragraph receipt-small">' + qpNl2br(data.notes) + '</div>';
      }

      html += '<div class="receipt-divider"></div>';
      if (worker) {
        html += '<div class="receipt-center">';
        html += '<div class="receipt-label">YOUR SPECIALIST</div>';
        html += '<div class="receipt-line">' + qpEscapeHtml(worker.name) + ' — ' + qpEscapeHtml(worker.role) + '</div>';
        html += '</div>';
      }

      var footerOpts = { showEmail: true, showPhone: true };
      html += qpRenderShopFooter(shop, footerOpts, worker);

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
