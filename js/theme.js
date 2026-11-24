/* Mantém o texto da barra legível para qualquer cor escolhida. */
(function () {
  var picker = document.getElementById('menubar-color-picker');
  if (!picker) return;
  var root = document.documentElement;
  var styles = getComputedStyle(root);
  var initial = styles.getPropertyValue('--menubar-bg').trim() || styles.getPropertyValue('--cor-listra-clara').trim();
  if (/^#[0-9a-f]{6}$/i.test(initial)) picker.value = initial;
  function updateColor() {
    var color = picker.value;
    var rgb = color.slice(1).match(/.{2}/g).map(function (hex) {
      var value = parseInt(hex, 16) / 255;
      return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    });
    var luminance = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    var blackContrast = (luminance + 0.05) / 0.05;
    var whiteContrast = 1.05 / (luminance + 0.05);
    root.style.setProperty('--menubar-bg', color);
    root.style.setProperty('--menubar-text', blackContrast >= whiteContrast ? '#000000' : '#ffffff');
  }
  picker.addEventListener('input', updateColor);
  if (styles.getPropertyValue('--menubar-bg').trim()) updateColor();
})();
