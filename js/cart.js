/* ==========================================================================
   cart.js — cart state, drawer, checkout + WhatsApp order submission
   Used by customer.html. Reads/writes product + cart data via window.Store.
   Dispatches a 'cart:updated' event on window whenever the cart changes so
   catalogue.js can keep the +/- steppers on product cards in sync.
   ========================================================================== */

window.Cart = (function () {
  const S = window.Store;

  function getCart(){ return S.getCart(); }
  function setCart(cart){ S.saveCart(cart); window.dispatchEvent(new CustomEvent('cart:updated')); }

  function itemCount(){
    const cart = getCart();
    return Object.values(cart).reduce((a,b)=>a+b, 0);
  }
  function total(){
    const cart = getCart();
    const products = S.getProducts();
    return Object.entries(cart).reduce((sum,[id,qty])=>{
      const p = products.find(p=>p.id===id);
      return p ? sum + p.price*qty : sum;
    },0);
  }

  function changeQty(id, delta){
    const products = S.getProducts();
    const p = products.find(p=>p.id===id);
    if(!p || !p.available) return;
    const cart = getCart();
    const current = cart[id] || 0;
    const next = Math.max(0, current + delta);
    if(next===0) delete cart[id]; else cart[id] = next;
    setCart(cart);
    renderBadge();
    renderDrawer();
  }

  function removeItem(id){
    const products = S.getProducts();
    const p = products.find(p=>p.id===id);
    const cart = getCart();
    delete cart[id];
    setCart(cart);
    renderBadge();
    renderDrawer();
    if(p) S.showToast(`${p.name} removed from basket`);
  }

  function renderBadge(){
    const el = document.getElementById('cartCount');
    if(!el) return;
    const count = itemCount();
    el.textContent = count;
    el.style.display = count>0 ? 'flex' : 'none';
  }

  function renderDrawer(){
    const body = document.getElementById('drawerBody');
    const footer = document.getElementById('drawerFooter');
    if(!body) return;
    const cart = getCart();
    const products = S.getProducts();
    const ids = Object.keys(cart);

    if(ids.length===0){
      body.innerHTML = `<div class="drawer-empty"><div class="big">🧺</div><strong>Your basket is empty</strong><div style="margin-top:6px;font-size:13.5px;">Add some fresh produce to get started.</div></div>`;
      footer.style.display = 'none';
      return;
    }
    footer.style.display = 'block';
    body.innerHTML = ids.map(id=>{
      const p = products.find(p=>p.id===id);
      if(!p) return '';
      const qty = cart[id];
      const visual = p.image ? `<img src="${S.escapeHtml(p.image)}" alt="">` : p.emoji;
      return `
        <div class="cart-line">
          <div class="cart-line-emoji">${visual}</div>
          <div class="cart-line-info">
            <strong>${S.escapeHtml(p.name)}</strong>
            <small>${S.money(p.price)} / ${S.escapeHtml(p.unit)}</small>
          </div>
          <div class="cart-line-controls">
            <div class="qty-stepper" style="background:var(--green-soft);">
              <button data-action="dec" data-id="${id}" style="color:var(--green-deep);" aria-label="Decrease">−</button>
              <span style="color:var(--green-deep);">${qty}</span>
              <button data-action="inc" data-id="${id}" style="color:var(--green-deep);" aria-label="Increase">+</button>
            </div>
            <button class="cart-line-remove" data-action="remove" data-id="${id}">Remove</button>
          </div>
        </div>
      `;
    }).join('');

    document.getElementById('drawerSubtotal').textContent = S.money(total());
    document.getElementById('drawerTotal').textContent = S.money(total());

    body.querySelectorAll('[data-action="inc"]').forEach(b=> b.addEventListener('click', ()=> changeQty(b.dataset.id,1)));
    body.querySelectorAll('[data-action="dec"]').forEach(b=> b.addEventListener('click', ()=> changeQty(b.dataset.id,-1)));
    body.querySelectorAll('[data-action="remove"]').forEach(b=> b.addEventListener('click', ()=> removeItem(b.dataset.id)));
  }

  function openDrawer(){
    document.getElementById('cartDrawer').classList.add('open');
    document.getElementById('drawerOverlay').classList.add('open');
  }
  function closeDrawer(){
    document.getElementById('cartDrawer').classList.remove('open');
    document.getElementById('drawerOverlay').classList.remove('open');
  }

  function openCheckout(){
    if(itemCount()===0){ S.showToast('Your basket is empty'); return; }
    closeDrawer();
    renderCheckoutSummary();
    document.getElementById('checkoutModal').classList.add('open');
  }
  function closeCheckout(){ document.getElementById('checkoutModal').classList.remove('open'); }

  function renderCheckoutSummary(){
    const cart = getCart();
    const products = S.getProducts();
    const rows = Object.entries(cart).map(([id,qty])=>{
      const p = products.find(p=>p.id===id);
      if(!p) return '';
      return `<div class="line"><span>${S.escapeHtml(p.name)} × ${qty} ${S.escapeHtml(p.unit)}</span><span>${S.money(p.price*qty)}</span></div>`;
    }).join('');
    document.getElementById('checkoutSummary').innerHTML = rows + `<div class="line total"><span>Total</span><span>${S.money(total())}</span></div>`;
  }

  function validateField(inputId, fieldId, validatorFn){
    const val = document.getElementById(inputId).value.trim();
    const ok = validatorFn(val);
    document.getElementById(fieldId).classList.toggle('error', !ok);
    return ok;
  }

  function buildWhatsAppLink(order, business){
    const lines = [];
    lines.push(`🛒 *New Order — ${business.name}*`);
    lines.push('');
    lines.push(`👤 Name: ${order.name}`);
    lines.push(`📞 Phone: ${order.phone}`);
    lines.push(`📍 Location: ${order.location}`);
    lines.push('');
    lines.push('*Order Items:*');
    order.items.forEach((it,i)=>{
      lines.push(`${i+1}. ${it.name} × ${it.qty} ${it.unit} — ${S.money(it.price*it.qty)}`);
    });
    lines.push('');
    lines.push(`💰 *Total: ${S.money(order.total)}*`);
    if(order.notes){ lines.push(''); lines.push(`📝 Notes: ${order.notes}`); }
    lines.push('');
    lines.push(`Order #${String(order.id).padStart(4,'0')}`);
    const text = encodeURIComponent(lines.join('\n'));
    return `https://wa.me/${business.phone}?text=${text}`;
  }

  function showConfirmation(order, waLink){
    document.getElementById('confirmOrderId').textContent = `Order #${String(order.id).padStart(4,'0')}`;
    document.getElementById('reopenWhatsappBtn').href = waLink;
    document.getElementById('confirmModal').classList.add('open');
  }

  function handleCheckoutSubmit(e){
    e.preventDefault();
    const nameOk = validateField('custName','fieldName', v=>v.length>1);
    const phoneOk = validateField('custPhone','fieldPhone', v=>v.replace(/[^0-9]/g,'').length>=9);
    const locOk = validateField('custLocation','fieldLocation', v=>v.length>3);
    if(!nameOk || !phoneOk || !locOk) return;

    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const location = document.getElementById('custLocation').value.trim();
    const notes = document.getElementById('custNotes').value.trim();

    const cart = getCart();
    const products = S.getProducts();
    const items = Object.entries(cart).map(([id,qty])=>{
      const p = products.find(p=>p.id===id);
      return { id, name:p.name, unit:p.unit, price:p.price, qty };
    });
    const business = S.getBusiness();
    const order = {
      id: S.nextOrderId(),
      name, phone, location, notes, items,
      total: total(),
      timestamp: new Date().toISOString()
    };
    S.addOrder(order);

    const waLink = buildWhatsAppLink(order, business);

    setCart({});
    e.target.reset();
    renderBadge();
    renderDrawer();

    closeCheckout();
    showConfirmation(order, waLink);
    window.open(waLink, '_blank');
    S.showToast(`Order #${String(order.id).padStart(4,'0')} sent on WhatsApp ✅`);
  }

  function init(){
    renderBadge();
    renderDrawer();

    document.getElementById('openCartBtn').addEventListener('click', openDrawer);
    document.getElementById('closeCartBtn').addEventListener('click', closeDrawer);
    document.getElementById('drawerOverlay').addEventListener('click', closeDrawer);
    document.getElementById('goToCheckoutBtn').addEventListener('click', openCheckout);
    document.getElementById('closeCheckoutBtn').addEventListener('click', closeCheckout);
    document.getElementById('checkoutModal').addEventListener('click', (e)=>{ if(e.target.id==='checkoutModal') closeCheckout(); });
    document.getElementById('checkoutForm').addEventListener('submit', handleCheckoutSubmit);
    document.getElementById('backToShopBtn').addEventListener('click', ()=> document.getElementById('confirmModal').classList.remove('open'));
    document.getElementById('confirmModal').addEventListener('click', (e)=>{ if(e.target.id==='confirmModal') document.getElementById('confirmModal').classList.remove('open'); });

    // keep in sync if the cart or catalogue changes in another tab/page
    window.addEventListener('storage', (e)=>{
      if(e.key === S.KEYS.cart || e.key === S.KEYS.products){ renderBadge(); renderDrawer(); }
    });
  }

  return { getCart, setCart, itemCount, total, changeQty, removeItem, renderBadge, renderDrawer, openDrawer, closeDrawer, init };
})();
