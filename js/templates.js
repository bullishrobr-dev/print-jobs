/**
 * templates.js — Template schemas, defaults (per language), render functions
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

function qpRenderShopFooter(shop, opts) {
  opts = opts || {};
  var html = '';
  var hasFooter = false;

  if (shop.locations && shop.locations.length) {
    hasFooter = true;
    html += '<div class="receipt-section"><div class="receipt-label">' + qpT('locationsLabel') + '</div>';
    html += '<ul class="receipt-list">';
    shop.locations.forEach(function(loc) {
      html += '<li>' + qpEscapeHtml(loc.address) + '</li>';
    });
    html += '</ul></div>';
  }

  if (shop.email) {
    hasFooter = true;
    html += '<div class="receipt-section"><div class="receipt-label">' + qpT('emailLabel') + '</div><div class="receipt-value">' + qpEscapeHtml(shop.email) + '</div></div>';
  }

  if (shop.phone) {
    hasFooter = true;
    html += '<div class="receipt-section"><div class="receipt-label">' + qpT('phoneLabel') + '</div><div class="receipt-value">' + qpEscapeHtml(shop.phone) + '</div></div>';
  }

  if (shop.whatsapp) {
    hasFooter = true;
    html += '<div class="receipt-section"><div class="receipt-label">' + qpT('whatsappLabel') + '</div><div class="receipt-value">' + qpEscapeHtml(shop.whatsapp) + '</div></div>';
  }

  if (opts.showOpeningHours && shop.hours) {
    var days = { mon: qpT('mon'), tue: qpT('tue'), wed: qpT('wed'), thu: qpT('thu'), fri: qpT('fri'), sat: qpT('sat'), sun: qpT('sun') };
    var hoursHtml = '';
    Object.entries(days).forEach(function(entry) {
      var key = entry[0], label = entry[1];
      if (shop.hours[key]) {
        hoursHtml += '<div class="receipt-hours-row"><span>' + label + '</span><span>' + qpEscapeHtml(shop.hours[key]) + '</span></div>';
      }
    });
    if (hoursHtml) {
      hasFooter = true;
      html += '<div class="receipt-section"><div class="receipt-label">' + qpT('openingHoursLabel') + '</div>' + hoursHtml + '</div>';
    }
  }

  if (hasFooter) {
    return '<div class="receipt-divider"></div>' + html + '<div class="receipt-divider"></div>';
  }
  return '';
}

function qpRenderWorkerContact(worker, opts) {
  opts = opts || {};
  if (!worker) return '';
  var html = '';
  var hasContact = false;

  if (opts.showEmail && worker.email) {
    hasContact = true;
    html += '<div class="receipt-section"><div class="receipt-label">' + qpT('emailLabel') + '</div><div class="receipt-value">' + qpEscapeHtml(worker.email) + '</div></div>';
  }
  if (opts.showPhone && worker.phone) {
    hasContact = true;
    html += '<div class="receipt-section"><div class="receipt-label">' + qpT('phoneLabel') + '</div><div class="receipt-value">' + qpEscapeHtml(worker.phone) + '</div></div>';
  }
  if (opts.showWhatsApp && worker.whatsapp) {
    hasContact = true;
    html += '<div class="receipt-section"><div class="receipt-label">' + qpT('whatsappLabel') + '</div><div class="receipt-value">' + qpEscapeHtml(worker.whatsapp) + '</div></div>';
  }

  if (hasContact) {
    return '<div class="receipt-divider dotted"></div>' + html;
  }
  return '';
}

/* Language-specific defaults */
var QP_TEMPLATE_DEFAULTS = {
  en: {
    discount: { headline: 'EXCLUSIVE VOUCHER', code: 'SAVE20', percent: '20', description: 'Valid on your next skincare product purchase in-store. Limited time only!', redemption: 'Present this voucher at checkout to redeem your discount.', validUntil: '', cta: 'Visit us today and redeem your unique offer!', showFreeDelivery: false, freeDeliveryCopy: 'Contact us for a FREE delivery with your discount!' },
    businesscard: { tagline: 'Your Skin, Refined.', role: 'Skincare Specialist', showEmail: false, showPhone: false, showWhatsApp: false, notes: '', showHours: false, cta: 'Visit us in-store and ask for your free skincare consultation today!' },
    facial: { headline: '\u2022 COMPLIMENTARY FACIAL \u2022', subheadline: 'Red + Infrared LED Therapy Session + Complimentary Refreshment', intro: 'Discover the benefits of this advanced non-invasive technology, designed for total skin and body rejuvenation:', benefits: 'Smooths fine lines and wrinkles\nLifts and tones facial muscles\nStimulates collagen and elastin\nMinimises visible pores\nEvens out skin tone and texture\nRepairs sun-damaged and aging skin\nImproves blood flow and circulation\nReduces inflammation and redness', code: 'FACELIFT25', closing: 'Ask in-store for full treatment details!' },
    skincare: { product: 'Yubari King Wrinkle Eraser', steps: 'Cleanse face thoroughly and pat dry\nApply a pea-sized amount to target areas\nGently massage in circular motions until absorbed\nFollow with moisturiser and SPF in the morning', frequency: 'Morning & Evening', duration: '4 weeks', notes: 'For best results, use consistently. Avoid contact with eyes. If irritation occurs, discontinue use.' }
  },
  es: {
    discount: { headline: 'VALE EXCLUSIVO', code: 'AHORRA20', percent: '20', description: 'Válido en tu próxima compra de productos de cuidado de la piel en tienda. ¡Por tiempo limitado!', redemption: 'Presenta este vale en caja para canjear tu descuento.', validUntil: '', cta: '¡Visítanos hoy y canjea tu oferta exclusiva!', showFreeDelivery: false, freeDeliveryCopy: '¡Contáctanos para una entrega GRATUITA con tu descuento!' },
    businesscard: { tagline: 'Tu Piel, Refinada.', role: 'Especialista en Cuidado de la Piel', showEmail: false, showPhone: false, showWhatsApp: false, notes: '', showHours: false, cta: '¡Visítanos en tienda y pide tu consulta gratuita de cuidado de la piel hoy!' },
    facial: { headline: '\u2022 FACIAL GRATUITO \u2022', subheadline: 'Sesión de Terapia LED Roja + Infrarroja + Refresco Complimentario', intro: 'Descubre los beneficios de esta tecnología avanzada no invasiva, diseñada para la rejuvenación total de la piel y el cuerpo:', benefits: 'Suaviza las líneas finas y arrugas\nLevanta y tonifica los músculos faciales\nEstimula el colágeno y la elastina\nMinimiza los poros visibles\nUniformiza el tono y la textura de la piel\nRepara la piel dañada por el sol y el envejecimiento\nMejora el flujo sanguíneo y la circulación\nReduce la inflamación y el enrojecimiento', code: 'REJUV25', closing: '¡Pregunta en tienda por los detalles completos del tratamiento!' },
    skincare: { product: 'Yubari King Wrinkle Eraser', steps: 'Limpia bien el rostro y sécalo con suavidad\nAplica una cantidad del tamaño de un guisante en las zonas objetivo\nMasajea suavemente con movimientos circulares hasta absorber\nAplica hidratante y SPF por la mañana', frequency: 'Mañana y Noche', duration: '4 semanas', notes: 'Para mejores resultados, úsalo consistentemente. Evita el contacto con los ojos. Si hay irritación, suspende su uso.' }
  },
  fr: {
    discount: { headline: 'BON EXCLUSIF', code: 'ECONOMISE20', percent: '20', description: 'Valable sur votre prochain achat de produits de soin de la peau en magasin. Durée limitée!', redemption: 'Présentez ce bon à la caisse pour obtenir votre remise.', validUntil: '', cta: 'Visitez-nous aujourd\'hui et profitez de votre offre exclusive!', showFreeDelivery: false, freeDeliveryCopy: 'Contactez-nous pour une livraison GRATUITE avec votre remise!' },
    businesscard: { tagline: 'Votre Peau, Raffînée.', role: 'Spécialiste en Soins de la Peau', showEmail: false, showPhone: false, showWhatsApp: false, notes: '', showHours: false, cta: 'Visitez-nous en magasin et demandez votre consultation gratuite de soins de la peau!' },
    facial: { headline: '\u2022 SOIN GRATUIT \u2022', subheadline: 'Séance de Thérapie LED Rouge + Infrarouge + Rafraîchissement Complimentaire', intro: 'Découvrez les bienfaits de cette technologie avancée non invasive, conçue pour la rejuvenation totale de la peau et du corps:', benefits: 'Lisse les ridules et les rides\nRemonte et tonifie les muscles du visage\nStimule le collagène et l\'élastine\nMinimise les pores visibles\nUniformise le teint et la texture de la peau\nRépare la peau abîmée par le soleil et le vieillissement\nAméliore le flux sanguin et la circulation\nRéduit l\'inflammation et les rougeurs', code: 'REJUV25', closing: 'Demandez en magasin les détails complets du traitement!' },
    skincare: { product: 'Yubari King Wrinkle Eraser', steps: 'Nettoyez bien le visage et séchez-le délicatement\nAppliquez une noisette sur les zones ciblées\nMassagez doucement par mouvements circulaires jusqu\'à absorption\nAppliquez hydratant et SPF le matin', frequency: 'Matin & Soir', duration: '4 semaines', notes: 'Pour de meilleurs résultats, utilisez régulièrement. Évitez le contact avec les yeux. En cas d\'irritation, cessez l\'utilisation.' }
  }
};

var QP_TEMPLATES = {
  discount: {
    id: 'discount',
    nameKey: 'discountVoucher',
    descKey: 'discountVoucherDesc',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 7h10l-2 7H9L7 7z"/><path d="M8 14v4"/><path d="M16 14v4"/></svg>',
    fields: [
      { key: 'headline', labelKey: 'headline', type: 'text' },
      { key: 'code', labelKey: 'voucherCode', type: 'text' },
      { key: 'percent', labelKey: 'percentOff', type: 'number' },
      { key: 'description', labelKey: 'description', type: 'textarea' },
      { key: 'redemption', labelKey: 'redemptionNote', type: 'text' },
      { key: 'validUntil', labelKey: 'validUntil', type: 'date' },
      { key: 'workerId', labelKey: 'specialist', type: 'worker' },
      { key: 'cta', labelKey: 'callToAction', type: 'text' },
      { key: 'showFreeDelivery', labelKey: 'showFreeDelivery', type: 'checkbox' },
      { key: 'freeDeliveryCopy', labelKey: 'freeDeliveryCopy', type: 'text' }
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
      if (data.cta) {
        html += '<div class="receipt-center receipt-cta">' + qpNl2br(data.cta) + '</div>';
        html += '<div class="receipt-divider"></div>';
      }
      if (data.showFreeDelivery && data.freeDeliveryCopy) {
        html += '<div class="receipt-center receipt-small">' + qpEscapeHtml(data.freeDeliveryCopy) + '</div>';
        html += '<div class="receipt-divider"></div>';
      }
      html += qpRenderShopFooter(shop);
      return html;
    }
  },

  businesscard: {
    id: 'businesscard',
    nameKey: 'businessCard',
    descKey: 'businessCardDesc',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 10h.01"/><path d="M8 14h.01"/><path d="M12 10h4"/><path d="M12 14h4"/></svg>',
    fields: [
      { key: 'tagline', labelKey: 'tagline', type: 'text' },
      { key: 'role', labelKey: 'specialistRole', type: 'text' },
      { key: 'workerId', labelKey: 'specialist', type: 'worker' },
      { key: 'showEmail', labelKey: 'showEmail', type: 'checkbox' },
      { key: 'showPhone', labelKey: 'showPhone', type: 'checkbox' },
      { key: 'showWhatsApp', labelKey: 'showWhatsApp', type: 'checkbox' },
      { key: 'notes', labelKey: 'notesOptional', type: 'textarea' },
      { key: 'showHours', labelKey: 'showOpeningHours', type: 'checkbox' },
      { key: 'cta', labelKey: 'callToAction', type: 'text' }
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
      if (worker) {
        html += qpRenderWorkerContact(worker, { showEmail: data.showEmail, showPhone: data.showPhone, showWhatsApp: data.showWhatsApp });
      }
      var footerOpts = { showOpeningHours: data.showHours };
      html += qpRenderShopFooter(shop, footerOpts);
      if (data.cta) {
        html += '<div class="receipt-center receipt-cta">' + qpNl2br(data.cta) + '</div>';
        html += '<div class="receipt-divider"></div>';
      }
      return html;
    }
  },

  facial: {
    id: 'facial',
    nameKey: 'facialVoucher',
    descKey: 'facialVoucherDesc',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/></svg>',
    fields: [
      { key: 'headline', labelKey: 'headline', type: 'text' },
      { key: 'subheadline', labelKey: 'subheadline', type: 'text' },
      { key: 'intro', labelKey: 'introParagraph', type: 'textarea' },
      { key: 'benefits', labelKey: 'benefits', type: 'textarea' },
      { key: 'code', labelKey: 'voucherCode', type: 'text' },
      { key: 'workerId', labelKey: 'specialist', type: 'worker' },
      { key: 'closing', labelKey: 'closingLine', type: 'text' }
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
      if (worker) {
        html += qpRenderWorkerContact(worker, { showPhone: true, showWhatsApp: true });
      }
      html += qpRenderShopFooter(shop);
      if (data.closing) {
        html += '<div class="receipt-center receipt-cta">' + qpEscapeHtml(data.closing) + '</div>';
        html += '<div class="receipt-divider"></div>';
      }
      return html;
    }
  },

  skincare: {
    id: 'skincare',
    nameKey: 'skincareInstructions',
    descKey: 'skincareInstructionsDesc',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>',
    fields: [
      { key: 'product', labelKey: 'productName', type: 'text' },
      { key: 'steps', labelKey: 'usageSteps', type: 'textarea' },
      { key: 'frequency', labelKey: 'frequency', type: 'text' },
      { key: 'duration', labelKey: 'duration', type: 'text' },
      { key: 'notes', labelKey: 'notes', type: 'textarea' },
      { key: 'workerId', labelKey: 'specialist', type: 'worker' }
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
        html += qpRenderWorkerContact(worker, { showPhone: true, showWhatsApp: true });
      }
      html += qpRenderShopFooter(shop);
      return html;
    }
  }
};

function qpGetTemplateDefaults(templateId) {
  var lang = qpGetLang();
  var defaults = QP_TEMPLATE_DEFAULTS[lang] || QP_TEMPLATE_DEFAULTS.en;
  var tmplDefaults = defaults[templateId] || {};
  var result = {};
  var tmpl = QP_TEMPLATES[templateId];
  if (tmpl) {
    tmpl.fields.forEach(function(f) {
      result[f.key] = tmplDefaults[f.key] !== undefined ? tmplDefaults[f.key] : '';
    });
  }
  return result;
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
      data[f.key] = val === undefined ? '' : val;
    }
  });
  return data;
}

function qpRenderTemplate(templateId, data, shop, worker) {
  var tmpl = QP_TEMPLATES[templateId];
  if (!tmpl) return '<div class="receipt-error">Unknown template</div>';
  return tmpl.render(data, shop, worker);
}

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
  html += qpRenderShopFooter(shop);
  return html;
}
