const APP = {};

APP.tabs = function () {
  const tabs = document.querySelectorAll('.tab[data-tab]');
  const panels = {
    dashboard: document.getElementById('panel-dashboard'),
    routes: document.getElementById('panel-routes'),
    load: document.getElementById('panel-load'),
    reverselog: document.getElementById('panel-reverselog'),
    recommendations: document.getElementById('panel-recommendations'),
    data: document.getElementById('panel-data')
  };
  const dataTabs = document.querySelectorAll('.data-tab[data-dtab]');

  tabs.forEach(tab => {
    tab.addEventListener('click', function () {
      const target = this.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      Object.entries(panels).forEach(([key, el]) => {
        if (el) el.classList.toggle('active', key === target);
      });
      if (target === 'dashboard') APP.renderDashboard();
      if (target === 'data') APP.renderDataTable('clients');
      setTimeout(() => { if (target === 'routes' && APP.routeMap) APP.routeMap.invalidateSize(); }, 100);
    });
  });

  dataTabs.forEach(tab => {
    tab.addEventListener('click', function () {
      dataTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      APP.renderDataTable(this.dataset.dtab);
    });
  });
};

APP.initCharts = function () {
  const chartOpts = (type, data, opts) => ({ type, data, options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12, font: { size: 11 } } } }, ...opts } });

  const channelCtx = document.getElementById('chart-channel');
  if (channelCtx) {
    const channels = {};
    DAMM.clients.forEach(c => { channels[c.channel] = (channels[c.channel] || 0) + 1; });
    APP.chartChannel = new Chart(channelCtx, chartOpts('doughnut', {
      labels: Object.keys(channels), datasets: [{ data: Object.values(channels), backgroundColor: ['#C41230', '#D4A017', '#1A1A1A'] }]
    }));
  }

  const mixCtx = document.getElementById('chart-product-mix');
  if (mixCtx) {
    const types = {};
    DAMM.products.forEach(p => { types[p.type] = (types[p.type] || 0) + 1; });
    APP.chartMix = new Chart(mixCtx, chartOpts('pie', {
      labels: Object.keys(types), datasets: [{ data: Object.values(types), backgroundColor: ['#DC2626', '#2563EB', '#16A34A'] }]
    }));
  }

  const twCtx = document.getElementById('chart-timewindows');
  if (twCtx) {
    const windows = {};
    DAMM.clients.forEach(c => {
      const label = `${c.timeWindow.start}-${c.timeWindow.end}`;
      windows[label] = (windows[label] || 0) + 1;
    });
    APP.chartTW = new Chart(twCtx, chartOpts('bar', {
      labels: Object.keys(windows), datasets: [{ label: 'Clientes', data: Object.values(windows), backgroundColor: '#C41230' }]
    }, { scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }));
  }
};

APP.initMap = function () {
  const el = document.getElementById('routeMap');
  if (!el) return;
  APP.routeMap = L.map('routeMap').setView([DAMM.ORIGIN.lat, DAMM.ORIGIN.lng], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(APP.routeMap);
  APP.markerOrigin = L.circleMarker([DAMM.ORIGIN.lat, DAMM.ORIGIN.lng], { radius: 10, color: '#C41230', fillColor: '#C41230', fillOpacity: 0.8 }).addTo(APP.routeMap).bindTooltip('DDI Mollet');
};

APP.renderDashboard = function () {
  document.getElementById('kpi-clients').textContent = DAMM.clients.length;
  document.getElementById('kpi-products').textContent = DAMM.products.length;
  const totalOrders = DAMM.orders.length;
  const totalQty = DAMM.orders.reduce((s, o) => s + o.quantity, 0);
  document.getElementById('kpi-stops').textContent = totalOrders;
  document.getElementById('kpi-pallets').textContent = Math.ceil(totalQty / 500);
  if (DAMM.currentRoute) {
    document.getElementById('kpi-distance').textContent = DAMM.currentRoute.totalDistance.toFixed(1) + ' km';
    document.getElementById('kpi-load').textContent = DAMM.currentLoad ? DAMM.currentLoad.metrics.utilization.toFixed(0) + '%' : '—';
  }
  const recSummary = document.getElementById('dashboard-rec-summary');
  if (recSummary && DAMM.currentRoute) {
    const recs = APP.generateRecommendations(DAMM.currentRoute, DAMM.currentLoad);
    if (recs.length > 0) {
      recSummary.innerHTML = `<div class="small">${recs.slice(0, 3).map(r => `<div class="d-flex align-items-center gap-2 mb-1"><span class="badge ${r.impact}">${r.impact === 'high' ? 'Alto' : r.impact === 'medium' ? 'Medio' : 'Bajo'}</span> <span>${r.title}</span></div>`).join('')}</div>`;
    }
  }
};

APP.renderRoute = function (route) {
  if (APP.routeMarkers) APP.routeMarkers.forEach(m => APP.routeMap.removeLayer(m));
  if (APP.routeLine) APP.routeMap.removeLayer(APP.routeLine);

  const markers = [];
  APP.markerOrigin = L.circleMarker([DAMM.ORIGIN.lat, DAMM.ORIGIN.lng], { radius: 10, color: '#C41230', fillColor: '#C41230', fillOpacity: 0.8 }).addTo(APP.routeMap).bindTooltip('DDI Mollet');

  route.stops.forEach((s, i) => {
    if (!s.client) return;
    const marker = L.circleMarker([s.client.lat, s.client.lng], {
      radius: 8, color: '#D4A017', fillColor: '#D4A017', fillOpacity: 0.8
    }).addTo(APP.routeMap).bindTooltip(`<b>${s.client.name}</b><br>Llegada: ${s.arrivalTime}<br>Dist: ${s.distance.toFixed(1)} km`);
    markers.push(marker);

    const icon = L.divIcon({ html: `<div style="background:#C41230;color:#fff;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${i + 1}</div>`, className: '', iconSize: [22, 22] });
    const numMarker = L.marker([s.client.lat, s.client.lng], { icon }).addTo(APP.routeMap);
    markers.push(numMarker);
  });

  const coords = ROUTE.getRouteLine(route);
  APP.routeLine = L.polyline(coords, { color: '#C41230', weight: 3, opacity: 0.7 }).addTo(APP.routeMap);
  APP.routeMarkers = markers;
  APP.routeMap.fitBounds(ROUTE.getRouteBounds(route), { padding: [30, 30] });

  const stopList = document.getElementById('routeStopList');
  let html = '';
  route.stops.forEach((s, i) => {
    if (!s.client) {
      html += `<div class="stop-item" style="border-left:3px solid var(--damm-red);background:var(--damm-red-lighter)"><span class="stop-order">←</span><span class="stop-name fw-bold">${DAMM.ORIGIN.name}</span><span class="stop-time">${s.arrivalTime}</span></div>`;
      return;
    }
    const isHigh = s.client.priority === 1;
    html += `<div class="stop-item ${isHigh ? 'high-priority' : ''}">
      <span class="stop-order">${i + 1}</span>
      <span class="stop-name">${s.client.name}</span>
      <span class="stop-time">${s.arrivalTime} (${s.distance.toFixed(1)} km)</span>
    </div>`;
  });
  stopList.innerHTML = html;

  const metrics = document.getElementById('routeMetrics');
  metrics.style.display = 'block';
  const totalHours = (route.totalTime / 60).toFixed(1);
  document.getElementById('routeMetricsContent').innerHTML = `
    <div class="metric"><span class="val">${route.totalDistance.toFixed(1)} km</span><span class="lbl">Distancia Total</span></div>
    <div class="metric"><span class="val">${route.numStops}</span><span class="lbl">Paradas</span></div>
    <div class="metric"><span class="val">${totalHours}h</span><span class="lbl">Tiempo Total</span></div>
    <div class="metric"><span class="val">${(route.totalDistance / route.numStops).toFixed(1)} km</span><span class="lbl">Media/Parada</span></div>`;

  document.getElementById('runRouteBtn').style.display = 'none';
  document.getElementById('editRouteBtn').style.display = 'inline-flex';
  DAMM.currentRoute = route;
  APP.renderDashboard();
};

APP.renderLoad = function (loadResult) {
  LOAD.renderTruckTopView(loadResult, 'truckTopView');
  LOAD.renderLegend('truckLegend');
  LOAD.renderSideCanvas(loadResult, 'truckSideCanvas');
  LOAD.renderMetrics(loadResult, 'loadMetricsContent');
  LOAD.renderPalletDetail(loadResult, 'loadPalletList');
  DAMM.currentLoad = loadResult;
  APP.renderDashboard();
};

APP.renderDataTable = function (dtab) {
  const container = document.getElementById('dataTableContainer');
  let data, columns;
  if (dtab === 'clients') {
    data = DAMM.clients;
    columns = ['id', 'name', 'address', 'channel', 'priority', 'timeWindow'];
  } else if (dtab === 'products') {
    data = DAMM.products;
    columns = ['id', 'name', 'type', 'unitsPerPallet', 'returnable'];
  } else if (dtab === 'orders') {
    data = DAMM.orders;
    columns = ['clientId', 'productId', 'quantity'];
  } else if (dtab === 'returns') {
    data = DAMM.returns;
    columns = ['clientId', 'productId', 'quantity'];
  } else { container.innerHTML = ''; return; }

  if (!data || data.length === 0) {
    container.innerHTML = '<p class="text-muted text-center py-4 mb-0">No hay datos disponibles.</p>';
    return;
  }

  let html = '<div class="table-wrap"><table><thead><tr>';
  columns.forEach(c => { html += `<th>${c.charAt(0).toUpperCase() + c.slice(1)}</th>`; });
  html += '</tr></thead><tbody>';
  data.slice(0, 100).forEach(row => {
    html += '<tr>';
    columns.forEach(c => {
      let val = row[c];
      if (c === 'timeWindow' && typeof val === 'object') val = `${val.start}-${val.end}`;
      if (c === 'returnable') val = val ? 'Sí' : 'No';
      if (c === 'clientId') val = (DAMM.getClient(val) || {}).name || val;
      if (c === 'productId') val = (DAMM.getProduct(val) || {}).name || val;
      html += `<td>${val != null ? val : ''}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  container.innerHTML = html;
};

APP.generateRecommendations = function (route, loadResult) {
  const recs = [];
  if (!route) return recs;

  if (route.totalDistance > 60) recs.push({ title: 'Ruta larga detectada', desc: 'La distancia total supera los 60 km. Considere dividir en dos rutas.', impact: 'high', explain: 'Rutas >60 km incrementan coste de combustible y desgaste.' });
  if (route.numStops > 8) recs.push({ title: 'Muchas paradas en ruta', desc: `${route.numStops} paradas pueden causar retrasos. Agrupe clientes cercanos.`, impact: 'medium', explain: 'Cada parada añade ~10 min de descarga.' });

  if (loadResult && loadResult.metrics) {
    const util = loadResult.metrics.utilization;
    if (util < 50) recs.push({ title: 'Baja ocupación del camión', desc: `Solo ${util.toFixed(0)}% ocupado. Use un vehículo más pequeño.`, impact: 'high', explain: 'Camiones infrautilizados aumentan coste por unidad.' });
    if (util > 95) recs.push({ title: 'Ocupación crítica', desc: `${util.toFixed(0)}% de ocupación. Riesgo de carga incompleta.`, impact: 'medium', explain: 'Alta ocupación puede causar problemas de estabilidad en carga.' });
  }

  const urgentClients = route.stops.filter(s => s.client && s.client.priority === 1);
  if (urgentClients.length > 2) recs.push({ title: 'Clientes prioritarios', desc: `${urgentClients.length} clientes prioritarios en ruta. Priorice su atención.`, impact: 'high', explain: 'Clientes prioritarios requieren ventana horaria estricta.' });

  const amStops = route.stops.filter(s => s.client && parseInt(s.arrivalTime) < 12).length;
  if (amStops < 3) recs.push({ title: 'Distribución mañana-tarde', desc: 'Pocas paradas antes del mediodía. Ajuste el orden de visitas.', impact: 'low', explain: 'Distribuir paradas mejora eficiencia del conductor.' });

  const retClients = new Set(DAMM.returns.map(r => r.clientId));
  if (retClients.size > 0) recs.push({ title: 'Retornos integrados', desc: `${retClients.size} clientes con retornos programados.`, impact: 'medium', explain: 'Integrar retornos reduce viajes adicionales.' });

  return recs;
};

APP.renderRecommendations = function () {
  const route = DAMM.currentRoute;
  const load = DAMM.currentLoad;
  const list = document.getElementById('recommendationsList');
  const recs = APP.generateRecommendations(route, load);

  if (recs.length === 0) {
    list.innerHTML = '<p class="text-muted text-center py-5 mb-0">Optimice la ruta primero para generar recomendaciones.</p>';
    return;
  }

  let html = '';
  recs.forEach(r => {
    html += `<div class="rec-card ${r.impact}">
      <span class="rec-impact ${r.impact}">${r.impact === 'high' ? 'Alto' : r.impact === 'medium' ? 'Medio' : 'Bajo'}</span>
      <div class="rec-title">${r.title}</div>
      <div class="rec-desc">${r.desc}</div>
      <div class="rec-explain"><strong>Por qué:</strong> ${r.explain}</div>
    </div>`;
  });
  list.innerHTML = html;
};

APP.showModal = function (title, bodyHtml) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  document.getElementById('modal-overlay').classList.remove('hidden');
};

APP.hideModal = function () {
  document.getElementById('modal-overlay').classList.add('hidden');
};

APP.initEvents = function () {
  document.getElementById('modal-close').addEventListener('click', APP.hideModal);
  document.getElementById('modal-overlay').addEventListener('click', function (e) {
    if (e.target === this) APP.hideModal();
  });

  document.getElementById('runRouteBtn').addEventListener('click', function () {
    const priority = document.getElementById('route-priority').value;
    const departure = document.getElementById('route-departure').value || '06:00';
    const route = ROUTE.calculate(priority, departure);
    APP.renderRoute(route);
    document.getElementById('editRouteBtn').style.display = 'inline-flex';
    this.style.display = 'none';
  });

  document.getElementById('editRouteBtn').addEventListener('click', function () {
    const items = document.querySelectorAll('#routeStopList .stop-item');
    items.forEach((el, i) => {
      if (i < items.length - 1) {
        el.draggable = true;
        el.style.cursor = 'grab';
        const handle = el.querySelector('.stop-drag-handle') || (() => { const h = document.createElement('span'); h.className = 'stop-drag-handle'; h.innerHTML = '⠿'; el.prepend(h); return h; })();
        handle.style.visibility = 'visible';
      }
    });
    document.getElementById('routeEditBadge').style.display = 'inline';
    this.style.display = 'none';
    document.getElementById('saveRouteBtn').style.display = 'inline-flex';
  });

  document.getElementById('saveRouteBtn').addEventListener('click', function () {
    document.querySelectorAll('#routeStopList .stop-item').forEach(el => { el.draggable = false; el.style.cursor = 'default'; const h = el.querySelector('.stop-drag-handle'); if (h) h.style.visibility = 'hidden'; });
    document.getElementById('routeEditBadge').style.display = 'none';
    this.style.display = 'none';
    document.getElementById('editRouteBtn').style.display = 'inline-flex';
    APP.showModal('Ruta guardada', '<p class="mb-0">Los cambios en la ruta se han guardado correctamente.</p>');
  });

  document.getElementById('runLoadBtn').addEventListener('click', function () {
    if (!DAMM.currentRoute) {
      APP.showModal('Atención', '<p class="mb-0">Debe calcular la ruta primero antes de optimizar la carga.</p>');
      return;
    }
    const mode = document.getElementById('load-mode').value;
    const vehicle = document.getElementById('load-vehicle').value;
    const loadResult = LOAD.calculate(mode, vehicle, DAMM.currentRoute);
    APP.renderLoad(loadResult);
  });

  document.getElementById('generateRecsBtn').addEventListener('click', APP.renderRecommendations);

  document.getElementById('loadSampleBtn').addEventListener('click', function () {
    DAMM.generateSampleOrders();
    DAMM.generateSampleReturns();
    APP.renderDataTable('clients');
    APP.renderDashboard();
    APP.showModal('Datos cargados', '<p class="mb-0">Se han cargado datos de ejemplo (clientes, productos, pedidos y retornos).</p>');
  });

  document.getElementById('importBtn').addEventListener('click', function () {
    APP.showModal('Importar CSV', `
      <p>Seleccione el tipo de datos a importar:</p>
      <div class="d-flex gap-2 mb-3">
        <button class="btn btn-sm btn-outline-secondary" onclick="document.getElementById('csvClientInput').click()">Clientes</button>
        <button class="btn btn-sm btn-outline-secondary" onclick="document.getElementById('csvProductInput').click()">Productos</button>
      </div>
      <p class="small text-secondary">Formato: CSV con cabeceras. Para clientes: name,lat,lng,address,priority,channel. Para productos: name,type,weight,volume,units_per_pallet.</p>
    `);
  });

  document.getElementById('csvClientInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      DAMM.parseCSV(ev.target.result, 'clients');
      APP.renderDataTable('clients');
      APP.renderDashboard();
      APP.hideModal();
      APP.showModal('Importación exitosa', `<p class="mb-0">Se importaron clientes correctamente.</p>`);
    };
    reader.readAsText(file);
    this.value = '';
  });

  document.getElementById('csvProductInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      DAMM.parseCSV(ev.target.result, 'products');
      APP.renderDataTable('products');
      APP.renderDashboard();
      APP.hideModal();
      APP.showModal('Importación exitosa', `<p class="mb-0">Se importaron productos correctamente.</p>`);
    };
    reader.readAsText(file);
    this.value = '';
  });

  const optimizeBtn = document.getElementById('optimizeBtn');
  if (optimizeBtn) {
    optimizeBtn.addEventListener('click', function () {
      const route = ROUTE.calculate('balanced', '06:00');
      APP.renderRoute(route);
      const loadResult = LOAD.calculate('hybrid', 'standard', route);
      APP.renderLoad(loadResult);
      APP.showModal('Optimización completa', '<p class="mb-0">Ruta y carga optimizadas con configuración balanceada.</p>');
    });
  }
};

APP.init = function () {
  const params = new URLSearchParams(window.location.search);
  const role = params.get('role') || 'admin';
  APP.currentRole = role;

  const roleLabels = { warehouse: 'Almacén', carrier: 'Transportista', admin: 'Admin' };
  const roleIcons = { warehouse: 'fa-warehouse', carrier: 'fa-truck', admin: 'fa-crown' };

  const brandSubtitle = document.querySelector('.subtitle');
  if (brandSubtitle && roleLabels[role]) {
    brandSubtitle.textContent = `${roleLabels[role]} · Logistic Optimizer`;
  }

  const panelLabels = { warehouse: ['load', 'data'], carrier: ['dashboard', 'routes', 'reverselog'], admin: ['dashboard', 'routes', 'load', 'reverselog', 'recommendations', 'data'] };
  const visibleTabs = panelLabels[role] || panelLabels.admin;

  document.querySelectorAll('.tab[data-tab]').forEach(tab => {
    const isVisible = visibleTabs.includes(tab.dataset.tab);
    tab.style.display = isVisible ? 'flex' : 'none';
  });

  const firstTab = document.querySelector(`.tab[data-tab="${visibleTabs[0]}"]`);
  if (firstTab) firstTab.click();

  APP.tabs();
  APP.initCharts();
  APP.initMap();
  APP.initEvents();
  APP.renderDashboard();
  APP.renderDataTable('clients');
};

document.addEventListener('DOMContentLoaded', APP.init);
