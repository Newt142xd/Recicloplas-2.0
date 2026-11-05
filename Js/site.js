/* RECICLOPLAS — comportamiento compartido (menú, WhatsApp, pestañas de rutas) */
(function () {
  "use strict";

  var DESKTOP = window.matchMedia("(min-width: 992px)");

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initWhatsApp();
    initRoutes();
    initImageFallbacks();
    initPqr();
  });

  /* ---------- Menú ---------- */
  function initNav() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.getElementById("nav-menu");
    if (!header || !toggle || !menu) return;

    var subs = Array.prototype.slice.call(menu.querySelectorAll(".has-sub"));

    function setMenu(open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      menu.classList.toggle("is-open", open);
      document.body.classList.toggle("no-scroll", open && !DESKTOP.matches);
      if (!open) closeSubs();
    }

    function closeSubs(except) {
      subs.forEach(function (li) {
        if (li !== except) {
          li.classList.remove("is-open");
          var b = li.querySelector(".nav-link");
          if (b) b.setAttribute("aria-expanded", "false");
        }
      });
    }

    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    subs.forEach(function (li) {
      var btn = li.querySelector(".nav-link");
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var open = !li.classList.contains("is-open");
        closeSubs(li);
        li.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", String(open));
      });
    });

    // Cerrar al elegir un enlace (móvil)
    menu.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (a && !DESKTOP.matches) setMenu(false);
    });

    // Cerrar con clic fuera o con Escape
    document.addEventListener("click", function (e) {
      if (!header.contains(e.target)) {
        closeSubs();
        if (!DESKTOP.matches) setMenu(false);
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeSubs();
        if (toggle.getAttribute("aria-expanded") === "true") {
          setMenu(false);
          toggle.focus();
        }
      }
    });

    // Al pasar a escritorio, reiniciar estado
    var onChange = function () {
      setMenu(false);
    };
    if (DESKTOP.addEventListener) DESKTOP.addEventListener("change", onChange);
    else if (DESKTOP.addListener) DESKTOP.addListener(onChange);

    // Sombra al hacer scroll
    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
          header.classList.toggle("is-scrolled", window.scrollY > 8);
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  /* ---------- WhatsApp ---------- */
  function initWhatsApp() {
    var fab = document.getElementById("waFab");
    var panel = document.getElementById("waPanel");
    var modal = document.getElementById("infoModal");
    if (!fab || !panel) return;

    function setPanel(open) {
      panel.classList.toggle("is-open", open);
      fab.setAttribute("aria-expanded", String(open));
    }
    function setModal(open) {
      if (!modal) return;
      modal.classList.toggle("is-open", open);
      document.body.classList.toggle("no-scroll", open);
      if (open) setPanel(false);
    }

    fab.addEventListener("click", function () {
      setPanel(!panel.classList.contains("is-open"));
    });
    document.getElementById("waClose").addEventListener("click", function () {
      setPanel(false);
    });
    document.getElementById("waChat").addEventListener("click", function () {
      window.open("https://wa.me/573209748962", "_blank", "noopener");
    });
    document.getElementById("waInfo").addEventListener("click", function () {
      setModal(true);
    });
    var closeBtn = document.getElementById("modalClose");
    if (closeBtn) closeBtn.addEventListener("click", function () { setModal(false); });
    if (modal) {
      modal.addEventListener("click", function (e) {
        if (e.target === modal) setModal(false);
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        setPanel(false);
        setModal(false);
      }
    });
  }

  /* ---------- Rutas (pestañas) ---------- */
  function initRoutes() {
    var tabs = document.querySelectorAll(".route-tab");
    if (!tabs.length) return;
    var panels = document.querySelectorAll(".route-panel");

    function select(tab) {
      tabs.forEach(function (t) {
        t.setAttribute("aria-selected", String(t === tab));
        t.tabIndex = t === tab ? 0 : -1;
      });
      panels.forEach(function (p) {
        p.hidden = p.id !== tab.getAttribute("aria-controls");
      });
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab); });
      tab.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (n) { e.preventDefault(); n.focus(); select(n); }
      });
    });
  }

  /* ---------- PQR: valida y abre el correo con la solicitud ---------- */
  function initPqr() {
    var form = document.getElementById("pqrForm");
    if (!form) return;
    var note = document.getElementById("pqrNote");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = null;
      form.querySelectorAll("[required]").forEach(function (el) {
        var ok = el.type === "checkbox" ? el.checked : el.value.trim() !== "" && el.checkValidity();
        el.classList.toggle("invalid", !ok);
        if (!ok && !bad) bad = el;
      });
      note.classList.remove("ok");
      if (bad) {
        note.textContent = "Por favor completa los campos marcados.";
        bad.focus();
        return;
      }
      var v = function (id) { return document.getElementById(id).value.trim(); };
      var body = "Tipo: " + v("tipo") + "\nNombre: " + v("p-name") + "\nDocumento: " + v("p-doc") +
        "\nTeléfono: " + v("p-tel") + "\nCorreo: " + v("p-mail") + "\n\n" + v("p-msg");
      window.location.href = "mailto:asorecicloplas@gmail.com?subject=" +
        encodeURIComponent(v("tipo") + ": " + v("p-asunto")) + "&body=" + encodeURIComponent(body);
      note.classList.add("ok");
      note.textContent = "Se abrió tu correo con la solicitud lista. Solo falta enviarla.";
    });
  }

  /* ---------- Imágenes que no cargan ---------- */
  function initImageFallbacks() {
    document.querySelectorAll("img[data-fallback]").forEach(function (img) {
      function swap() {
        var box = document.createElement("div");
        box.className = "img-missing";
        box.textContent = img.getAttribute("data-fallback");
        img.replaceWith(box);
      }
      if (img.complete && img.naturalWidth === 0) swap();
      else img.addEventListener("error", swap, { once: true });
    });
  }
})();
