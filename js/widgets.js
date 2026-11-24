/* Calendário local com navegação entre meses. */
(function () {
  var today = new Date(), month = new Date(today.getFullYear(), today.getMonth(), 1);
  var byId = function (id) { return document.getElementById(id); };
  function calendar() {
    byId('calendar-title').textContent = month.toLocaleDateString('pt-BR', {month: 'long', year: 'numeric'});
    var body = byId('calendar-days'); body.replaceChildren();
    var start = month.getDay(), count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    for (var i = 0; i < Math.ceil((start + count) / 7) * 7; i++) {
      if (i % 7 === 0) var row = body.insertRow();
      var cell = row.insertCell(), day = i - start + 1;
      if (day > 0 && day <= count) {
        cell.textContent = day;
        if (day === today.getDate() && month.getMonth() === today.getMonth() && month.getFullYear() === today.getFullYear()) cell.setAttribute('aria-current', 'date');
      }
    }
  }
  byId('month-prev').addEventListener('click', function () { month.setMonth(month.getMonth() - 1); calendar(); });
  byId('month-next').addEventListener('click', function () { month.setMonth(month.getMonth() + 1); calendar(); });
  calendar();
  setInterval(function () { var now = new Date(); if (now.toDateString() !== today.toDateString()) { today = now; month = new Date(now.getFullYear(), now.getMonth(), 1); calendar(); } }, 60000);
})();
