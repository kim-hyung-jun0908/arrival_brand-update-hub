(function render() {
  const brandLogos = {
    tonywack: './assets/logos/Tonywack.svg',
    automatic: './assets/logos/Automatic-for-the-people.png',
    khakis: './assets/logos/Khakis.svg',
    cos: './assets/logos/COS.png',
    arket: './assets/logos/ARKET.svg',
  };

  const data = window.ARRIVAL_DATA;
  const root = document.getElementById('brandGrid');
  const generatedAtEl = document.getElementById('generatedAt');
  const brandTpl = document.getElementById('brandTemplate');
  const productTpl = document.getElementById('productTemplate');

  if (!data || !Array.isArray(data.brands)) {
    generatedAtEl.textContent = '데이터를 불러오지 못했습니다.';
    return;
  }

  const generated = new Date(data.generatedAt);
  generatedAtEl.textContent = `업데이트: ${generated.toLocaleString('ko-KR')}`;

  for (const brand of data.brands) {
    const brandNode = brandTpl.content.firstElementChild.cloneNode(true);

    const logo = brandNode.querySelector('.brand-logo');
    const brandNameText = brandNode.querySelector('.brand-name-text');
    const logoPath = brandLogos[brand.key];

    brandNameText.textContent = brand.name;
    if (logoPath) {
      logo.src = logoPath;
      logo.alt = `${brand.name} logo`;
      brandNameText.classList.add('sr-only');
    } else {
      logo.style.display = 'none';
      brandNameText.classList.remove('sr-only');
    }
    const brandLink = brandNode.querySelector('.brand-link');
    brandLink.href = brand.url;

    const note = brand.note || (brand.status === 'ok' ? '최신 상품 4개 자동 수집 완료' : '수집 상태를 확인하세요.');
    brandNode.querySelector('.brand-note').textContent = note;

    const productsWrap = brandNode.querySelector('.products');

    if (!brand.products || brand.products.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'brand-note';
      empty.textContent = '표시할 상품이 없습니다.';
      productsWrap.replaceWith(empty);
    } else {
      for (const item of brand.products.slice(0, 4)) {
        const productNode = productTpl.content.firstElementChild.cloneNode(true);
        productNode.href = item.url || brand.url;

        const image = productNode.querySelector('.product-image');
        image.src = item.image;
        image.alt = item.name;

        productNode.querySelector('.product-name').textContent = item.name;
        productNode.querySelector('.product-price').textContent = item.price || '가격 정보 확인 필요';
        productsWrap.appendChild(productNode);
      }
    }

    root.appendChild(brandNode);
  }
})();
