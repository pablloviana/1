/* Área de trabalho: janelas que abrem, fecham, arrastam e vêm para a frente; Dock, menus e relógio.
   Só liga em telas largas (html.area). Em tela estreita, ou sem este arquivo, as janelas ficam
   empilhadas e a página rola: nada do conteúdo depende daqui. */
(function () {
  var raiz = document.documentElement;
  var largo = window.matchMedia("(min-width: 900px) and (min-height: 560px)");
  var calmo = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mesa = document.getElementById("desktop");
  var janelas = [].slice.call(document.querySelectorAll(".janela"));
  var app = document.getElementById("app");
  var z = 10, ativa = null;

  function area() { return raiz.classList.contains("area"); }
  function porHash(h) { return h && h.length > 1 ? document.getElementById(decodeURIComponent(h.slice(1))) : null; }
  function atalhoDe(j) { return document.querySelector('.dock a[href="#' + j.id + '"]'); }
  function titulo(j) { return j.querySelector(".jt h2").textContent.replace(/^Nota: /, ""); }

  function marcar() {
    janelas.forEach(function (j) {
      var a = atalhoDe(j);
      if (a) a.classList.toggle("aberta", area() && !j.hidden);
    });
  }
  function focar(j, comFoco) {
    janelas.forEach(function (o) { o.classList.toggle("ativa", o === j); });
    ativa = j;
    if (j) {
      j.style.zIndex = ++z;
      app.textContent = titulo(j);
      if (comFoco) j.focus({ preventScroll: true });
    } else app.textContent = "pabllo";
  }
  function abrir(j, comFoco) {
    if (j.hidden) {
      j.hidden = false;
      if (!calmo.matches) {
        j.classList.add("abrindo");
        j.addEventListener("animationend", function () { j.classList.remove("abrindo"); }, { once: true });
        var a = atalhoDe(j);
        if (a) { a.classList.add("saltando"); setTimeout(function () { a.classList.remove("saltando"); }, 1000); }
      }
    }
    focar(j, comFoco);
    marcar();
  }
  /* minimizar: a janela encolhe até o ícone dela no Dock e então fecha */
  function minimizar(j) {
    var a = atalhoDe(j);
    if (!a || calmo.matches || !j.animate) return fechar(j);
    var r = j.getBoundingClientRect(), d = a.getBoundingClientRect();
    var dx = d.left + d.width / 2 - (r.left + r.width / 2), dy = d.top + d.height / 2 - (r.top + r.height / 2);
    j.animate([{ transform: "none", opacity: 1 }, { transform: "translate(" + dx + "px," + dy + "px) scale(.08)", opacity: .2 }],
      { duration: 300, easing: "cubic-bezier(.5,0,.8,.4)" }).onfinish = function () { fechar(j); };
  }
  function fechar(j) {
    var tinhaFoco = j.contains(document.activeElement);
    j.hidden = true;
    j.classList.remove("cheia");
    marcar();
    var resto = janelas.filter(function (o) { return !o.hidden; }).sort(function (a, b) { return b.style.zIndex - a.style.zIndex; });
    focar(resto[0] || null, false);
    if (tinhaFoco) { var a = atalhoDe(j); if (a) a.focus(); }
  }
  function arrumar() {
    janelas.forEach(function (j) { j.style.left = j.style.top = ""; j.classList.remove("cheia"); });
  }

  /* liga ou desliga o modo área conforme o tamanho da tela */
  function modo() {
    var ligar = largo.matches;
    raiz.classList.toggle("area", ligar);
    janelas.forEach(function (j) {
      j.hidden = ligar ? !j.hasAttribute("data-aberta") : j.id === "lixeira";
      if (!ligar) { j.style.left = j.style.top = j.style.zIndex = ""; j.classList.remove("cheia", "ativa"); }
    });
    document.querySelectorAll(".semaforo button").forEach(function (b) { b.tabIndex = ligar ? 0 : -1; });
    if (ligar) {
      janelas.filter(function (j) { return !j.hidden; }).forEach(function (j) { j.style.zIndex = ++z; });
      var alvo = porHash(location.hash);
      if (alvo && alvo.classList.contains("janela")) abrir(alvo, false);
      else focar(document.getElementById("sobre"), false);
    } else { ativa = null; app.textContent = "pabllo"; }
    marcar();
  }

  /* links para #janela: abrem a janela em vez de rolar */
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    /* o iMac da barra de menus abre "Sobre este Mac" (na pilha, rola até Sobre) */
    if (a && area() && a.closest(".menubar .marca")) { e.preventDefault(); abrir(document.getElementById("mac"), true); }
    else if (a && (area() || a.getAttribute("href") === "#lixeira")) {
      var j = porHash(a.getAttribute("href"));
      if (j && j.classList.contains("janela")) {
        e.preventDefault();
        abrir(j, true);
        history.replaceState(null, "", "#" + j.id);
      }
    }
    var b = e.target.closest("[data-acao]");
    if (b && (area() || b.closest("#lixeira"))) {
      var acao = b.getAttribute("data-acao"), dona = b.closest(".janela");
      if (acao === "fechar") fechar(dona);
      else if (acao === "minimizar") minimizar(dona);
      else if (acao === "ampliar") { dona.classList.toggle("cheia"); focar(dona, false); }
      else if (acao === "fechar-ativa" && ativa) fechar(ativa);
      else if (acao === "ampliar-ativa" && ativa) ativa.classList.toggle("cheia");
      else if (acao === "todas") janelas.forEach(function (j) { if (j.id !== "mac" && j.id !== "lixeira") abrir(j, false); });
      else if (acao === "arrumar") arrumar();
    }
    /* menus da barra */
    var botao = e.target.closest(".menu > button");
    document.querySelectorAll(".menu > button").forEach(function (m) {
      var abre = m === botao && m.getAttribute("aria-expanded") !== "true";
      m.setAttribute("aria-expanded", String(abre));
      document.getElementById(m.getAttribute("aria-controls")).hidden = !abre;
    });
  });
  window.addEventListener("hashchange", function () {
    var j = porHash(location.hash);
    if (j && area() && j.classList.contains("janela")) abrir(j, true);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var aberto = document.querySelector('.menu > button[aria-expanded="true"]');
    if (aberto) { aberto.click(); aberto.focus(); }
    else if (area() && ativa && ativa.contains(document.activeElement)) fechar(ativa);
  });

  /* clicar numa janela traz para a frente; arrastar pela barra de título move */
  janelas.forEach(function (j) {
    j.addEventListener("pointerdown", function () { if (area() && ativa !== j) focar(j, false); }, true);
    var barra = j.querySelector(".jt"), dx, dy, arrastando = false;
    barra.addEventListener("pointerdown", function (e) {
      if (!area() || e.button !== 0 || e.target.closest("button") || j.classList.contains("cheia")) return;
      var r = j.getBoundingClientRect(), m = mesa.getBoundingClientRect();
      dx = e.clientX - (r.left - m.left); dy = e.clientY - (r.top - m.top);
      arrastando = true;
      barra.setPointerCapture(e.pointerId);
    });
    barra.addEventListener("pointermove", function (e) {
      if (!arrastando) return;
      var m = mesa.getBoundingClientRect();
      var x = Math.min(Math.max(e.clientX - dx, 60 - j.offsetWidth), m.width - 60);
      var y = Math.min(Math.max(e.clientY - dy, 0), m.height - 110);
      j.style.left = x + "px"; j.style.top = y + "px";
    });
    function soltar() { arrastando = false; }
    barra.addEventListener("pointerup", soltar);
    barra.addEventListener("pointercancel", soltar);
    barra.addEventListener("dblclick", function (e) { if (area() && !e.target.closest("button")) j.classList.toggle("cheia"); });
  });

  /* relógio da barra de menus */
  var relogio = document.getElementById("relogio");
  function hora() {
    var d = new Date();
    relogio.textContent = d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "") + " " +
      d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  hora(); setInterval(hora, 20000);

  /* Dock: os ícones crescem conforme a distância do ponteiro, como no Mac */
  var dock = document.querySelector(".dock"), itens = [].slice.call(dock.querySelectorAll("li:not(.sep)"));
  var MAX = 1.9, ALCANCE = 150, px = null, quadro = 0;
  function lupa() {
    quadro = 0;
    itens.forEach(function (li) {
      var s = 1;
      if (px !== null) {
        var r = li.getBoundingClientRect(), d = Math.abs(px - (r.left + r.width / 2));
        if (d < ALCANCE) s = 1 + (MAX - 1) * Math.cos(d / ALCANCE * Math.PI / 2);
      }
      li.style.setProperty("--s", s.toFixed(3));
    });
  }
  dock.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse" || calmo.matches || !window.matchMedia("(min-width: 561px)").matches) return;
    dock.classList.add("mag");
    px = e.clientX;
    if (!quadro) quadro = requestAnimationFrame(lupa);
  });
  dock.addEventListener("pointerleave", function () {
    px = null;
    dock.classList.remove("mag");
    itens.forEach(function (li) { li.style.removeProperty("--s"); });
  });

  largo.addEventListener("change", modo);
  modo();
})();

