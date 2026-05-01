(function () {
  var TOKEN_KEY = 'prostir_admin_leads_token';

  var gate = document.getElementById('gate');
  var app = document.getElementById('app');
  var tokenInput = document.getElementById('token-input');
  var tokenSave = document.getElementById('token-save');
  var gateErr = document.getElementById('gate-err');
  var leadsBody = document.getElementById('leads-body');
  var leadCount = document.getElementById('lead-count');
  var dbWarning = document.getElementById('db-warning');
  var sseStatus = document.getElementById('sse-status');
  var panelPill = document.getElementById('panel-pill');
  var logoutBtn = document.getElementById('logout-btn');
  var notifyBtn = document.getElementById('notify-btn');
  var drawer = document.getElementById('drawer');
  var drawerOverlay = document.getElementById('drawer-overlay');
  var drawerClose = document.getElementById('drawer-close');
  var drawerTitle = document.getElementById('drawer-title');
  var drawerContact = document.getElementById('drawer-contact');
  var drawerSocial = document.getElementById('drawer-social');
  var drawerNotes = document.getElementById('drawer-notes');
  var drawerStatus = document.getElementById('drawer-status');
  var drawerSave = document.getElementById('drawer-save');

  var token = '';
  var es = null;
  var selectedId = null;
  var leadsById = {};

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function badgeClass(status) {
    if (status === 'NEW') return 'badge badge-new';
    if (status === 'REJECTED') return 'badge badge-rejected';
    if (status === 'CONTACTED') return 'badge badge-contacted';
    return 'badge badge-pilot';
  }

  function formatDate(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleString('uk-UA', { dateStyle: 'short', timeStyle: 'short' });
    } catch (e) {
      return iso;
    }
  }

  function shortLink(h) {
    if (!h) return '—';
    if (h.length > 42) return h.slice(0, 40) + '…';
    return h;
  }

  function rowHtml(lead, withEnter) {
    var trClass = withEnter ? ' row-enter' : '';
    return (
      '<tr data-id="' +
      escapeHtml(lead.id) +
      '"' +
      trClass +
      '><td>' +
      escapeHtml(lead.restaurantName) +
      '</td><td>' +
      escapeHtml(lead.contactPerson) +
      '</td><td class="muted">' +
      escapeHtml(shortLink(lead.instagramHandle)) +
      '</td><td><span class="' +
      badgeClass(lead.status) +
      '">' +
      escapeHtml(lead.status) +
      '</span></td><td class="muted">' +
      escapeHtml(formatDate(lead.createdAt)) +
      '</td></tr>'
    );
  }

  function rebuildTable(leads) {
    leadsById = {};
    (leads || []).forEach(function (l) {
      leadsById[l.id] = l;
    });
    if (leadCount) leadCount.textContent = String(leads.length) + ' заявок';
    if (!leadsBody) return;
    leadsBody.innerHTML = leads.map(function (l) {
      return rowHtml(l, false);
    }).join('');
    bindRows();
  }

  function upsertRow(lead) {
    leadsById[lead.id] = lead;
    if (!leadsBody) return;
    var existing = leadsBody.querySelector('tr[data-id="' + lead.id + '"]');
    if (existing) {
      existing.outerHTML = rowHtml(lead, false);
    } else {
      leadsBody.insertAdjacentHTML('afterbegin', rowHtml(lead, true));
    }
    bindRows();
    var n = Object.keys(leadsById).length;
    if (leadCount) leadCount.textContent = String(n) + ' заявок';
  }

  function bindRows() {
    if (!leadsBody) return;
    leadsBody.querySelectorAll('tr[data-id]').forEach(function (tr) {
      tr.onclick = function () {
        var id = tr.getAttribute('data-id');
        openDrawer(id);
      };
    });
  }

  function openDrawer(id) {
    var lead = leadsById[id];
    if (!lead) return;
    selectedId = id;
    if (drawerTitle) drawerTitle.textContent = lead.restaurantName;
    if (drawerContact) drawerContact.textContent = lead.contactPerson;
    if (drawerSocial) {
      var h = lead.instagramHandle || '';
      if (/^https?:\/\//i.test(h)) {
        drawerSocial.href = h;
        drawerSocial.textContent = shortLink(h);
      } else if (h.indexOf('@') === 0 || h.length) {
        drawerSocial.href = 'https://instagram.com/' + h.replace(/^@/, '');
        drawerSocial.textContent = h || '—';
      } else {
        drawerSocial.href = '#';
        drawerSocial.textContent = '—';
      }
    }
    if (drawerNotes) drawerNotes.value = lead.notes || '';
    if (drawerStatus) drawerStatus.value = lead.status;
    if (drawer) {
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
    }
    if (drawerOverlay) {
      drawerOverlay.classList.add('open');
      drawerOverlay.setAttribute('aria-hidden', 'false');
    }
  }

  function closeDrawer() {
    selectedId = null;
    if (drawer) {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
    }
    if (drawerOverlay) {
      drawerOverlay.classList.remove('open');
      drawerOverlay.setAttribute('aria-hidden', 'true');
    }
  }

  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Admin-Token': token,
    };
  }

  function fetchLeads() {
    return fetch('/api/admin/leads', { headers: authHeaders() }).then(function (r) {
      return r.json().then(function (j) {
        return { ok: r.ok, j: j };
      });
    });
  }

  function showApp() {
    if (gate) gate.classList.add('hidden');
    if (app) app.classList.add('ready');
  }

  function showGate() {
    if (gate) gate.classList.remove('hidden');
    if (app) app.classList.remove('ready');
    if (es) {
      es.close();
      es = null;
    }
  }

  function connectSse() {
    if (es) {
      es.close();
      es = null;
    }
    var url = '/api/admin/leads-stream?token=' + encodeURIComponent(token);
    es = new EventSource(url);
    if (sseStatus) sseStatus.textContent = 'Realtime: підключення…';
    es.onopen = function () {
      if (sseStatus) sseStatus.textContent = 'Realtime: активно';
    };
    es.onerror = function () {
      if (sseStatus) sseStatus.textContent = 'Realtime: перепідключення…';
    };
    es.onmessage = function (ev) {
      try {
        var msg = JSON.parse(ev.data);
        if (msg.type === 'lead_created' && msg.lead) {
          upsertRow(msg.lead);
          notifyNewLead(msg.lead);
        }
        if (msg.type === 'lead_updated' && msg.lead) {
          upsertRow(msg.lead);
          if (selectedId === msg.lead.id) openDrawer(msg.lead.id);
        }
      } catch (e) {
        /* ignore malformed */
      }
    };
  }

  function notifyNewLead(lead) {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;
    try {
      new Notification('PROSTIR — нова заявка', {
        body: lead.restaurantName + ' · ' + lead.contactPerson,
        tag: 'lead-' + lead.id,
      });
    } catch (e) {
      /* ignore */
    }
  }

  function loadPanelStatus() {
    fetch('/api/admin/panel-status')
      .then(function (r) {
        return r.json();
      })
      .then(function (j) {
        if (!panelPill) return;
        if (j.mode === 'maintenance') {
          panelPill.textContent = 'Maintenance';
          panelPill.className = 'pill pill-maint';
        } else {
          panelPill.textContent = 'Live';
          panelPill.className = 'pill pill-live';
        }
      })
      .catch(function () {
        if (panelPill) {
          panelPill.textContent = 'Live';
          panelPill.className = 'pill pill-live';
        }
      });
  }

  function bootstrap() {
    loadPanelStatus();
    fetchLeads().then(function (x) {
      if (!x.ok) {
        if (dbWarning) {
          dbWarning.classList.remove('hidden');
          dbWarning.textContent =
            x.j && x.j.error ? x.j.error : 'Не вдалося завантажити заявки.';
        }
        if (x.j && x.j.error && String(x.j.error).indexOf('DATABASE') >= 0) {
          rebuildTable([]);
        }
        return;
      }
      if (dbWarning) {
        dbWarning.classList.add('hidden');
        dbWarning.textContent = '';
      }
      rebuildTable(x.j.leads || []);
    });
    connectSse();
  }

  if (tokenSave && tokenInput) {
    tokenSave.addEventListener('click', function () {
      if (gateErr) gateErr.textContent = '';
      token = (tokenInput.value || '').trim();
      if (!token) {
        if (gateErr) gateErr.textContent = 'Введіть токен.';
        return;
      }
      fetchLeads().then(function (x) {
        if (x.ok) {
          try {
            sessionStorage.setItem(TOKEN_KEY, token);
          } catch (e) {
            /* ignore */
          }
          showApp();
          bootstrap();
        } else {
          if (gateErr) {
            gateErr.textContent =
              x.j && x.j.error ? x.j.error : 'Невірний токен або сервер недоступний.';
          }
        }
      });
    });
  }

  try {
    token = sessionStorage.getItem(TOKEN_KEY) || '';
  } catch (e) {
    token = '';
  }
  if (token) {
    tokenInput.value = '';
    showApp();
    bootstrap();
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      try {
        sessionStorage.removeItem(TOKEN_KEY);
      } catch (e) {
        /* ignore */
      }
      token = '';
      showGate();
      if (tokenInput) tokenInput.value = '';
    });
  }

  if (notifyBtn) {
    notifyBtn.addEventListener('click', function () {
      if (typeof Notification === 'undefined') {
        alert('Браузер не підтримує сповіщення.');
        return;
      }
      Notification.requestPermission().then(function (p) {
        if (p === 'granted') {
          notifyBtn.textContent = '🔔 Увімкнено';
        }
      });
    });
  }

  document.querySelectorAll('.sb-btn[data-panel]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = btn.getAttribute('data-panel');
      document.querySelectorAll('.sb-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      document.querySelectorAll('.panel').forEach(function (p) {
        p.classList.remove('active');
      });
      var el = document.getElementById('panel-' + panel);
      if (el) el.classList.add('active');
    });
  });

  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  if (drawerSave) {
    drawerSave.addEventListener('click', function () {
      if (!selectedId) return;
      var body = {
        status: drawerStatus ? drawerStatus.value : undefined,
        notes: drawerNotes ? drawerNotes.value : '',
      };
      fetch('/api/admin/leads/' + encodeURIComponent(selectedId), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(body),
      })
        .then(function (r) {
          return r.json().then(function (j) {
            return { ok: r.ok, j: j };
          });
        })
        .then(function (x) {
          if (x.ok && x.j.lead) {
            upsertRow(x.j.lead);
            closeDrawer();
          }
        });
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });
})();
