import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { initLasBandidas } from "@/lib/laplacha";

// Home route: inherits title/description/og/twitter from __root.tsx.
export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  // All interactive behaviour (menu render, cart, customizer modal) lives in a
  // framework-agnostic vanilla module. React only paints the static shell; the
  // effect wires everything up once, exactly like the original standalone site.
  useEffect(() => {
    const cleanup = initLasBandidas();
    return cleanup;
  }, []);

  return (
    <>
      {/* Header */}
      <header className="nav">
        <div className="container nav-inner">
          <a href="#top" className="brand">
            <span className="flame">🔥</span>
            <span className="brand-name">LAS BANDIDAS</span>
          </a>
          <nav className="nav-links">
            <a href="#menu">Menú</a>
            <a href="#galeria">Galería</a>
            <a href="#visitanos">Visitanos</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="hero">
        <div className="hero-bg">
          <img
            src="/assets/LaGolosa.jpg"
            alt="Hamburguesa doble con queso derretido bacon crujiente y cebollas caramelizadas sobre pan tostado en un restaurante cálido con fondo desenfocado transmitiendo una sensación indulgente"
          />
          <div className="hero-grad-r" />
          <div className="hero-grad-b" />
        </div>
        <div className="container hero-content">
          <div>
            <span className="tag fuego">🔥 SABORES FUERA DE LAS LEYES</span>
            <h1 className="hero-title">
              Sabor que <span className="text-fire">EXPLOTA</span> en cada mordida
            </h1>
            <p className="hero-desc">
              Hamburguesas artesanales, Carta de tragos, bebidas y mucho mas...
            </p>
            <div className="hero-cta">
              <a href="#menu" className="btn btn-primary">
                Ver el menú
              </a>
              <a href="#visitanos" className="btn btn-outline">
                Cómo llegar
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Strip */}
      <div className="strip">
        <div className="strip-track" id="stripTrack" />
      </div>

      {/* Menu */}
      <section id="menu" className="section bg-noise">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">NUESTRA CARTA</p>
            <h2 className="section-title">
              El <span className="text-fire">Menú</span>
            </h2>
          </div>
          <div className="tabs" id="tabs" />
          <div className="menu-grid" id="menuGrid" />
        </div>
      </section>

      {/* Gallery */}
      <section id="galeria" className="section section-dark">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">LA EXPERIENCIA</p>
            <h2 className="section-title">Galería</h2>
          </div>
          <div className="gallery">
            <figure className="g-big">
              <img
                src="/assets/fotolaplanchetta.jpg"
                alt="Chef concentrado cocinando una hamburguesa a la plancha en una cocina profesional con iluminación cálida"
                loading="lazy"
              />
            </figure>
            <figure>
              <img
                src="/assets/fotolaplanchetta.jpg"
                alt="Hamburguesa con bacon crujiente y aros de cebolla dorados servida en un plato en un ambiente apetitoso"
                loading="lazy"
              />
            </figure>
            <figure>
              <img
                src="/assets/fotolaplanchetta.jpg"
                alt="Hamburguesa clásica con lechuga y tomate acompañada de papas fritas doradas sobre una mesa informal en un ambiente acogedor"
                loading="lazy"
              />
            </figure>
            <figure className="g-wide">
              <img
                src="/assets/fotolaplanchetta.jpg"
                alt="Interior del local con carteles de neón rojos brillantes y mesas de madera que transmite un ambiente acogedor"
                loading="lazy"
              />
            </figure>
            <figure>
              <img
                src="/assets/fotolaplanchetta.jpg"
                alt="Trago de whisky con hielo servido sobre una barra de madera en un bar cálido"
                loading="lazy"
              />
            </figure>
            <figure>
              <img
                src="/assets/fotolaplanchetta.jpg"
                alt="Hamburguesa clásica con papas fritas doradas junto a una bebida sobre una mesa que transmite un ambiente sabroso y animado"
                loading="lazy"
              />
            </figure>
          </div>
        </div>
      </section>

      {/* Visitanos */}
      <section id="visitanos" className="section">
        <div className="container info-grid">
          <div className="info-card">
            <div className="info-icon">📍</div>
            <h3>Dirección</h3>
            <p>139 entre 440 y 441</p>
          </div>
          <div className="info-card">
            <div className="info-icon">⏰</div>
            <h3>Horarios</h3>
            <p>Lunes a Sabados de 20hs hasta 3am</p>
          </div>
          <div className="info-card">
            <div className="info-icon">📷</div>
            <h3>Seguinos</h3>
            <p>@LasBandidas</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>
          © <span id="year" /> Las Bandidas · Hechas por bandidos 🔥
        </p>
      </footer>

      {/* WhatsApp floating button */}
      <a
        id="waBtn"
        className="wa-btn"
        href="#"
        target="_blank"
        rel="noopener"
        aria-label="Pedir por WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
          <path d="M20.52 3.48A11.93 11.93 0 0 0 12.06 0C5.5 0 .18 5.32.18 11.88c0 2.09.55 4.13 1.6 5.93L0 24l6.34-1.66a11.86 11.86 0 0 0 5.72 1.46h.01c6.56 0 11.88-5.32 11.88-11.88 0-3.17-1.24-6.15-3.43-8.44ZM12.07 21.7h-.01a9.85 9.85 0 0 1-5.02-1.37l-.36-.21-3.76.98 1-3.66-.24-.38a9.83 9.83 0 0 1-1.51-5.18c0-5.45 4.43-9.88 9.88-9.88a9.82 9.82 0 0 1 6.99 2.9 9.81 9.81 0 0 1 2.89 6.99c.01 5.45-4.42 9.81-9.86 9.81Zm5.41-7.39c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.66.15-.2.3-.76.97-.93 1.16-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.91-2.19-.24-.57-.49-.5-.66-.5h-.57c-.2 0-.5.07-.77.37s-1.02 1-1.02 2.44 1.05 2.83 1.19 3.02c.15.2 2.07 3.16 5.02 4.43.7.3 1.25.48 1.68.62.7.22 1.34.19 1.84.12.56-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.34Z" />
        </svg>
      </a>

      {/* Cart floating button */}
      <button id="cartBtn" className="cart-btn" aria-label="Ver carrito">
        🛒
        <span id="cartCount" className="cart-count" hidden>
          0
        </span>
      </button>

      {/* Cart drawer */}
      <div id="cartOverlay" className="cart-overlay" hidden />
      <aside id="cartDrawer" className="cart-drawer" aria-hidden="true">
        <header className="cart-head">
          <h3>Tu pedido</h3>
          <button id="cartClose" aria-label="Cerrar">
            ✕
          </button>
        </header>
        <div id="cartItems" className="cart-items" />
        <footer className="cart-foot">
          {/* NUEVO: tiempo estimado / delivery */}
          <div className="cart-delivery">
            <span className="cd-icon">🛵</span>
            <div>
              <div className="cd-label">Tiempo estimado · Delivery</div>
              <div className="cd-value">30 a 40 minutos</div>
            </div>
          </div>
          <div className="cart-total">
            <span>Total</span>
            <strong id="cartTotal">$0</strong>
          </div>
          <button id="cartSend" className="btn btn-primary cart-send">
            Enviar pedido por WhatsApp
          </button>
          <p className="cart-note">
            Sin comprobante de transferencia no podemos entregar tu pedido.
          </p>
        </footer>
      </aside>
    </>
  );
}
