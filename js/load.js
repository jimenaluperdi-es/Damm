const LOAD = {};

LOAD.VEHICLES = {
  standard: { name: 'Camión 13.6m', pallets: 33, length: 13.6 },
  medium: { name: 'Camión 10m', pallets: 24, length: 10 },
  small: { name: 'Camión 7m', pallets: 16, length: 7 }
};

LOAD.TYPE_COLORS = {
  ZFIN: { bg: '#DC2626', label: 'Vidrio' },
  ZPLV: { bg: '#2563EB', label: 'Lata' },
  UMA: { bg: '#16A34A', label: 'Otros' }
};

LOAD.calculate = function (mode, vehicleKey, route) {
  const vehicle = LOAD.VEHICLES[vehicleKey];
  if (!route || !route.stops) return null;

  const stopClients = route.stops.filter(s => s.client).map(s => s.client);
  const deliveryOrder = [...stopClients];

  if (mode === 'client') {
  } else if (mode === 'reference') {
    deliveryOrder.sort((a, b) => a.name.localeCompare(b.name));
  }

  const pallets = [];
  const visited = new Set();

  const reverseOrder = [...deliveryOrder].reverse();
  for (const client of reverseOrder) {
    const orders = DAMM.getClientOrders(client.id);
    const grouped = {};
    orders.forEach(o => {
      const prod = DAMM.getProduct(o.productId);
      if (!prod) return;
      const key = prod.type;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(o);
    });

    for (const [type, items] of Object.entries(grouped)) {
      let totalUnits = items.reduce((sum, o) => sum + o.quantity, 0);
      const prod = DAMM.getProduct(items[0].productId);
      const unitsPerPallet = prod ? prod.unitsPerPallet : 864;
      const numPallets = Math.max(1, Math.ceil(totalUnits / unitsPerPallet));

      for (let i = 0; i < numPallets && pallets.length < vehicle.pallets; i++) {
        const unitsInThis = Math.min(unitsPerPallet, totalUnits);
        totalUnits -= unitsInThis;
        pallets.push({
          clientId: client.id,
          clientName: client.name,
          type: type,
          units: unitsInThis,
          unloadOrder: pallets.length + 1,
          color: LOAD.TYPE_COLORS[type] ? LOAD.TYPE_COLORS[type].bg : '#6B7280',
          label: LOAD.TYPE_COLORS[type] ? LOAD.TYPE_COLORS[type].label : type
        });
      }
    }

    const returns = DAMM.getClientReturns(client.id);
    returns.forEach(r => {
      const prod = DAMM.getProduct(r.productId);
      if (!prod) return;
      for (let i = 0; i < r.quantity && pallets.length < vehicle.pallets; i++) {
        pallets.push({
          clientId: client.id,
          clientName: client.name + ' (ret)',
          type: 'RET',
          units: 1,
          unloadOrder: pallets.length + 1,
          color: '#9333EA',
          label: 'Retorno'
        });
      }
    });
  }

  const metrics = {
    usedPallets: pallets.length,
    totalPallets: vehicle.pallets,
    utilization: vehicle.pallets > 0 ? (pallets.length / vehicle.pallets * 100) : 0,
    numStops: deliveryOrder.length,
    vehicleName: vehicle.name
  };

  return { pallets, metrics, vehicle, deliveryOrder, mode };
};

LOAD.renderTruckTopView = function (loadResult, containerId) {
  const container = document.getElementById(containerId);
  if (!loadResult || !loadResult.pallets || loadResult.pallets.length === 0) {
    container.innerHTML = '<p class="text-muted text-center py-4 mb-0">Calcule la carga para ver la disposición.</p>';
    return;
  }

  let html = '';
  loadResult.pallets.forEach((p, i) => {
    html += `<div class="pallet-cell" style="background:${p.color}22;border-color:${p.color}" title="${p.clientName} - ${p.label} (${p.units} uds)">
      <span class="pallet-qty" style="color:${p.color}">${p.units}</span>
      <span class="pallet-label">${p.label}</span>
      <span class="unload-order" style="background:${p.color}">${i + 1}</span>
    </div>`;
  });

  for (let i = loadResult.pallets.length; i < loadResult.vehicle.pallets; i++) {
    html += `<div class="pallet-cell" style="border:1.5px dashed var(--gray-300);background:transparent;opacity:0.5">
      <span class="pallet-label" style="color:var(--gray-400)">Vacío</span>
    </div>`;
  }

  container.innerHTML = html;
};

LOAD.renderLegend = function (containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  let html = '';
  for (const [key, val] of Object.entries(LOAD.TYPE_COLORS)) {
    html += `<span class="legend-item"><span class="legend-color" style="background:${val.bg}"></span> ${val.label}</span>`;
  }
  html += `<span class="legend-item"><span class="legend-color" style="background:#9333EA"></span> Retorno</span>`;
  container.innerHTML = html;
};

LOAD.renderSideCanvas = function (loadResult, canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width || 600;
  const H = canvas.height || 200;
  ctx.clearRect(0, 0, W, H);

  if (!loadResult || !loadResult.pallets || loadResult.pallets.length === 0) {
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Calcule la carga para ver la vista lateral', W / 2, H / 2);
    return;
  }

  const pallets = loadResult.pallets;
  const total = loadResult.vehicle.pallets;
  const cols = Math.ceil(total / 2);
  const cellW = (W - 40) / cols;
  const cellH = (H - 30) / 2;

  pallets.forEach((p, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = 20 + col * cellW;
    const y = 10 + row * cellH;
    ctx.fillStyle = p.color + '44';
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, cellW - 2, cellH - 2);
    ctx.strokeRect(x, y, cellW - 2, cellH - 2);
    ctx.fillStyle = p.color;
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${i + 1}`, x + cellW / 2, y + cellH / 2 + 3);
  });

  for (let i = pallets.length; i < total; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = 20 + col * cellW;
    const y = 10 + row * cellH;
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x, y, cellW - 2, cellH - 2);
    ctx.setLineDash([]);
  }
};

LOAD.renderPalletDetail = function (loadResult, containerId) {
  const container = document.getElementById(containerId);
  if (!loadResult || !loadResult.pallets || loadResult.pallets.length === 0) {
    container.innerHTML = '<p class="text-muted text-center py-4 mb-0">Calcule la carga para ver el detalle.</p>';
    return;
  }

  const byClient = {};
  loadResult.pallets.forEach(p => {
    if (!byClient[p.clientName]) byClient[p.clientName] = [];
    byClient[p.clientName].push(p);
  });

  let html = '';
  for (const [client, pallets] of Object.entries(byClient)) {
    html += `<div class="pallet-group"><h6>${client}</h6><table><tr><th>#</th><th>Tipo</th><th>Unidades</th><th>Orden descarga</th></tr>`;
    pallets.forEach(p => {
      html += `<tr><td>${p.unloadOrder}</td><td><span style="color:${p.color};font-weight:700">${p.label}</span></td><td>${p.units}</td><td>${p.unloadOrder}</td></tr>`;
    });
    html += `</table></div>`;
  }
  container.innerHTML = html;
};

LOAD.renderMetrics = function (loadResult, containerId) {
  const container = document.getElementById(containerId);
  if (!loadResult) {
    container.innerHTML = '<p class="text-muted text-center py-3 mb-0">Calcule la carga para ver métricas.</p>';
    return;
  }
  const m = loadResult.metrics;
  const html = `
    <div class="d-flex gap-4 flex-wrap">
      <div class="metric"><span class="val" style="color:var(--damm-red)">${m.usedPallets}/${m.totalPallets}</span><span class="lbl">Pallets</span></div>
      <div class="metric"><span class="val" style="color:var(--damm-gold)">${m.utilization.toFixed(1)}%</span><span class="lbl">Ocupación</span></div>
      <div class="metric"><span class="val" style="color:var(--damm-red)">${m.numStops}</span><span class="lbl">Paradas</span></div>
      <div class="metric"><span class="val" style="color:var(--damm-dark)">${m.vehicleName}</span><span class="lbl">Vehículo</span></div>
    </div>`;
  container.innerHTML = html;
};
