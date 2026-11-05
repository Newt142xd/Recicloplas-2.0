/* RECICLOPLAS — Plataforma documental: búsqueda, filtro por categoría y paginación.
   Para agregar un documento: copia el archivo a Docs/ y añade una línea a DOCS. */
(function () {
  "use strict";

  var DOCS = [
    { titulo: "Contrato de condiciones uniformes", desc: "Contrato de prestación del servicio público de aprovechamiento.", cat: "Contratos", tipo: "PDF", url: "Docs/CCU CLOPLAS.pdf", pagina: "Uniformes.html" },
    { titulo: "Toneladas aprovechadas 2026", desc: "Gráfica mensual de material aprovechado por tipo de residuo.", cat: "Informes 2026", tipo: "Imagen", url: "Docs/toneladas-2026.png", pagina: "Toneladas.html" },
    { titulo: "Materia de rechazo 2026", desc: "Meses con mayor recolección de material de rechazo.", cat: "Informes 2026", tipo: "Imagen", url: "Docs/materia-rechazo-2026.png", pagina: "Material.html" },
    { titulo: "Mapa de micro rutas de recolección", desc: "Mapa de las rutas programadas de recolección en Villavicencio.", cat: "Rutas", tipo: "Imagen", url: "../img/Mapa de rutas.jpg", pagina: "Mapas Rutas.html" }
  ];
  var PAGE_SIZE = 6;

  var q = document.getElementById("docQ");
  var filters = document.getElementById("docFilters");
  var list = document.getElementById("docList");
  var pager = document.getElementById("docPager");
  var count = document.getElementById("docCount");
  if (!q || !list) return;

  var state = { cat: "Todos", text: "", page: 1 };

  function norm(s) {
    return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }
  function link(text, href, cls, extra) {
    var a = el("a", cls, text);
    a.href = encodeURI(href);
    if (extra) Object.keys(extra).forEach(function (k) { a.setAttribute(k, extra[k]); });
    return a;
  }

  function cats() {
    var c = ["Todos"];
    DOCS.forEach(function (d) { if (c.indexOf(d.cat) < 0) c.push(d.cat); });
    return c;
  }

  function buildFilters() {
    cats().forEach(function (c) {
      var b = el("button", "doc-chip", c);
      b.type = "button";
      b.setAttribute("aria-pressed", String(c === state.cat));
      b.addEventListener("click", function () {
        state.cat = c; state.page = 1;
        Array.prototype.forEach.call(filters.children, function (x) {
          x.setAttribute("aria-pressed", String(x === b));
        });
        render();
      });
      filters.appendChild(b);
    });
  }

  function filtered() {
    var t = norm(state.text);
    return DOCS.filter(function (d) {
      var okCat = state.cat === "Todos" || d.cat === state.cat;
      var okTxt = !t || norm(d.titulo + " " + d.desc + " " + d.cat).indexOf(t) >= 0;
      return okCat && okTxt;
    });
  }

  function card(d) {
    var a = el("article", "doc-card");
    var top = el("div", "doc-meta");
    top.appendChild(el("span", "doc-tag", d.cat));
    top.appendChild(el("span", "doc-type", d.tipo));
    a.appendChild(top);
    a.appendChild(el("h3", null, d.titulo));
    a.appendChild(el("p", null, d.desc));
    var act = el("div", "doc-actions");
    act.appendChild(link("Ver", d.url, "btn btn-dark", { target: "_blank", rel: "noopener" }));
    act.appendChild(link("Descargar", d.url, "btn btn-outline", { download: "" }));
    if (d.pagina) act.appendChild(link("Más información", d.pagina, "doc-more"));
    a.appendChild(act);
    return a;
  }

  function renderPager(pages) {
    pager.textContent = "";
    if (pages <= 1) return;
    function btn(label, page, opts) {
      var b = el("button", "pager-btn", label);
      b.type = "button";
      if (opts && opts.disabled) b.disabled = true;
      if (opts && opts.current) b.setAttribute("aria-current", "page");
      if (opts && opts.aria) b.setAttribute("aria-label", opts.aria);
      b.addEventListener("click", function () { state.page = page; render(); list.scrollIntoView({ behavior: "smooth", block: "start" }); });
      pager.appendChild(b);
    }
    btn("‹", state.page - 1, { disabled: state.page === 1, aria: "Página anterior" });
    for (var i = 1; i <= pages; i++) btn(String(i), i, { current: i === state.page, aria: "Página " + i });
    btn("›", state.page + 1, { disabled: state.page === pages, aria: "Página siguiente" });
  }

  function render() {
    var items = filtered();
    var pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    if (state.page > pages) state.page = pages;
    var slice = items.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);
    list.textContent = "";
    if (!items.length) {
      list.appendChild(el("p", "doc-empty", "No encontramos documentos con esos criterios."));
    } else {
      slice.forEach(function (d) { list.appendChild(card(d)); });
    }
    count.textContent = items.length === 1 ? "1 documento" : items.length + " documentos";
    renderPager(pages);
  }

  q.addEventListener("input", function () { state.text = q.value; state.page = 1; render(); });
  buildFilters();
  render();
})();
