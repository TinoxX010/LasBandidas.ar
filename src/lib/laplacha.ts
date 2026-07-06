/*
 * Las Bandidas — lógica del sitio (vanilla, sin frameworks).
 *
 * Incluye:
 *  - Render del menú por pestañas.
 *  - Personalizador de productos (modal) con agregados, salsas, cantidad y
 *    precio dinámico en tiempo real.
 *  - Carrito con localStorage + bloque de tiempo estimado / delivery.
 *  - Envío del pedido por WhatsApp.
 *
 * initLasBandidas() se llama una sola vez desde el componente de la home y
 * devuelve una función de limpieza.
 */

// === Config ===
const WHATSAPP_NUMBER = "5492216168280";

// === Tipos ===
interface MenuItem {
  name: string;
  desc: string;
  price: string;
  img: string;
}
interface AddOn {
  name: string;
  price: number;
}
interface CustomizeConfig {
  agregados: AddOn[];
  salsas: AddOn[];
}
interface CartAddOn {
  name: string;
  price: number;
}
interface CartLine {
  id: string; // identidad única (producto + agregados)
  name: string;
  base: number; // precio base unitario
  unit: number; // precio unitario con agregados
  qty: number;
  addons: CartAddOn[];
  img: string;
}

// === Datos del menú ===
const MENU: Record<string, MenuItem[]> = {
  Hamburguesas: [
    { name: "La Planchetta Clásica", desc: "Doble medallón, cheddar, lechuga, tomate y salsa de la casa.", price: "$8.900", img: "/assets/fotolaploanchetta.jpg" },
    { name: "Bacon Brutal", desc: "Triple bacon, cheddar fundido.", price: "$10.500", img: "/assets/fotolaploanchetta.jpg" },
    { name: "Smash Doble", desc: "Dos smash patis, queso, y mostaza.", price: "$9.400", img: "/assets/fotolaploanchetta.jpg" },
    { name: "La Picante", desc: "Jalapeños, queso provolone, salsa y cebolla morada.", price: "$9.800", img: "/assets/fotolaploanchetta.jpg" },
  ],
  tragos: [
    { name: "Flowerss", desc: "vodka rasberry, vodka piña, almibar frutos rojos y sprite.", price: "$10.000", img: "/assets/fotolaploanchetta.jpg" },
    { name: "gin-paff", desc: "gin, flyn paffs y sprite", price: "$8.000", img: "/assets/fotolaploanchetta.jpg" },
    { name: "Fernet con Coca", desc: "El clásico, bien cargado.", price: "$7.000", img: "/assets/fotolaploanchetta.jpg" },
  ],
  Postres: [
    { name: "Tiramisu", desc: "Postre italiano con crema de mascarpone y cafe", price: "$7.500", img: "/assets/tiramisu.jpg" },
    { name: "Chocotorta", desc: "postre argentino que no falla jamas", price: "$7.500", img: "/assets/chocotorta.jpg" },
    { name: "Bombom Escoces", desc: "Postre escoces helado, cobertura de chocolate con mani", price: "$4.000", img: "/assets/bombom.jpg" },
  ],
  papas: [
    { name: "Papas onduladas con cheddar y bacon", desc: "Papas fritas con forma ondulada, bañadas en cheddar y bacon.", price: "$4.500", img: "/assets/fotolaploanchetta.jpg" },
    { name: "Salchipapa con cheddar", desc: "Papas cubierta con queso cheddar fundido y trozos de salchicha.", price: "$5.000", img: "/assets/fotolaploanchetta.jpg" },
    { name: "Papas Especiales", desc: "Papas especiales con especias de la casa.", price: "$5.000", img: "/assets/fotolaploanchetta.jpg" },
  ],
  Bebidas: [
    { name: "Coca-Cola", desc: "La clásica bebida gaseosa.", price: "$2.000", img: "/assets/coca.jpg" },
    { name: "Sprite", desc: "refresco de sabor a lima-limón", price: "$1.500", img: "/assets/sprite.jpg" },
    { name: "Manaos", desc: "cola, lima y pomelo.", price: "$3.500", img: "/assets/MANAOS.jpg" },
  ],
  "Pizzas ": [
    { name: "Muzzarella", desc: "Pizza clásica con muzzarella y salsa de tomate.", price: "$6.000", img: "/assets/fotolaploanchetta.jpg" },
    { name: "Napolitana", desc: "Pizza con muzzarella, tomate, ajo y albahaca.", price: "$7.000", img: "/assets/fotolaploanchetta.jpg" },
  ],
  Promos: [
    { name: "2 burguers y coca de 1,5L", desc: "2 burguers, Doble cheddar y una coca de 1,5L", price: "$30000", img: "/assets/fotolaploanchetta.jpg" },
    { name: "2 Muzzas", desc: "2 MUZZAS", price: "$40000", img: "/assets/fotolaploanchetta.jpg" },
  ],
};

// === Personalización por categoría ===
// Cada categoría define sus "agregados" y "salsas extra". Si una categoría no
// aparece acá, el modal solo muestra cantidad (sin secciones de agregados).
const CUSTOMIZE: Record<string, CustomizeConfig> = {
  Hamburguesas: {
    agregados: [
      { name: "Doble carne", price: 800 },
      { name: "Triple carne", price: 1500 },
      { name: "Extra queso", price: 400 },
    ],
    salsas: [
      { name: "Cheddar extra", price: 200 },
      { name: "Salsa BBQ", price: 200 },
      { name: "Salsa picante", price: 200 },
      { name: "Mayonesa de ajo", price: 200 },
    ],
  },
  papas: {
    agregados: [
      { name: "Doble cheddar", price: 600 },
      { name: "Doble bacon", price: 700 },
      { name: "Extra cheddar", price: 400 },
      { name: "Huevo frito", price: 350 },
    ],
    salsas: [
      { name: "Cheddar extra", price: 200 },
      { name: "Salsa BBQ", price: 200 },
      { name: "Salsa picante", price: 200 },
      { name: "Mayonesa de ajo", price: 200 },
    ],
  },
  Bebidas: {
    agregados: [{ name: "Bolsa de hielo", price: 500 }],
    salsas: [],
  },
};

// === Helpers de precio ===
function parsePrice(str: string): number {
  return parseInt(String(str).replace(/[^\d]/g, ""), 10) || 0;
}
function formatPrice(n: number): string {
  return "$" + n.toLocaleString("es-AR");
}

export function initLasBandidas(): () => void {
  if (typeof document === "undefined") return () => {};

  const $ = <T extends Element = HTMLElement>(sel: string) =>
    document.querySelector<T>(sel);
  const byId = <T extends HTMLElement = HTMLElement>(id: string) =>
    document.getElementById(id) as T | null;

  // Guardamos listeners globales para poder limpiarlos.
  const teardown: Array<() => void> = [];

  // === Año del footer ===
  const yearEl = byId("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // === Marquee ===
  const stripTrack = byId("stripTrack");
  if (stripTrack) {
    const stripHTML = Array.from({ length: 8 })
      .map(
        () =>
          `<span>SMASH BURGERS <span class="star">★</span> hamburguesas <span class="star">★</span> TRAGOS DE AUTOR <span class="star">★</span></span>`,
      )
      .join(" ");
    stripTrack.innerHTML = stripHTML + stripHTML;
  }

  // === Menú ===
  const tabsEl = byId("tabs");
  const gridEl = byId("menuGrid");
  let currentTab = Object.keys(MENU)[0];

  function renderTabs() {
    if (!tabsEl) return;
    tabsEl.innerHTML = "";
    Object.keys(MENU).forEach((t) => {
      const b = document.createElement("button");
      b.className = "tab" + (t === currentTab ? " active" : "");
      b.textContent = t;
      b.onclick = () => {
        currentTab = t;
        renderTabs();
        renderGrid();
      };
      tabsEl.appendChild(b);
    });
  }

  function renderGrid() {
    if (!gridEl) return;
    gridEl.innerHTML = "";
    MENU[currentTab].forEach((item) => {
      const card = document.createElement("article");
      card.className = "menu-card";
      card.innerHTML = `
        <div class="img"><img src="${item.img}" alt="${item.name}" loading="lazy" /></div>
        <div class="body">
          <div class="row">
            <h3>${item.name}</h3>
            <span class="price">${item.price}</span>
          </div>
          <p class="desc">${item.desc}</p>
          <button class="add-btn">+ Agregar</button>
        </div>`;
      // Al tocar la tarjeta (o su botón) se abre el personalizador.
      const open = () => openCustomizer(item, currentTab);
      card.querySelector<HTMLButtonElement>(".add-btn")!.onclick = (e) => {
        e.stopPropagation();
        open();
      };
      const imgEl = card.querySelector<HTMLElement>(".img");
      if (imgEl) {
        imgEl.style.cursor = "pointer";
        imgEl.onclick = open;
      }
      gridEl.appendChild(card);
    });
  }

  renderTabs();
  renderGrid();

  // === Personalizador (modal) ===
  let pmOverlay: HTMLDivElement | null = null;

  function closeCustomizer() {
    if (pmOverlay) {
      pmOverlay.remove();
      pmOverlay = null;
      document.body.style.overflow = "";
    }
  }

  function openCustomizer(item: MenuItem, category: string) {
    closeCustomizer();
    const base = parsePrice(item.price);
    const cfg: CustomizeConfig = CUSTOMIZE[category] || { agregados: [], salsas: [] };

    const selected = new Map<string, number>(); // nombre -> precio
    let qty = 1;

    const overlay = document.createElement("div");
    overlay.className = "pm-overlay";

    const section = (title: string, opts: AddOn[]) =>
      opts.length === 0
        ? ""
        : `<div class="pm-section">
            <h4>${title}</h4>
            ${opts
              .map(
                (o) => `
              <label class="pm-opt">
                <input type="checkbox" data-name="${o.name}" data-price="${o.price}" />
                <span class="pm-opt-name">${o.name}</span>
                <span class="pm-opt-price">+${formatPrice(o.price)}</span>
              </label>`,
              )
              .join("")}
          </div>`;

    overlay.innerHTML = `
      <div class="pm-modal" role="dialog" aria-modal="true" aria-label="Personalizar ${item.name}">
        <div class="pm-hero">
          <img src="${item.img}" alt="${item.name}" />
          <div class="pm-grad"></div>
          <button class="pm-close" aria-label="Cerrar">✕</button>
        </div>
        <div class="pm-body">
          <div class="pm-title-row">
            <h3>${item.name}</h3>
            <span class="pm-base">${item.price}</span>
          </div>
          <p class="pm-desc">${item.desc}</p>
          ${section("Agregados", cfg.agregados)}
          ${section("Salsas extra", cfg.salsas)}
          <div class="pm-controls">
            <div class="pm-qty">
              <button type="button" data-act="minus" aria-label="Restar">−</button>
              <span data-qty>1</span>
              <button type="button" data-act="plus" aria-label="Sumar">+</button>
            </div>
            <div class="pm-total">Total:<strong data-total>${formatPrice(base)}</strong></div>
          </div>
          <button class="btn btn-primary pm-add" type="button">Agregar al carrito</button>
        </div>
      </div>`;

    const qtyEl = overlay.querySelector<HTMLElement>("[data-qty]")!;
    const totalEl = overlay.querySelector<HTMLElement>("[data-total]")!;

    // Recalcula el precio en tiempo real.
    function unitPrice() {
      let extras = 0;
      selected.forEach((p) => (extras += p));
      return base + extras;
    }
    function refresh() {
      qtyEl.textContent = String(qty);
      totalEl.textContent = formatPrice(unitPrice() * qty);
    }

    // Checkboxes de agregados / salsas.
    overlay
      .querySelectorAll<HTMLInputElement>('.pm-opt input[type="checkbox"]')
      .forEach((cb) => {
        cb.addEventListener("change", () => {
          const name = cb.dataset.name!;
          const price = parseInt(cb.dataset.price || "0", 10);
          if (cb.checked) selected.set(name, price);
          else selected.delete(name);
          refresh();
        });
      });

    // Contador de cantidad.
    overlay.querySelector('[data-act="minus"]')!.addEventListener("click", () => {
      qty = Math.max(1, qty - 1);
      refresh();
    });
    overlay.querySelector('[data-act="plus"]')!.addEventListener("click", () => {
      qty += 1;
      refresh();
    });

    // Cerrar (X, fondo).
    overlay.querySelector(".pm-close")!.addEventListener("click", closeCustomizer);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeCustomizer();
    });

    // Agregar al carrito.
    overlay.querySelector(".pm-add")!.addEventListener("click", () => {
      const addons: CartAddOn[] = Array.from(selected.entries()).map(([name, price]) => ({
        name,
        price,
      }));
      addToCart(item, addons, qty);
      closeCustomizer();
      openCart();
    });

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
    pmOverlay = overlay;
    refresh();
  }

  // Cerrar modal con Escape.
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") closeCustomizer();
  };
  document.addEventListener("keydown", onKey);
  teardown.push(() => document.removeEventListener("keydown", onKey));

  // === Carrito ===
  let cart: CartLine[] = [];
  try {
    cart = JSON.parse(localStorage.getItem("cart") || "[]");
  } catch {
    cart = [];
  }
  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // Identidad de una línea = producto + agregados seleccionados.
  function lineId(name: string, addons: CartAddOn[]) {
    const key = addons
      .map((a) => a.name)
      .sort()
      .join("|");
    return key ? `${name}::${key}` : name;
  }

  function addToCart(item: MenuItem, addons: CartAddOn[], qty: number) {
    const base = parsePrice(item.price);
    const unit = base + addons.reduce((s, a) => s + a.price, 0);
    const id = lineId(item.name, addons);
    const ex = cart.find((l) => l.id === id);
    if (ex) ex.qty += qty;
    else
      cart.push({ id, name: item.name, base, unit, qty, addons, img: item.img });
    saveCart();
    renderCart();
  }
  function incLine(id: string) {
    const ex = cart.find((l) => l.id === id);
    if (!ex) return;
    ex.qty += 1;
    saveCart();
    renderCart();
  }
  function decLine(id: string) {
    const ex = cart.find((l) => l.id === id);
    if (!ex) return;
    ex.qty -= 1;
    if (ex.qty <= 0) cart = cart.filter((l) => l.id !== id);
    saveCart();
    renderCart();
  }

  const itemsEl = byId("cartItems");
  const totalEl = byId("cartTotal");
  const countEl = byId("cartCount");

  function renderCart() {
    if (!itemsEl || !totalEl || !countEl) return;
    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    if (totalQty > 0) {
      countEl.hidden = false;
      countEl.textContent = String(totalQty);
    } else {
      countEl.hidden = true;
    }

    if (cart.length === 0) {
      itemsEl.innerHTML = `<div class="cart-empty">Tu carrito está vacío.<br>Agregá algo del menú 🍔</div>`;
    } else {
      itemsEl.innerHTML = "";
      cart.forEach((i) => {
        const row = document.createElement("div");
        row.className = "cart-item";
        const addonsHtml = i.addons.length
          ? `<div class="addons">+ ${i.addons.map((a) => a.name).join(", ")}</div>`
          : "";
        row.innerHTML = `
          <div>
            <div class="name">${i.name}</div>
            <div class="ip">${formatPrice(i.unit)} c/u</div>
            ${addonsHtml}
          </div>
          <div class="qty">
            <button data-act="dec">−</button>
            <span>${i.qty}</span>
            <button data-act="inc">+</button>
          </div>`;
        row.querySelector<HTMLButtonElement>('[data-act="dec"]')!.onclick = () =>
          decLine(i.id);
        row.querySelector<HTMLButtonElement>('[data-act="inc"]')!.onclick = () =>
          incLine(i.id);
        itemsEl.appendChild(row);
      });
    }
    const total = cart.reduce((s, i) => s + i.unit * i.qty, 0);
    totalEl.textContent = formatPrice(total);
  }
  renderCart();

  // === Drawer ===
  const drawer = byId("cartDrawer");
  const overlay = byId("cartOverlay");
  function openCart() {
    if (!drawer || !overlay) return;
    drawer.classList.add("open");
    overlay.hidden = false;
    drawer.setAttribute("aria-hidden", "false");
  }
  function closeCart() {
    if (!drawer || !overlay) return;
    drawer.classList.remove("open");
    overlay.hidden = true;
    drawer.setAttribute("aria-hidden", "true");
  }
  const cartBtn = byId("cartBtn");
  const cartClose = byId("cartClose");
  if (cartBtn) cartBtn.onclick = openCart;
  if (cartClose) cartClose.onclick = closeCart;
  if (overlay) overlay.onclick = closeCart;

  // === WhatsApp ===
  const waText = "Hola! Me gustaría hacer un pedido en Las Bandidas 🍔";
  const waBtn = byId<HTMLAnchorElement>("waBtn");
  if (waBtn)
    waBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;

  const cartSend = byId("cartSend");
  if (cartSend)
    cartSend.onclick = () => {
      if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        return;
      }
      const lines = cart
        .map((i) => {
          const extra = i.addons.length
            ? `\n   (${i.addons.map((a) => a.name).join(", ")})`
            : "";
          return `• ${i.qty}x ${i.name} — ${formatPrice(i.unit * i.qty)}${extra}`;
        })
        .join("\n");
      const total = cart.reduce((s, i) => s + i.unit * i.qty, 0);
      const msg = `Hola! Quiero hacer este pedido en Las Bandidas 🍔

${lines}

Total: ${formatPrice(total)}
Tiempo estimado de delivery: 30 a 40 minutos.

Te paso el comprobante de la transferencia por acá. Sin comprobante entiendo que no pueden entregar el pedido. ¡Gracias!`;
      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
        "_blank",
      );
    };

  // === Limpieza ===
  return () => {
    closeCustomizer();
    teardown.forEach((fn) => fn());
  };
}