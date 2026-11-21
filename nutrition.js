/* Yaklaşık kalori ve alerjen bilgisi (demo). Gerçek kurulumda işletmenin reçetesine göre güncellenir.
   Alerjen kodları: G gluten, S süt, Y yumurta, F fındık, YF yer fıstığı, AF antep fıstığı, B badem, SY soya */
window.NUTRI = {
  cicek: [290, ["G", "S", "Y"]], bubble: [330, ["G", "S", "Y"]], bruksel: [350, ["G", "S", "Y"]],
  "c-sutlu": [160, ["S", "SY"]], "c-beyaz": [170, ["S", "SY"]], "c-bitter": [150, ["SY"]],
  muz: [50, []], cilek: [15, []], kivi: [25, []], ananas: [25, []], seftali: [25, []], orman: [20, []],
  "s-sade-krep": [60, ["G", "S"]], "s-yaban-krep": [60, ["G", "S"]], "s-limon-krep": [60, ["G", "S"]], "s-kakao-krep": [60, ["G", "S"]],
  "s-findik": [90, ["F"]], "s-yerfistigi": [85, ["YF"]], "s-antep": [80, ["AF"]], "s-badem": [75, ["B"]],
  "s-sutlu-damla": [70, ["S", "SY"]], "s-frambuaz-damla": [70, ["S", "SY"]], "s-beyaz-damla": [75, ["S", "SY"]], "s-bitter-damla": [65, ["SY"]],
  "s-sutlu-pirinc": [60, ["S", "SY"]], "s-frambuaz-pirinc": [60, ["S", "SY"]], "s-beyaz-pirinc": [60, ["S", "SY"]], "s-bitter-pirinc": [55, ["SY"]],
  "s-bonibon": [70, ["S", "SY"]], "s-cakil": [70, ["S"]], "s-hindistan": [60, []], "s-pasta-susu": [40, []],
  "s-kakaolu-biskuvi": [70, ["G", "SY"]], "s-biscoff": [75, ["G", "SY"]], "s-gokkusagi": [40, []], "s-jelibon": [50, []],
  "k-kestane": [80, []], "k-sari-kiraz": [60, []], "k-kirmizi-kiraz": [60, []], "k-visne": [60, []], "k-portakal": [55, []], "k-incir": [70, []], "k-tutti": [55, []], "k-kuru": [65, []],
  "o-sutlu": [90, ["S", "SY"]], "o-beyaz": [95, ["S", "SY"]], "o-bitter": [85, ["SY"]], "o-karamel": [80, ["S"]], "o-antep": [100, ["S", "AF"]], "o-frambuaz": [60, []],
  "o-muz": [60, []], "o-cilek": [60, []], "o-bubblegum": [60, []], "o-limon": [60, []], "o-visne": [60, []], "o-ruby": [90, ["S", "SY"]],
  "d-vanilya": [140, ["S"]], "d-cikolata": [150, ["S"]], "d-karadut": [120, ["S"]], "d-balbadem": [155, ["S", "B"]], "d-oreo": [160, ["S", "G", "SY"]], "d-limon": [100, []]
};
window.ALERJEN = { G: "Gluten", S: "Süt", Y: "Yumurta", F: "Fındık", YF: "Yer fıstığı", AF: "Antep fıstığı", B: "Badem", SY: "Soya" };
window.nutriOf = function (sel) { let k = 0; const al = new Set(); let known = true;
  Object.values(sel).flat().forEach(id => { const n = window.NUTRI[id]; if (!n) { known = false; return; } k += n[0]; n[1].forEach(a => al.add(a)); });
  return { kcal: k, al: [...al].map(a => window.ALERJEN[a]), known }; };
