/* Vídeos: ao passar o mouse (ou focar com o teclado) num cartão que tem clipe,
   troca a capa pelo clipe mudo em loop. Sem este arquivo o site continua
   funcionando (capa + link). Respeita "reduzir movimento" do sistema. */
(function () {
  var calmo = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll(".vid.tem-clipe").forEach(function (card) {
    var v = card.querySelector("video");
    if (!v) return;
    function tocar() {
      if (calmo && calmo.matches) return;
      var p = v.play();
      card.classList.add("tocando");
      if (p && p.catch) p.catch(function () { card.classList.remove("tocando"); });
    }
    function parar() { v.pause(); card.classList.remove("tocando"); }
    card.addEventListener("mouseenter", tocar);
    card.addEventListener("mouseleave", parar);
    card.addEventListener("focusin", tocar);
    card.addEventListener("focusout", parar);
  });
})();
