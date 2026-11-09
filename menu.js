/* Wafforia menüsü — kâğıt sipariş fişinden alındı, PDF gelince birebir düzeltilecek.
   price: ₺ (0 = ücretsiz). color: geçici çizim rengi (gerçek görseller gelince img alanı eklenecek). */
window.MENU = {
  brand: { name: "Wafforia", slogan: "Sınırsız seçim, kusursuz lezzet", reviewUrl: "https://search.google.com/local/writereview?placeid=ChIJeQBZmtjPyhQRyPuno56gHYU" },
  tables: [
    { id: "B1", name: "Bahçe 1" }, { id: "B2", name: "Bahçe 2" }, { id: "B3", name: "Bahçe 3" },
    { id: "B4", name: "Bahçe 4" }, { id: "B5", name: "Bahçe 5" },
    { id: "I1", name: "İç 1" }, { id: "I2", name: "İç 2" }, { id: "I3", name: "İç 3" },
    { id: "I4", name: "İç 4" }, { id: "I5", name: "İç 5" }
  ],
  steps: [
    { id: "hamur", title: "Hamurunu seç", short: "Hamur", single: true, required: true, items: [
      { id: "cicek",   name: "Çiçek Waffle",  price: 320, color: "#D9A25A" },
      { id: "bubble",  name: "Bubble Waffle",  price: 390, color: "#DDA862" },
      { id: "bruksel", name: "Brüksel Waffle", price: 350, color: "#D29A4E" }
    ]},
    { id: "cikolata", title: "Çikolatanı seç", short: "Çikolata", max: 3, items: [
      { id: "c-sutlu",  name: "Sütlü",  color: "#7B4A2A" },
      { id: "c-beyaz",  name: "Beyaz",  color: "#F3E7D3" },
      { id: "c-bitter", name: "Bitter", color: "#3E2416" }
    ]},
    { id: "meyve", title: "Meyvelerini ekle", short: "Meyve", max: 6, items: [
      { id: "muz",    name: "Muz",    color: "#F4E3A1", shape: "slice" },
      { id: "cilek",  name: "Çilek",  color: "#D8293A", shape: "berry" },
      { id: "kivi",   name: "Kivi",   color: "#7FB23A", shape: "slice" },
      { id: "ananas", name: "Ananas", color: "#F6C744", shape: "wedge" },
      { id: "seftali",name: "Şeftali", color: "#F4A15A", shape: "wedge", seasonal: true },
      { id: "orman",  name: "Orman Meyvesi", color: "#4B1F4F", shape: "dot", seasonal: true }
    ]},
    { id: "susleme", title: "Süslemelerini seç", short: "Süsleme", max: 8, note: "Süslemeler ücretsiz", items: [
      { id: "s-sade-krep",   name: "Sade Krep Kırığı", color: "#E8C27E" },
      { id: "s-yaban-krep",  name: "Yaban Mersinli Krep Kırığı", color: "#5B5FA8" },
      { id: "s-limon-krep",  name: "Limonlu Krep Kırığı", color: "#F1E06B" },
      { id: "s-kakao-krep",  name: "Kakaolu Krep Kırığı", color: "#5A3420" },
      { id: "s-findik",      name: "Fındık Parçaları", color: "#B07A45" },
      { id: "s-yerfistigi",  name: "Yer Fıstığı", color: "#C9935A" },
      { id: "s-antep",       name: "Antep Fıstığı", color: "#8DB04A" },
      { id: "s-badem",       name: "File Badem", color: "#EAD2A8" },
      { id: "s-sutlu-damla", name: "Sütlü Damla Çikolata", color: "#7B4A2A" },
      { id: "s-frambuaz-damla", name: "Frambuaz Damla Çikolata", color: "#E25A86" },
      { id: "s-beyaz-damla", name: "Beyaz Damla Çikolata", color: "#F5ECDD" },
      { id: "s-bitter-damla",name: "Bitter Damla Çikolata", color: "#3E2416" },
      { id: "s-sutlu-pirinc",name: "Sütlü Pirinç Patlağı", color: "#8A5A34" },
      { id: "s-frambuaz-pirinc", name: "Frambuaz Pirinç Patlağı", color: "#E77AA0" },
      { id: "s-beyaz-pirinc",name: "Beyaz Pirinç Patlağı", color: "#F3EBDD" },
      { id: "s-bitter-pirinc",name: "Bitter Pirinç Patlağı", color: "#4A2B1A" },
      { id: "s-bonibon",     name: "Mini Bonibon", color: "multi" },
      { id: "s-cakil",       name: "Çakıl Taşı Çikolata", color: "multi" },
      { id: "s-hindistan",   name: "Hindistan Cevizi", color: "#FBF8F1" },
      { id: "s-pasta-susu",  name: "Pasta Süsü", color: "multi" },
      { id: "s-kakaolu-biskuvi", name: "Kakaolu Bisküvi Parçaları", color: "#2E2019" },
      { id: "s-biscoff",     name: "Biscoff Parçaları", color: "#B9733A" },
      { id: "s-gokkusagi",   name: "Gökkuşağı Pasta Süsü", color: "multi" },
      { id: "s-jelibon",     name: "Jelibon", color: "multi" }
    ]},
    { id: "sekerleme", title: "Şekerleme ekle", short: "Şekerleme", max: 3, items: [
      { id: "k-kestane",  name: "Kestane Şekeri", color: "#7A4B2A" },
      { id: "k-sari-kiraz", name: "Sarı Kiraz Şekerleme", color: "#F2C14E" },
      { id: "k-kirmizi-kiraz", name: "Kırmızı Kiraz Şekerleme", color: "#C8102E" },
      { id: "k-visne",    name: "Vişne Şekerleme", color: "#7A0F22" },
      { id: "k-portakal", name: "Portakal Şekerleme", color: "#F08A24" },
      { id: "k-incir",    name: "İncir Şekerleme", color: "#6B3B52" },
      { id: "k-tutti",    name: "Tutti Frutti", color: "multi" },
      { id: "k-kuru",     name: "Kuru Meyve", color: "#B5652E" }
    ]},
    { id: "sos", title: "Sosunu seç", short: "Sos", max: 2, items: [
      { id: "o-sutlu", name: "Sütlü", color: "#7B4A2A" },
      { id: "o-beyaz", name: "Beyaz", color: "#F5ECDD" },
      { id: "o-bitter", name: "Bitter", color: "#3E2416" },
      { id: "o-antep", name: "Antep Fıstığı", color: "#9DBB5A" },
      { id: "o-frambuaz", name: "Frambuaz", color: "#D9416E" },
      { id: "o-karamel", name: "Karamel", color: "#C27A2C" },
      { id: "o-muz", name: "Muz", color: "#F1DC7A" },
      { id: "o-cilek", name: "Çilek", color: "#E0445A" },
      { id: "o-bubblegum", name: "Bubble Gum", color: "#F59AC4" },
      { id: "o-limon", name: "Limon", color: "#F2E35C" },
      { id: "o-visne", name: "Vişne", color: "#8E1430" },
      { id: "o-ruby", name: "Ruby", color: "#C4466E" }
    ]},
    { id: "dondurma", title: "Dondurma ekle", short: "Dondurma", max: 2, items: [
      { id: "d-vanilya", name: "Vanilya", color: "#F7EBC6" },
      { id: "d-cikolata", name: "Çikolata", color: "#6A3D22" },
      { id: "d-karadut", name: "Karadut", color: "#5A1A3E" },
      { id: "d-balbadem", name: "Bal Badem", color: "#E8C27E" },
      { id: "d-oreo", name: "Oreo", color: "#D9D4CC" },
      { id: "d-limon", name: "Limon", color: "#F5EE9A" }
    ]}
  ],
  drinks: [ { id: "cay", name: "Çay", price: 30 } ]
};

/* yardımcılar */
window.MENU_INDEX = (() => {
  const idx = {};
  MENU.steps.forEach(s => s.items.forEach(i => idx[i.id] = { ...i, step: s.id }));
  MENU.drinks.forEach(d => idx[d.id] = { ...d, step: "icecek" });
  return idx;
})();
window.tableName = id => (MENU.tables.find(t => t.id === id) || { name: id }).name;
window.tl = n => new Intl.NumberFormat("tr-TR").format(Math.round(n)) + " ₺";
window.waffleTotal = sel => { const h = MENU.steps[0].items.find(i => i.id === sel.hamur?.[0]); let p = h ? h.price : 0;
  MENU.steps.slice(1).forEach(s => (sel[s.id] || []).forEach(id => p += (MENU_INDEX[id].price || 0))); return p; };
