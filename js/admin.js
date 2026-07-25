/* ==========================================================================
   admin.js — product management, availability toggling, orders and settings
   Used by admin.html. Reads/writes via window.Store (localStorage), so any
   change here is reflected on customer.html the next time it loads.
   ========================================================================== */

window.Admin = (function () {
  const S = window.Store;
  let selectedEmoji = '🍅';

  /* ---------- stats ---------- */
  function renderStats(){
    const products = S.getProducts();
    const orders = S.getOrders();
    const total = products.length;
    const available = products.filter(p=>p.available).length;
    const revenue = orders.reduce((s,o)=>s+o.total,0);
    document.getElementById('adminStats').innerHTML = `
      <div class="stat-card"><span>Total products</span><strong>${total}</strong></div>
      <div class="stat-card"><span>In stock</span><strong>${available}</strong></div>
      <div class="stat-card"><span>Orders (all time)</span><strong>${orders.length}</strong></div>
      <div class="stat-card"><span>Revenue (all time)</span><strong>${S.money(revenue)}</strong></div>
    `;
  }

  /* ---------- product table ---------- */
  function renderProducts(){
    const products = S.getProducts();
    document.getElementById('productTableCount').textContent = products.length + ' products';
    const body = document.getElementById('adminProductBody');
    body.innerHTML = products.map(p=>{
      const visual = p.image ? `<img src="${S.escapeHtml(p.image)}" alt="">` : p.emoji;
      return `
      <tr class="${!p.available?'unavailable-row':''}">
        <td class="p-emoji-cell" data-label="Icon">${visual}</td>
        <td class="p-name-cell" data-label="Product"><strong>${S.escapeHtml(p.name)}</strong><small>${S.escapeHtml(p.unit)}</small></td>
        <td data-label="Category">${S.categoryLabels[p.category]||p.category}</td>
        <td data-label="Price">
          <span style="display:flex;align-items:center;gap:4px;">₵
            <input class="price-input" type="number" min="0" step="0.5" value="${p.price}" data-action="price" data-id="${p.id}">
          </span>
        </td>
        <td data-label="Status">
          <button class="toggle ${p.available?'on':''}" data-action="toggle" data-id="${p.id}" aria-label="Toggle availability" title="${p.available?'In stock — click to mark unavailable':'Unavailable — click to mark in stock'}"></button>
          <span class="badge ${p.available?'in':'out'}" style="margin-left:8px;">${p.available?'In stock':'Sold out'}</span>
        </td>
        <td data-label="">
          <div class="row-actions">
            <button class="mini-btn danger" data-action="delete" data-id="${p.id}" aria-label="Remove product" title="Remove product">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6M14 11v6"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
    }).join('');

    body.querySelectorAll('[data-action="price"]').forEach(inp=>{
      inp.addEventListener('change', ()=>{
        const products = S.getProducts();
        const p = products.find(p=>p.id===inp.dataset.id);
        const val = parseFloat(inp.value);
        if(!p || isNaN(val) || val<0) return;
        p.price = val;
        S.saveProducts(products);
        S.showToast(`Updated price for ${p.name}`);
      });
    });
    body.querySelectorAll('[data-action="toggle"]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const products = S.getProducts();
        const p = products.find(p=>p.id===btn.dataset.id);
        if(!p) return;
        p.available = !p.available;
        S.saveProducts(products);
        renderProducts(); renderStats();
        S.showToast(`${p.name} marked as ${p.available?'in stock':'sold out'}`);
      });
    });
    body.querySelectorAll('[data-action="delete"]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const products = S.getProducts();
        const p = products.find(p=>p.id===btn.dataset.id);
        if(!p) return;
        const updated = products.filter(x=>x.id!==p.id);
        S.saveProducts(updated);
        const cart = S.getCart();
        if(cart[p.id]){ delete cart[p.id]; S.saveCart(cart); }
        renderProducts(); renderStats();
        S.showToast(`${p.name} removed from catalogue`);
      });
    });
  }

  /* ---------- add product ---------- */
  function renderEmojiSelect(){
    const el = document.getElementById('emojiSelect');
    el.innerHTML = S.emojiBank.map(e=>`<button type="button" class="emoji-opt ${e===selectedEmoji?'selected':''}" data-emoji="${e}">${e}</button>`).join('');
    el.querySelectorAll('.emoji-opt').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        selectedEmoji = btn.dataset.emoji;
        el.querySelectorAll('.emoji-opt').forEach(b=>b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  }

  function handleAddProduct(e){
    e.preventDefault();
    const name = document.getElementById('npName').value.trim();
    const category = document.getElementById('npCategory').value;
    const price = parseFloat(document.getElementById('npPrice').value);
    const unit = document.getElementById('npUnit').value.trim() || 'kg';
    const imageUrl = document.getElementById('npImage') ? document.getElementById('npImage').value.trim() : '';
    if(!name || isNaN(price) || price<0){ S.showToast('Please fill in the product details'); return; }

    const products = S.getProducts();
    const id = 'p' + Date.now();
    products.push({ id, name, category, price, unit, emoji: selectedEmoji, image: imageUrl, available:true });
    S.saveProducts(products);

    e.target.reset();
    document.getElementById('npUnit').value = 'kg';
    renderProducts(); renderStats();
    document.dispatchEvent(new CustomEvent('catalogue:changed'));
    S.showToast(`${name} added to your catalogue`);
  }

  /* ---------- orders ---------- */
  function renderOrders(){
    const orders = S.getOrders();
    document.getElementById('orderCountLabel').textContent = orders.length + (orders.length===1?' order':' orders');
    const list = document.getElementById('ordersList');
    if(orders.length===0){
      list.innerHTML = `<div class="order-empty"><div class="big">📭</div><strong style="font-family:var(--font-display);font-size:18px;">No orders yet</strong><div style="margin-top:6px;">Orders placed by customers will show up here.</div></div>`;
      return;
    }
    list.innerHTML = orders.map(o=>`
      <div class="order-card">
        <div class="order-card-head">
          <div>
            <strong>${S.escapeHtml(o.name)}</strong>
            <small>${new Date(o.timestamp).toLocaleString()}</small>
          </div>
          <span class="badge in">Order #${String(o.id).padStart(4,'0')}</span>
        </div>
        <div class="order-meta">
          <span>📞 <b>${S.escapeHtml(o.phone)}</b></span>
          <span>📍 <b>${S.escapeHtml(o.location)}</b></span>
          ${o.notes ? `<span>📝 <b>${S.escapeHtml(o.notes)}</b></span>` : ''}
        </div>
        <div class="order-items">
          ${o.items.map(it=>`<div><span>${S.escapeHtml(it.name)} × ${it.qty} ${S.escapeHtml(it.unit)}</span><span>${S.money(it.price*it.qty)}</span></div>`).join('')}
          <div class="total-line"><span>Total</span><span>${S.money(o.total)}</span></div>
        </div>
      </div>
    `).join('');
  }

  /* ---------- settings ---------- */
  function populateSettingsForm(){
    const biz = S.getBusiness();
    document.getElementById('setName').value = biz.name;
    document.getElementById('setTagline').value = biz.tagline;
    document.getElementById('setPhone').value = biz.phone;
  }

  function handleSaveSettings(e){
    e.preventDefault();
    const biz = S.getBusiness();
    const newName = document.getElementById('setName').value.trim() || biz.name;
    const newTagline = document.getElementById('setTagline').value.trim() || biz.tagline;
    const newPhone = document.getElementById('setPhone').value.trim().replace(/[^0-9]/g,'') || biz.phone;

    S.saveBusiness({ name:newName, tagline:newTagline, phone:newPhone });
    S.applyBrandToPage();
    populateSettingsForm();

    const c = document.getElementById('saveConfirm');
    c.classList.add('show');
    clearTimeout(handleSaveSettings._t);
    handleSaveSettings._t = setTimeout(()=>c.classList.remove('show'), 2800);

    S.showToast('Business details saved ✅');
  }

  function handleReset(){
    S.resetAll();
    renderStats(); renderProducts(); renderOrders(); populateSettingsForm();
    S.applyBrandToPage();
    S.showToast('Demo data reset to defaults');
  }

  /* ---------- tabs ---------- */
  function initTabs(){
    document.querySelectorAll('.admin-tab').forEach(tab=>{
      tab.addEventListener('click', ()=>{
        document.querySelectorAll('.admin-tab').forEach(t=>t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.admin-tab-panel').forEach(p=> p.style.display='none');
        document.getElementById('tab-'+tab.dataset.tab).style.display='block';
      });
    });
  }

  function init(){
    renderStats();
    renderProducts();
    renderOrders();
    renderEmojiSelect();
    populateSettingsForm();
    initTabs();

    document.getElementById('addProductForm').addEventListener('submit', handleAddProduct);
    document.getElementById('settingsForm').addEventListener('submit', handleSaveSettings);
    const resetBtn = document.getElementById('resetDemoBtn');
    if(resetBtn) resetBtn.addEventListener('click', handleReset);

    window.addEventListener('storage', (e)=>{
      if(e.key === S.KEYS.orders){ renderOrders(); renderStats(); }
      if(e.key === S.KEYS.products){ renderProducts(); renderStats(); }
    });
  }

  return { init };
})();
