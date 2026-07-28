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

  const categoryLabels = { all: 'All', vegetables: 'Vegetables', fruits: 'Fruits', spices: 'Spices & Herbs', tubers: 'Roots & Tubers', meat: 'Meat, Fish & Eggs', grains: 'Grains & Legumes' };

  const emojiBank = ['🍅','🧅','🌶️','🍆','🥑','🥦','🥕','🥬','🥒','🫑','🍍','🍉','🍌','🥭','🍊','🍋','🥥','🫚','🧄','🌿','🍏','🍐','🍇','🍈','🍑','🥔','🌽','🫘','🫛','🧡'];

  const defaultProducts = [
    { id:'p1', name:'Fresh Tomatoes', category:'vegetables', price:12, unit:'olonka', emoji:'🍅', image:'assets/images/tomatoes.png', available:true },
    { id:'p2', name:'Red Onions', category:'vegetables', price:9, unit:'olonka', emoji:'🧅', image:'assets/images/onions.png', available:true },
    { id:'p3', name:'Red Pepper', category:'vegetables', price:15, unit:'olonka', emoji:'🌶️', image:'assets/images/red-pepper.png', available:true },
    { id:'p4', name:'Garden Eggs', category:'vegetables', price:8, unit:'kg', emoji:'🍆', image:'assets/images/garden-eggs-olonka.png', available:true },
    { id:'p5', name:'Fresh Okro', category:'vegetables', price:10, unit:'kg', emoji:'🫛', image:'assets/images/okro.png', available:true },
    { id:'p6', name:'Cabbage', category:'vegetables', price:7, unit:'piece', emoji:'🥬', image:'assets/images/cabbage.png', available:true },
    { id:'p7', name:'Carrots', category:'vegetables', price:11, unit:'kg', emoji:'🥕', image:'assets/images/carrots.png', available:true },
    { id:'p8', name:'Cucumber', category:'vegetables', price:6, unit:'piece', emoji:'🥒', image:'assets/images/cucumber.png', available:true },
    { id:'p9', name:'Green Beans', category:'vegetables', price:14, unit:'kg', emoji:'🫘', image:'assets/images/green-beans.png', available:true },
    { id:'p10', name:'Pineapple', category:'fruits', price:15, unit:'piece', emoji:'🍍', image:'assets/images/pineapple.png', available:false },
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
    {id:'p22', name:'Yam', category:'tubers', price:5, unit:'kg', emoji:'🥔', image:'assets/images/yam-pona.png', available:true},
    {id:'p23', name:'Cassava', category:'tubers', price:4, unit:'kg', emoji:'🥔', image:'assets/images/cassava.png', available:true},
    {id:'p24', name:'Egg', category:'meat', price:2, unit:'piece', emoji:'🥚', image:'assets/images/egg.png', available:true},
    {id:'p25', name:'Chicken Wings (hard)', category:'meat', price:20, unit:'kg', emoji:'🍗', image:'assets/images/chicken-wings-hard.png', available:true},
    {id:'p26', name:'Chicken Drumsticks', category:'meat', price:20, unit:'kg', emoji:'🍗', image:'assets/images/chicken-drumsticks.png', available:true},
    {id:'p27', name:'Fresh Gizzard', category:'meat', price:20, unit:'pound', emoji:'🍗', image:'assets/images/fresh-gizzard.png', available:true},
    {id:'p28', name:'Chicken Thighs (hard)', category:'meat', price:20, unit:'kg', emoji:'🍗', image:'assets/images/hard-chicken-thighs.png', available:true},
    {id:'p29', name:'Lime', category:'fruits', price:2, unit:'kg', emoji:'🍋', image:'assets/images/lime.png', available:true},
    {id:'p30', name:'Rice', category:'grains', price:10, unit:'kg', emoji:'🍚', image:'assets/images/5k-rice.png', available:true},
    {id:'p31', name:'Beans', category:'grains', price:12, unit:'kg', emoji:'🫘', image:'assets/images/redbeans.png', available:true},
    {id:'p32', name:'Corn Dough', category:'grains', price:12, unit:'kg', emoji:'🌽', image:'assets/images/corn-dough.png', available:true},
    {id:'p33', name:'Beetroot', category:'tubers', price:12, unit:'kg', emoji:' Beetroot', image:'assets/images/beetroot.png', available:true},
    {id:'p34', name:'Soybeans', category:'grains', price:12, unit:'kg', emoji:'🌽', image:'assets/images/soybeans.png', available:true},
    {id:'p35', name:'Eggs (half crate)', category:'meat', price:2, unit:'crate', emoji:'🥚', image:'assets/images/half-eggs.png', available:true},
    {id:'p36', name:'Eggs (full crate)', category:'meat', price:2, unit:'crate', emoji:'🥚', image:'assets/images/full-eggs.png', available:true},
    {id:'p37', name:'Egg (White)', category:'meat', price:2, unit:'crate', emoji:'🥚', image:'assets/images/egg-white.png', available:true},
    {id:'p38', name:'Plantain', category:'tubers', price:12, unit:'kg', emoji:'🍌', image:'assets/images/plantain.png', available:true },
    {id:'p39', name:'Ripe Plantain', category:'tubers', price:12, unit:'kg', emoji:'🍌', image:'assets/images/ripe-plantain.png', available:true },
    {id:'p40', name:'Plantain (big)', category:'tubers', price:12, unit:'kg', emoji:'🍌', image:'assets/images/plantain-big.png', available:true },
    {id: 'p41', name: 'Wele (hard)', category: 'meat', price: 12, unit: 'pound', emoji: '🍗', image: 'assets/images/wele-hard.png', available: true },
    {id: 'p42', name: 'Wele (soft)', category: 'meat', price: 12, unit: 'pound', emoji: '🍗', image: 'assets/images/wele-soft.png', available: true },
    { id:'p43', name:'Yellow Bonnets', category:'vegetables', price:15, unit:'kg', emoji:'🌶️', image:'assets/images/yellow-bonnets.png', available:true },
    {id: 'p45', name:'Turkey Berries', category:'vegetables', price:10, unit:'kg', emoji:'🫛', image:'assets/images/turkey-berries.png', available:true },
    {id: 'p44', name: 'Shallots', category: 'vegetables', price: 12, unit: 'kg', emoji: '🧅', image: 'assets/images/shallots.png', available: true },
    {id: 'p46', name: 'Spinach', category: 'vegetables', price: 12, unit: 'kg', emoji: '🥬', image: 'assets/images/spinach.png', available: true },
    {id: 'p47', name: 'Zucchini', category: 'vegetables', price: 12, unit: 'kg', emoji: '🥒', image: 'assets/images/zucchinis.png', available: true },
    { id:'p48', name:'Green Bonnets', category:'vegetables', price:15, unit:'kg', emoji:'🌶️', image:'assets/images/green-bonnets.png', available:true },
    {id:'p49', name: 'Fresh Tilapia', category: 'meat', price: 20, unit: 'pound', emoji: '🍗', image: 'assets/images/fresh-tilapia.png', available: true, name: 'Fresh Tilapia'},
    {id:'p50', name: 'Cocoyam', category: 'tubers', price: 12, unit: 'kg', emoji: '🥔', image: 'assets/images/cocoyam-root.png', available: false},
    {id:'p51', name: 'Cloves', category: 'spices', price: 10, unit: 'kg', emoji: '🫛', image: 'assets/images/cloves.png', available: true},
    {id:'p52', name: 'Cooking Oil', category: 'vegetables', price: 15, unit: 'litre', emoji: '🫛', image: 'assets/images/cooking-oil.png', available: true},
    {id:'p53', name: 'Bell Pepper', category: 'vegetables', price: 20, unit: 'litre', emoji: '🌶️', image: 'assets/images/bell-pepper.png', available: true},
    { id:'p54', name:'Dawadawa', category:'spices', price:12, unit:'piece', emoji:'🧡', image:'assets/images/dawadawa.png', available:true },
    { id:'p55', name:'Prekese', category:'spices', price:12, unit:'piece', emoji:'🧡', image:'assets/images/prekese.png', available:true },
    { id:'p57', name:'Onions', category:'vegetables', price:9, unit:'kg', emoji:'🧅', image:'assets/images/onions-two.png', available:true },
    { id:'p56', name:'Onions (sack)', category:'vegetables', price:9, unit:'kg', emoji:'🧅', image:'assets/images/onions-sack.png', available:true },
    { id:'p58', name:'Onions (olonka)', category:'vegetables', price:9, unit:'kg', emoji:'🧅', image:'assets/images/onions-olonka.png', available:true },
    { id:'p59', name:'Onions', category:'vegetables', price:9, unit:'kg', emoji:'🧅', image:'assets/images/onions-four.png', available:true },
    {id: 'p60', name: 'Lettuce', category: 'vegetables', price: 12, unit: 'kg', emoji: '🥬', image: 'assets/images/lettuce.png', available: true },
  ];

  const defaultBusiness = {
    name: 'Fruit & Veggies Hub',
    tagline: 'Local · Fresh · Healthy',
    phone: '233261430256'
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
