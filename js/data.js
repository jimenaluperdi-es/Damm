const DAMM = {};

DAMM.ORIGIN = { name: 'DDI Mollet', lat: 41.543, lng: 2.215, address: 'Polígon Industrial, Mollet del Vallès' };

DAMM.clients = [
  { id: 1, name: 'Supermercat Mollet Centre', lat: 41.538, lng: 2.213, address: 'Carrer Major 12, Mollet', priority: 3, channel: 'Retail', timeWindow: { start: '07:00', end: '10:00' } },
  { id: 2, name: 'Bar Restaurante Nou', lat: 41.545, lng: 2.209, address: 'Rambla Nova 5, Mollet', priority: 2, channel: 'Horeca', timeWindow: { start: '08:00', end: '11:00' } },
  { id: 3, name: 'Distribucions Vallès', lat: 41.551, lng: 2.221, address: 'Polígon 3, Parets', priority: 3, channel: 'Mayorista', timeWindow: { start: '07:30', end: '12:00' } },
  { id: 4, name: 'Hotel Mollet Palace', lat: 41.536, lng: 2.218, address: 'Av. Caldes 45, Mollet', priority: 1, channel: 'Horeca', timeWindow: { start: '09:00', end: '13:00' } },
  { id: 5, name: 'Carnisseria Can Roca', lat: 41.542, lng: 2.207, address: 'Plaça 9, Mollet', priority: 2, channel: 'Retail', timeWindow: { start: '07:00', end: '09:30' } },
  { id: 6, name: 'Supermercat Granollers', lat: 41.608, lng: 2.288, address: 'Carrer Corró 23, Granollers', priority: 3, channel: 'Retail', timeWindow: { start: '08:00', end: '14:00' } },
  { id: 7, name: 'Restaurant Can Pucol', lat: 41.598, lng: 2.276, address: 'Camí Ral 8, Granollers', priority: 1, channel: 'Horeca', timeWindow: { start: '09:30', end: '12:30' } },
  { id: 8, name: 'Distribució Oriental', lat: 41.612, lng: 2.292, address: 'Polígon Congost, Granollers', priority: 2, channel: 'Mayorista', timeWindow: { start: '07:00', end: '11:00' } },
  { id: 9, name: 'Bar del Centre', lat: 41.554, lng: 2.247, address: 'Carrer Anselm 3, Montmeló', priority: 1, channel: 'Horeca', timeWindow: { start: '08:30', end: '12:00' } },
  { id: 10, name: 'Queviures Montmeló', lat: 41.551, lng: 2.246, address: 'Plaça Vila 1, Montmeló', priority: 2, channel: 'Retail', timeWindow: { start: '07:00', end: '10:00' } },
  { id: 11, name: 'Supermercat Parets', lat: 41.573, lng: 2.233, address: 'Av. Catalunya 14, Parets', priority: 3, channel: 'Retail', timeWindow: { start: '08:00', end: '13:00' } },
  { id: 12, name: 'Restaurant La Trobada', lat: 41.569, lng: 2.237, address: 'Carrer Pau 7, Parets', priority: 1, channel: 'Horeca', timeWindow: { start: '10:00', end: '14:00' } },
  { id: 13, name: 'Gelats i Begudes SL', lat: 41.535, lng: 2.226, address: 'Camí de Gallecs, Mollet', priority: 2, channel: 'Mayorista', timeWindow: { start: '07:00', end: '09:00' } },
  { id: 14, name: 'Xiringuito Estació', lat: 41.548, lng: 2.215, address: 'Estació Mollet, Mollet', priority: 1, channel: 'Horeca', timeWindow: { start: '09:00', end: '12:00' } },
  { id: 15, name: 'Cash & Carry Vallès', lat: 41.606, lng: 2.295, address: 'Polígon Palou, Granollers', priority: 3, channel: 'Mayorista', timeWindow: { start: '07:30', end: '11:30' } }
];

DAMM.products = [
  { id: 'P01', name: 'Estrella Damm 33cl botella', type: 'ZFIN', weight: 0.33, volume: 0.33, unitsPerPallet: 864, returnable: false },
  { id: 'P02', name: 'Estrella Damm 33cl lata', type: 'ZPLV', weight: 0.33, volume: 0.33, unitsPerPallet: 1080, returnable: false },
  { id: 'P03', name: 'Estrella Damm 20cl botella', type: 'ZFIN', weight: 0.20, volume: 0.20, unitsPerPallet: 1008, returnable: false },
  { id: 'P04', name: 'Estrella Damm 50cl botella', type: 'ZFIN', weight: 0.50, volume: 0.50, unitsPerPallet: 528, returnable: false },
  { id: 'P05', name: 'Estrella Damm 33cl pack 6', type: 'ZPLV', weight: 2.00, volume: 2.00, unitsPerPallet: 180, returnable: false },
  { id: 'P06', name: 'Damm Lemon 33cl lata', type: 'ZPLV', weight: 0.33, volume: 0.33, unitsPerPallet: 1080, returnable: false },
  { id: 'P07', name: 'Damm Limón 33cl botella', type: 'ZFIN', weight: 0.33, volume: 0.33, unitsPerPallet: 864, returnable: false },
  { id: 'P08', name: 'Voll-Damm 33cl botella', type: 'ZFIN', weight: 0.33, volume: 0.33, unitsPerPallet: 864, returnable: false },
  { id: 'P09', name: 'Free Damm 33cl lata', type: 'ZPLV', weight: 0.33, volume: 0.33, unitsPerPallet: 1080, returnable: false },
  { id: 'P10', name: 'Free Damm 33cl botella', type: 'ZFIN', weight: 0.33, volume: 0.33, unitsPerPallet: 864, returnable: false },
  { id: 'P11', name: 'Barril 30L Estrella', type: 'UMA', weight: 15.00, volume: 30.00, unitsPerPallet: 10, returnable: true },
  { id: 'P12', name: 'Barril 50L Estrella', type: 'UMA', weight: 25.00, volume: 50.00, unitsPerPallet: 6, returnable: true },
  { id: 'P13', name: 'Estrella Damm 20cl lata', type: 'ZPLV', weight: 0.20, volume: 0.20, unitsPerPallet: 1188, returnable: false },
  { id: 'P14', name: 'Damm Lemon 20cl botella', type: 'ZFIN', weight: 0.20, volume: 0.20, unitsPerPallet: 1008, returnable: false },
  { id: 'P15', name: 'Voll-Damm 50cl botella', type: 'ZFIN', weight: 0.50, volume: 0.50, unitsPerPallet: 528, returnable: false },
  { id: 'P16', name: 'Damm Limón 50cl botella', type: 'ZFIN', weight: 0.50, volume: 0.50, unitsPerPallet: 528, returnable: false },
  { id: 'P17', name: 'Estrella Damm 0,0 33cl lata', type: 'ZPLV', weight: 0.33, volume: 0.33, unitsPerPallet: 1080, returnable: false },
  { id: 'P18', name: 'Barril 20L Estrella', type: 'UMA', weight: 10.00, volume: 20.00, unitsPerPallet: 12, returnable: true },
  { id: 'P19', name: 'Palet vacío retornable', type: 'UMA', weight: 5.00, volume: 0.00, unitsPerPallet: 1, returnable: true, isReturn: true },
  { id: 'P20', name: 'Envase vidrio vacío', type: 'ZFIN', weight: 8.00, volume: 0.00, unitsPerPallet: 48, returnable: true, isReturn: true }
];

DAMM.orders = [];
DAMM.returns = [];
DAMM.currentRoute = null;
DAMM.currentLoad = null;

DAMM.generateSampleOrders = function () {
  const orders = [];
  DAMM.clients.forEach(client => {
    const numItems = 2 + Math.floor(Math.random() * 5);
    const shuffled = [...DAMM.products].filter(p => !p.isReturn).sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(numItems, shuffled.length); i++) {
      const qty = 10 + Math.floor(Math.random() * 50) * 5;
      orders.push({ clientId: client.id, productId: shuffled[i].id, quantity: qty });
    }
  });
  DAMM.orders = orders;
  return orders;
};

DAMM.generateSampleReturns = function () {
  const returns = [];
  DAMM.clients.slice(0, 6).forEach(client => {
    const numItems = 1 + Math.floor(Math.random() * 3);
    const returnables = DAMM.products.filter(p => p.returnable);
    for (let i = 0; i < Math.min(numItems, returnables.length); i++) {
      const qty = 1 + Math.floor(Math.random() * 4);
      returns.push({ clientId: client.id, productId: returnables[i].id, quantity: qty });
    }
  });
  DAMM.returns = returns;
  return returns;
};

DAMM.parseCSV = function (text, type) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(',').map(v => v.trim());
    if (vals.length !== headers.length || vals.every(v => !v)) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx]; });
    results.push(row);
  }
  if (type === 'clients') {
    results.forEach(r => {
      if (r.lat && r.lng) {
        DAMM.clients.push({
          id: DAMM.clients.length + 1,
          name: r.name || r.nombre || 'Unknown',
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lng),
          address: r.address || r.direccion || '',
          priority: parseInt(r.priority) || 2,
          channel: r.channel || r.canal || 'Retail',
          timeWindow: { start: r.window_start || '07:00', end: r.window_end || '14:00' }
        });
      }
    });
  } else if (type === 'products') {
    results.forEach(r => {
      DAMM.products.push({
        id: 'P' + (DAMM.products.length + 1).toString().padStart(2, '0'),
        name: r.name || r.nombre || 'Unknown',
        type: r.type || r.tipo || 'ZPLV',
        weight: parseFloat(r.weight) || 0.33,
        volume: parseFloat(r.volume) || 0.33,
        unitsPerPallet: parseInt(r.units_per_pallet) || 864,
        returnable: (r.returnable || '').toLowerCase() === 'true'
      });
    });
  }
  return results;
};

DAMM.getProduct = function (id) { return DAMM.products.find(p => p.id === id); };
DAMM.getClient = function (id) { return DAMM.clients.find(c => c.id === id); };
DAMM.getClientOrders = function (clientId) { return DAMM.orders.filter(o => o.clientId === clientId); };
DAMM.getClientReturns = function (clientId) { return DAMM.returns.filter(r => r.clientId === clientId); };

DAMM.generateSampleOrders();
DAMM.generateSampleReturns();
