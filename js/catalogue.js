/* ==========================================================================
   catalogue.js — category pills, search and product grid rendering
   Used by customer.html. Quantity changes delegate to window.Cart so cart
   state stays in one place; this file just re-renders whenever the cart
   changes (via the 'cart:updated' event) so the qty steppers stay in sync.
   ========================================================================== */

window.Catalogue = (function () {
  const S = window.Store;
  let searchTerm = '';
  let activeCategory = 'all';

  function renderCategoryPills(){
    const products = S.getProducts();
    const cats = ['all', ...new Set(products.map(p=>p.category))];
    const el = document.getElementById('categoryPills');
    el.innerHTML = cats.map(c => `
      <button class="pill ${activeCategory===c?'active':''}" data-cat="${c}">${S.categoryLabels[c] || c}</button>
    `).join('');
    el.querySelectorAll('.pill').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        activeCategory = btn.dataset.cat;
        renderCategoryPills();
        renderGrid();
      });
    });
  }

  function renderGrid(){
    const products = S.getProducts();
    const cart = window.Cart.getCart();
    const term = searchTerm.trim().toLowerCase();

    let list = products.filter(p=>{
      const matchesCat = activeCategory==='all' || p.category===activeCategory;
      const matchesTerm = !term || p.name.toLowerCase().includes(term);
      return matchesCat && matchesTerm;
    });

    const countEl = document.getElementById('resultCount');
    if(countEl) countEl.textContent = list.length + (list.length===1 ? ' item' : ' items');

    const grid = document.getElementById('productGrid');
    if(list.length===0){
      grid.innerHTML = `<div class="empty-state"><strong>Nothing here yet</strong>Try a different search or category.</div>`;
      return;
    }

    grid.innerHTML = list.map(p=>{
      const qty = cart[p.id] || 0;
      const visual = p.image ? `<img src="${S.escapeHtml(p.image)}" alt="${S.escapeHtml(p.name)}">` : p.emoji;
      const controls = !p.available
        ? `<button class="add-btn" disabled aria-label="Unavailable">✕</button>`
        : qty>0
          ? `<div class="qty-stepper">
               <button data-action="dec" data-id="${p.id}" aria-label="Decrease quantity">−</button>
               <span>${qty}</span>
               <button data-action="inc" data-id="${p.id}" aria-label="Increase quantity">+</button>
             </div>`
          : `<button class="add-btn" data-action="inc" data-id="${p.id}" aria-label="Add ${S.escapeHtml(p.name)} to cart">+</button>`;

      return `
        <div class="tag-card">
          <div class="tag-visual ${!p.available?'unavailable':''}">
            ${visual}
            ${!p.available ? `<div class="sold-out-stamp"><span>Sold out</span></div>` : ''}
          </div>
          <div class="tag-name">${S.escapeHtml(p.name)}</div>
          <div class="tag-cat">${S.categoryLabels[p.category] || p.category}</div>
          <div class="tag-footer">
            <span class="tag-price">${S.money(p.price)} <small>/ ${S.escapeHtml(p.unit)}</small></span>
            ${controls}
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('[data-action="inc"]').forEach(b=> b.addEventListener('click', ()=> window.Cart.changeQty(b.dataset.id, 1)));
    grid.querySelectorAll('[data-action="dec"]').forEach(b=> b.addEventListener('click', ()=> window.Cart.changeQty(b.dataset.id, -1)));
  }

  function init(){
    // allow index.html category cards to deep-link straight into a filtered view
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category');
    if(catParam) activeCategory = catParam;
    const searchParam = params.get('q');
    if(searchParam){ searchTerm = searchParam; document.getElementById('searchInput').value = searchParam; }

    renderCategoryPills();
    renderGrid();

    document.getElementById('searchInput').addEventListener('input', (e)=>{
      searchTerm = e.target.value;
      renderGrid();
    });

    window.addEventListener('cart:updated', renderGrid);
    window.addEventListener('storage', (e)=>{
      if(e.key === S.KEYS.products){ renderCategoryPills(); renderGrid(); }
    });
  }

  return { init, renderGrid };
})();
