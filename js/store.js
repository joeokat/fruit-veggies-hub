/* ==========================================================================
   store.js — shared data layer for Fruit & Veggies Hub
   Persists products, cart, orders and business settings to localStorage so
   that index.html, customer.html and admin.html can all read/write the same
   data as separate pages (a plain in-memory variable would not survive a
   real page navigation, which is how a multi-page site has to work).

   NOTE: this demo has no real server/database. localStorage keeps data on
   the single device/browser it was opened in — perfect for a click-through
   demo, but for production you'd swap this file for real API calls to a
   backend.
   ========================================================================== */

window.Store = (function () {
  const KEYS = {
    products: 'fvh_products',
    cart: 'fvh_cart',
    orders: 'fvh_orders',
    business: 'fvh_business',
    orderCounter: 'fvh_order_counter'
  };

  const categoryLabels = { all: 'All', vegetables: 'Vegetables', fruits: 'Fruits', spices: 'Spices & Herbs', Meat: 'Meat, Fish & Eggs' };

  const emojiBank = ['🍅','🧅','🌶️','🍆','🥑','🥦','🥕','🥬','🥒','🫑','🍍','🍉','🍌','🥭','🍊','🍋','🥥','🫚','🧄','🌿','🍏','🍐','🍇','🍈','🍑','🥔','🌽','🫘','🫛','🧡'];

  const defaultProducts = [
    { id:'p1', name:'Fresh Tomatoes', category:'vegetables', price:12, unit:'kg', emoji:'🍅', image:'assets/images/tomatoes.png', available:true },
    { id:'p2', name:'Red Onions', category:'vegetables', price:9, unit:'kg', emoji:'🧅', image:'assets/images/onions.png', available:true },
    { id:'p3', name:'Kpakpo Shito Pepper', category:'vegetables', price:15, unit:'kg', emoji:'🌶️', image:'assets/images/red-pepper.png', available:true },
    { id:'p4', name:'Garden Eggs', category:'vegetables', price:8, unit:'kg', emoji:'🍆', image:'assets/images/garden-eggs-olonka.png', available:true },
    { id:'p5', name:'Fresh Okro', category:'vegetables', price:10, unit:'kg', emoji:'🫛', image:'assets/images/okro.png', available:true },
    { id:'p6', name:'Cabbage', category:'vegetables', price:7, unit:'piece', emoji:'🥬', image:'assets/images/cabbage.png', available:true },
    { id:'p7', name:'Carrots', category:'vegetables', price:11, unit:'kg', emoji:'🥕', image:'assets/images/carrots.png', available:true },
    { id:'p8', name:'Cucumber', category:'vegetables', price:6, unit:'piece', emoji:'🥒', image:'assets/images/cucumber.png', available:true },
    { id:'p9', name:'Green Beans', category:'vegetables', price:14, unit:'kg', emoji:'🫘', image:'assets/images/green-beans.png', available:false },
    { id:'p10', name:'Pineapple', category:'fruits', price:15, unit:'piece', emoji:'🍍', image:'assets/images/pineapple.png', available:true },
    { id:'p11', name:'Watermelon', category:'fruits', price:25, unit:'piece', emoji:'🍉', image:'assets/images/watermelon.png', available:true },
    { id:'p12', name:'Bananas', category:'fruits', price:8, unit:'kg', emoji:'🍌', image:'assets/images/bananas.png', available:true },
    { id:'p13', name:'Pawpaw', category:'fruits', price:12, unit:'piece', emoji:'🧡', image:'assets/images/pawpaw.png', available:true },
    { id:'p14', name:'Oranges', category:'fruits', price:10, unit:'kg', emoji:'🍊', image:'assets/images/oranges.png', available:true },
    { id:'p15', name:'Mangoes', category:'fruits', price:14, unit:'kg', emoji:'🥭', image:'assets/images/mangoes.png', available:true },
    { id:'p16', name:'Avocado (Pear)', category:'fruits', price:18, unit:'kg', emoji:'🥑', image:'assets/images/avocado.png', available:true },
    { id:'p17', name:'Potatoes', category:'vegetables', price:6, unit:'piece', emoji:'🥔', image:'assets/images/potatoes.png', available:false },
    { id:'p18', name:'Ginger', category:'spices', price:20, unit:'kg', emoji:'🫚', image:'assets/images/ginger.png', available:true },
    { id:'p19', name:'Garlic', category:'spices', price:22, unit:'kg', emoji:'🧄', image:'assets/images/garlic.png', available:true },
    { id:'p20', name:'Scent Leaves (Nunum)', category:'spices', price:5, unit:'bunch', emoji:'🌿', image:'assets/images/scent-leaves.png', available:true },
    { id:'p21', name:'Aubergine', category:'vegetables', price:8, unit:'kg', emoji:'🍆', image:'assets/images/aubergine.png', available:true },
  ];

  const defaultBusiness = {
    name: 'Fruit & Veggies Hub',
    tagline: 'Local · Fresh · Healthy',
    phone: '233504438130'
  };

  function safeGet(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch(e){
      console.warn('Store: could not read', key, e);
      return fallback;
    }
  }
  function safeSet(key, value){
    try{
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    }catch(e){
      console.warn('Store: could not write', key, e);
      return false;
    }
  }

  function init(){
    if(localStorage.getItem(KEYS.products) === null) safeSet(KEYS.products, defaultProducts);
    if(localStorage.getItem(KEYS.business) === null) safeSet(KEYS.business, defaultBusiness);
    if(localStorage.getItem(KEYS.cart) === null) safeSet(KEYS.cart, {});
    if(localStorage.getItem(KEYS.orders) === null) safeSet(KEYS.orders, []);
    if(localStorage.getItem(KEYS.orderCounter) === null) safeSet(KEYS.orderCounter, 1);
  }
  init();

  return {
    KEYS, categoryLabels, emojiBank, defaultProducts, defaultBusiness,

    getProducts(){ return safeGet(KEYS.products, defaultProducts); },
    saveProducts(list){ return safeSet(KEYS.products, list); },

    getCart(){ return safeGet(KEYS.cart, {}); },
    saveCart(cart){ return safeSet(KEYS.cart, cart); },

    getOrders(){ return safeGet(KEYS.orders, []); },
    saveOrders(list){ return safeSet(KEYS.orders, list); },
    addOrder(order){
      const list = this.getOrders();
      list.unshift(order);
      this.saveOrders(list);
      return list;
    },

    getBusiness(){ return safeGet(KEYS.business, defaultBusiness); },
    saveBusiness(biz){ return safeSet(KEYS.business, biz); },

    nextOrderId(){
      const n = safeGet(KEYS.orderCounter, 1);
      safeSet(KEYS.orderCounter, n + 1);
      return n;
    },

    resetAll(){
      safeSet(KEYS.products, defaultProducts);
      safeSet(KEYS.business, defaultBusiness);
      safeSet(KEYS.cart, {});
      safeSet(KEYS.orders, []);
      safeSet(KEYS.orderCounter, 1);
    },

    /* ---------- shared small utilities ---------- */
    money(n){ return '₵' + Number(n).toFixed(2); },
    escapeHtml(str){
      return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    },
    showToast(msg){
      const t = document.getElementById('toast');
      if(!t) return;
      t.textContent = msg;
      t.classList.add('show');
      clearTimeout(t._timer);
      t._timer = setTimeout(()=> t.classList.remove('show'), 2400);
    },
    applyBrandToPage(){
      const biz = this.getBusiness();
      document.querySelectorAll('[data-brand-name]').forEach(el => el.textContent = biz.name);
      document.querySelectorAll('[data-brand-tagline]').forEach(el => el.textContent = biz.tagline);
      const titleEl = document.querySelector('title');
      if(titleEl && titleEl.dataset.suffix){ titleEl.textContent = biz.name + ' — ' + titleEl.dataset.suffix; }
    }
  };
})();
