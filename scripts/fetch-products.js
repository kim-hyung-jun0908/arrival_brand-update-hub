const fs = require('fs/promises');
const path = require('path');
const cheerio = require('cheerio');
const { chromium } = require('playwright');

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data');
const SHOT_DIR = path.join(ROOT, 'screenshots');
const MANUAL_OVERRIDES_PATH = path.join(DATA_DIR, 'manual-overrides.json');

const ENABLE_PROXY = process.env.ARRIVAL_ENABLE_PROXY === '1';
const PROXY_PREFIX = process.env.ARRIVAL_PROXY_PREFIX || '';

const BRANDS = [
  {
    key: 'tonywack',
    name: 'Tonywack',
    url: 'https://tonywack.com/category/new-arrivals/492/',
    selectors: {
      card: ['.prdList > li', '.xans-product-listnormal .prdList > li'],
      name: ['.name a span:nth-child(2)', '.name a', '.name'],
      price: ['.price', '.description .spec li', '.spec li'],
      link: ['.thumbnail a', 'a[href*="/product/"]'],
      image: ['.thumbnail img', 'img'],
      linkPattern: '/product/',
    },
  },
  {
    key: 'automatic',
    name: 'Automatic for the people',
    url: 'https://www.automaticforthepeople.kr/68',
    selectors: {
      card: ['.shop-item._shop_item', '.shop-item', '.item-wrap'],
      name: ['.shop-title', '.item-pay h2', '.item-title', 'h2', 'a'],
      price: ['.pay', '.item-pay-detail .pay', '.item-pay', '.price'],
      link: ['.item-detail a[href*="?idx="]', 'a[href*="?idx="]', 'a'],
      image: ['img'],
      linkPattern: '?idx=',
    },
  },
  {
    key: 'khakis',
    name: 'Khakis',
    url: 'https://khakis2020.com/collections/new',
    selectors: {
      card: ['li.grid__item', '.product-grid-item', '.card-wrapper', '.grid__item'],
      name: ['.card__heading a', '.card__heading', '.full-unstyled-link', 'a[href*="/products/"]'],
      price: ['.price-item--regular', '.price', '.money'],
      link: ['a[href*="/products/"]', 'a'],
      image: ['img'],
      linkPattern: '/products/',
    },
  },
  {
    key: 'onthespot',
    name: 'on the spot',
    url: 'https://www.onthespot.co.kr/display/new',
    selectors: {
      card: ['li', '.goods-list li', '.new-list li', '.product-item'],
      name: ['.prdt-name', '.name', 'a', 'h2'],
      price: ['.prdt-price', '.price', '.pay'],
      link: ['a[href*="/product?prdtNo="]', 'a[href*="/product?"]', 'a'],
      image: ['img'],
      linkPattern: '/product?prdtNo=',
    },
  },
  {
    key: 'cos',
    name: 'COS',
    url: 'https://www.cos.com/ko-kr/men/new-arrivals.html',
    selectors: {
      card: ['.o-product', '.plp-product-list__item', '.product-item', 'li'],
      name: ['.o-product__name', '.product-item-name', 'a'],
      price: ['.o-product__price', '.price', '.product-item-price'],
      link: ['a[href*="/product/"]', 'a'],
      image: ['img'],
      linkPattern: '/product.',
    },
  },
  {
    key: 'arket',
    name: 'Arket',
    url: 'https://www.arket.com/ko-kr/men/new-arrivals.html',
    selectors: {
      card: ['.o-product', '.plp-product-list__item', '.product-item', 'li'],
      name: ['.o-product__name', '.product-item-name', 'a'],
      price: ['.o-product__price', '.price', '.product-item-price'],
      link: ['a[href*="product."]', 'a'],
      image: ['img'],
      linkPattern: '/product.',
    },
  },
];

function toDataScript(payload) {
  return `window.ARRIVAL_DATA = ${JSON.stringify(payload, null, 2)};\n`;
}

function clean(value) {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function abs(url, sourceUrl) {
  if (!url) return '';
  try {
    return new URL(url, sourceUrl).href;
  } catch {
    return '';
  }
}

function pickPrice(raw) {
  const txt = clean(raw);
  if (!txt) return '';
  const hit = txt.match(/(?:₩\s?[\d,]+|[\d,]+\s?(?:원|KRW)|KRW\s?[\d,]+)/i);
  return hit ? clean(hit[0]) : '';
}

function normalizeName(rawName, priceText) {
  let name = clean(rawName);
  if (!name) return '';
  if (priceText) name = name.replace(priceText, '');
  name = name.replace(/^상품명\s*:\s*/i, '');
  name = name.replace(/판매가\s*:.*$/i, '');
  name = name.replace(/^NEW\s+/i, '');
  return clean(name);
}

function dedupeProducts(items, limit = 4) {
  const out = [];
  const seen = new Set();

  for (const item of items) {
    const normalized = {
      name: clean(item.name),
      price: clean(item.price) || '가격 정보 확인 필요',
      image: clean(item.image),
      url: clean(item.url),
    };

    if (!normalized.name || !normalized.url || !normalized.image) continue;
    if (seen.has(normalized.url)) continue;
    seen.add(normalized.url);
    out.push(normalized);
    if (out.length >= limit) break;
  }

  return out;
}

function toProxyUrl(url) {
  if (!ENABLE_PROXY || !PROXY_PREFIX) return '';
  if (PROXY_PREFIX.includes('{url}')) return PROXY_PREFIX.replace('{url}', encodeURIComponent(url));
  return `${PROXY_PREFIX}${url}`;
}

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(SHOT_DIR, { recursive: true });
}

async function loadManualOverrides() {
  try {
    const raw = await fs.readFile(MANUAL_OVERRIDES_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function extractFromDirectHtml(brand, html, sourceUrl) {
  const $ = cheerio.load(html);

  if (brand.key === 'automatic') {
    const items = [];

    $('.shop-item._shop_item, .shop-item').each((_, el) => {
      const card = $(el);
      let props = {};
      const rawProps = card.attr('data-product-properties');
      if (rawProps) {
        try {
          props = JSON.parse(rawProps.replace(/&quot;/g, '"'));
        } catch {
          props = {};
        }
      }

      const detailLink =
        card.find('.item-detail a[href*="?idx="]').first().attr('href') ||
        card.find('a[href*="?idx="]').first().attr('href') ||
        '';

      const image = card.find('img').first().attr('src') || card.find('img').first().attr('data-src') || '';
      const title =
        props.name ||
        clean(card.find('.shop-title').first().text()) ||
        clean(card.find('h2').first().text());
      const priceRaw =
        (props.price && `${Number(props.price).toLocaleString('ko-KR')}원`) ||
        clean(card.find('.pay').first().text());

      items.push({
        name: normalizeName(title, pickPrice(priceRaw)),
        price: pickPrice(priceRaw),
        image: abs(image, sourceUrl),
        url: abs(detailLink, sourceUrl),
      });
    });

    return dedupeProducts(items);
  }

  if (brand.key === 'cos') {
    const items = [];

    $('.o-product').each((_, el) => {
      const node = $(el);
      const parentLink = node.parents('a').first();
      const toUrl = parentLink.attr('data-tourl') || parentLink.attr('href') || '';
      const name = node.attr('data-name') || clean(node.find('.name').first().text()) || '';
      const sellRaw = node.attr('data-sellprc') || node.attr('data-sellPrc') || '';
      const price = sellRaw && /^\d+$/.test(sellRaw) ? `${Number(sellRaw).toLocaleString('ko-KR')}원` : '';
      const image =
        node.find('img').first().attr('src') ||
        node.find('img').first().attr('data-src') ||
        node.find('img').first().attr('data-original') ||
        '';

      items.push({
        name: normalizeName(name, price),
        price,
        image: abs(image, sourceUrl),
        url: abs(toUrl, sourceUrl),
      });
    });

    if (items.length >= 4) return dedupeProducts(items);

    // fallback: URL-only extraction from embedded source
    const urlMatches = [...html.matchAll(/\/ko-kr\/men\/new-arrivals\/product\.[^"'\s<]+\.html\?slitmCd=[^"'\s<]+/g)].map((m) => m[0]);
    const urlOnly = [...new Set(urlMatches)].slice(0, 4).map((href) => {
      const slug = href.split('/product.')[1]?.split('.html')[0] || '';
      const name = slug
        .split('.')
        .shift()
        ?.replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()) ||
        '상품명 확인 필요';

      return {
        name,
        price: '가격 정보 확인 필요',
        image: 'https://via.placeholder.com/750x1000?text=COS',
        url: abs(href, sourceUrl),
      };
    });

    return dedupeProducts(urlOnly);
  }

  if (brand.key === 'arket') {
    const items = [];

    $('a[href*="product."]').each((_, el) => {
      const a = $(el);
      const href = a.attr('href') || '';
      if (!/\/men\/new-arrivals\/product\./.test(href)) return;
      const container = a.closest('li, article, div');
      const text = clean(container.text());
      const price = pickPrice(text);
      const name = clean(a.attr('aria-label')) || clean(a.attr('title')) || clean(a.text()) || clean(container.find('h2').first().text());
      const image =
        a.find('img').first().attr('src') ||
        a.find('img').first().attr('data-src') ||
        container.find('img').first().attr('src') ||
        '';

      items.push({
        name: normalizeName(name, price),
        price,
        image: abs(image, sourceUrl),
        url: abs(href, sourceUrl),
      });
    });

    return dedupeProducts(items);
  }

  if (brand.key === 'onthespot') {
    const items = [];

    $('a[href*="/product?prdtNo="]').each((_, el) => {
      const a = $(el);
      const href = a.attr('href') || '';
      const container = a.closest('li, article, div');
      const text = clean(container.text());
      const price = pickPrice(text);
      const name =
        clean(a.attr('aria-label')) ||
        clean(a.attr('title')) ||
        clean(container.find('h2, .prdt-name, .name').first().text()) ||
        clean(a.text());
      const image =
        a.find('img').first().attr('src') ||
        a.find('img').first().attr('data-src') ||
        container.find('img').first().attr('src') ||
        '';

      items.push({
        name: normalizeName(name, price),
        price,
        image: abs(image, sourceUrl),
        url: abs(href, sourceUrl),
      });
    });

    return dedupeProducts(items);
  }

  return [];
}

async function fetchHtml(url, useProxy = false) {
  const target = useProxy ? toProxyUrl(url) : url;
  if (!target) return '';

  const response = await fetch(target, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      referer: 'https://www.google.com/',
    },
  });

  if (!response.ok) return '';
  return response.text();
}

async function scrapeWithPlaywright(browser, brand) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 2200 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    locale: 'ko-KR',
  });

  try {
    await page.goto(brand.url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForTimeout(6000);

    const screenshotPath = path.join('screenshots', `${brand.key}.png`);
    await page.screenshot({ path: path.join(ROOT, screenshotPath), fullPage: true });

    const title = await page.title();
    const html = await page.content();
    const blocked = /access denied|forbidden|captcha|permission/i.test(title + html.slice(0, 5000));

    let products = [];
    if (!blocked) {
      products = await page.evaluate(({ selectors, sourceUrl }) => {
        const clean = (value) => (value || '').replace(/\s+/g, ' ').trim();
        const abs = (url) => {
          if (!url) return '';
          try {
            return new URL(url, sourceUrl).href;
          } catch {
            return '';
          }
        };
        const pickPrice = (raw) => {
          const txt = clean(raw);
          const hit = txt.match(/(?:₩\s?[\d,]+|[\d,]+\s?(?:원|KRW)|KRW\s?[\d,]+)/i);
          return hit ? clean(hit[0]) : '';
        };

        const cards = [];
        for (const sel of selectors.card) {
          const nodes = Array.from(document.querySelectorAll(sel));
          cards.push(...nodes);
          if (nodes.length >= 4) break;
        }

        const seen = new Set();
        const items = [];

        for (const card of cards) {
          if (seen.has(card)) continue;
          seen.add(card);

          const link = selectors.link.map((sel) => card.querySelector(sel)).find(Boolean);
          const imageNode = selectors.image.map((sel) => card.querySelector(sel)).find(Boolean);
          const nameNode = selectors.name.map((sel) => card.querySelector(sel)).find(Boolean);
          const priceNode = selectors.price.map((sel) => card.querySelector(sel)).find(Boolean);

          const url = abs(link?.getAttribute('href') || link?.href || '');
          const image = abs(
            imageNode?.getAttribute('src') ||
              imageNode?.getAttribute('data-src') ||
              imageNode?.getAttribute('data-original') ||
              '',
          );

          const name = clean(
            link?.getAttribute('aria-label') ||
              link?.getAttribute('title') ||
              nameNode?.textContent ||
              link?.textContent ||
              '',
          );
          const price = pickPrice(priceNode?.textContent || card.textContent || '');

          if (!url || !name || !image) continue;
          if (selectors.linkPattern && !url.includes(selectors.linkPattern)) continue;
          if (items.some((v) => v.url === url)) continue;
          items.push({ name, price: price || '가격 정보 확인 필요', image, url });
          if (items.length >= 4) break;
        }

        // fallback: anchor-based extraction for sites where card wrappers are unstable
        if (items.length < 4) {
          const anchors = Array.from(document.querySelectorAll('a[href]')).filter((a) => {
            const href = a.getAttribute('href') || '';
            const hasImage = Boolean(a.querySelector('img'));
            return hasImage && (!selectors.linkPattern || href.includes(selectors.linkPattern));
          });

          for (const a of anchors) {
            const href = a.getAttribute('href') || a.href || '';
            const imageNode = a.querySelector('img');
            const image = abs(
              imageNode?.getAttribute('src') ||
                imageNode?.getAttribute('data-src') ||
                imageNode?.getAttribute('data-original') ||
                '',
            );
            const parentText = clean(a.closest('li,article,div,section')?.textContent || '');
            const price = pickPrice(parentText);
            const name = clean(
              a.getAttribute('aria-label') || a.getAttribute('title') || a.textContent || parentText,
            );
            const url = abs(href);

            if (!url || !name || !image) continue;
            if (selectors.linkPattern && !url.includes(selectors.linkPattern)) continue;
            if (items.some((v) => v.url === url)) continue;
            items.push({ name, price: price || '가격 정보 확인 필요', image, url });
            if (items.length >= 4) break;
          }
        }

        return items;
      }, { selectors: brand.selectors, sourceUrl: brand.url });
    }

    return {
      title,
      screenshot: screenshotPath,
      blocked,
      products: dedupeProducts(products),
      note: blocked ? '브라우저 자동화 접근이 차단되었습니다.' : '',
    };
  } finally {
    await page.close();
  }
}

function formatKhakisNames(items) {
  return items.map((item) => {
    try {
      const slug = new URL(item.url).pathname.split('/').filter(Boolean).pop() || '';
      if (!slug) return item;
      const normalized = slug
        .replace(/-/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return { ...item, name: normalized || item.name };
    } catch {
      return item;
    }
  });
}

async function scrapeBrand(browser, brand, manualOverrides) {
  const strategies = [];

  let title = '';
  let screenshot = '';
  let note = '';
  let products = [];

  // 1) Playwright (screenshot + dynamic DOM)
  try {
    const res = await scrapeWithPlaywright(browser, brand);
    title = res.title;
    screenshot = res.screenshot;
    note = res.note;
    products = res.products;
    strategies.push({ strategy: 'playwright', items: products.length, blocked: res.blocked });
  } catch (error) {
    strategies.push({ strategy: 'playwright', items: 0, error: error.message });
  }

  // 2) Official/API endpoint (optional env-based)
  if (products.length < 4) {
    const apiUrl = process.env[`ARRIVAL_API_URL_${brand.key.toUpperCase()}`];
    if (apiUrl) {
      try {
        const response = await fetch(apiUrl, { headers: { accept: 'application/json' } });
        if (response.ok) {
          const json = await response.json();
          const apiItems = Array.isArray(json?.products)
            ? json.products
            : Array.isArray(json)
            ? json
            : [];
          const normalized = dedupeProducts(
            apiItems.map((v) => ({
              name: v.name,
              price: v.price,
              image: abs(v.image, brand.url),
              url: abs(v.url, brand.url),
            })),
          );
          if (normalized.length >= products.length) products = normalized;
          strategies.push({ strategy: 'official_api', items: normalized.length });
        } else {
          strategies.push({ strategy: 'official_api', items: 0, error: `HTTP ${response.status}` });
        }
      } catch (error) {
        strategies.push({ strategy: 'official_api', items: 0, error: error.message });
      }
    } else {
      strategies.push({ strategy: 'official_api', items: 0, skipped: 'ARRIVAL_API_URL_* not set' });
    }
  }

  // 3) Direct HTML fallback
  if (products.length < 4) {
    try {
      const html = await fetchHtml(brand.url, false);
      if (html) {
        const parsed = extractFromDirectHtml(brand, html, brand.url);
        if (parsed.length >= products.length) products = parsed;
        strategies.push({ strategy: 'direct_html', items: parsed.length });
      } else {
        strategies.push({ strategy: 'direct_html', items: 0, error: 'empty response' });
      }
    } catch (error) {
      strategies.push({ strategy: 'direct_html', items: 0, error: error.message });
    }
  }

  // 4) Proxy fallback (disabled by default)
  if (products.length < 4 && ENABLE_PROXY) {
    try {
      const html = await fetchHtml(brand.url, true);
      if (html) {
        const parsed = extractFromDirectHtml(brand, html, brand.url);
        if (parsed.length >= products.length) products = parsed;
        strategies.push({ strategy: 'proxy_html', items: parsed.length, proxyEnabled: true });
      } else {
        strategies.push({ strategy: 'proxy_html', items: 0, error: 'empty response', proxyEnabled: true });
      }
    } catch (error) {
      strategies.push({ strategy: 'proxy_html', items: 0, error: error.message, proxyEnabled: true });
    }
  }

  // 5) Manual override (last fallback)
  if (products.length < 4) {
    const manual = Array.isArray(manualOverrides[brand.key]) ? dedupeProducts(manualOverrides[brand.key]) : [];
    if (manual.length) {
      products = manual.slice(0, 4);
      strategies.push({ strategy: 'manual_override', items: manual.length });
    } else {
      strategies.push({ strategy: 'manual_override', items: 0 });
    }
  }

  if (brand.key === 'khakis') {
    products = formatKhakisNames(products);
  }

  let status = 'ok';
  if (products.length < 4) status = products.length === 0 ? 'blocked' : 'partial';
  if (!note && status !== 'ok') note = '우회 수집 후에도 상품 정보가 4개 미만입니다.';
  if (status === 'ok') note = '';

  return {
    ...brand,
    title,
    screenshot,
    status,
    products: products.slice(0, 4),
    note,
    strategies,
  };
}

async function ensureManualOverridesFile() {
  try {
    await fs.access(MANUAL_OVERRIDES_PATH);
  } catch {
    const template = {
      automatic: [],
      onthespot: [],
      cos: [],
      arket: [],
    };
    await fs.writeFile(MANUAL_OVERRIDES_PATH, JSON.stringify(template, null, 2), 'utf8');
  }
}

async function main() {
  await ensureDirs();
  await ensureManualOverridesFile();
  const manualOverrides = await loadManualOverrides();
  const browser = await chromium.launch({ headless: true });

  try {
    const brands = [];
    for (const brand of BRANDS) {
      console.log(`Scraping ${brand.name} ...`);
      const result = await scrapeBrand(browser, brand, manualOverrides);
      brands.push(result);
      console.log(`  -> ${result.status} (${result.products.length} items)`);
      console.log(`  strategies: ${result.strategies.map((s) => `${s.strategy}:${s.items}`).join(', ')}`);
    }

    const payload = {
      pageName: 'ARRIVAL',
      generatedAt: new Date().toISOString(),
      safety: {
        proxyEnabled: ENABLE_PROXY,
        proxyPrefixSet: Boolean(PROXY_PREFIX),
        proxyNotice:
          '프록시 방식은 제3자 인프라를 통과할 수 있으므로 기본 비활성화되어 있습니다. 필요 시 ARRIVAL_ENABLE_PROXY=1 로 활성화하세요.',
      },
      brands,
    };

    await fs.writeFile(path.join(DATA_DIR, 'products.json'), JSON.stringify(payload, null, 2), 'utf8');
    await fs.writeFile(path.join(DATA_DIR, 'products.js'), toDataScript(payload), 'utf8');

    console.log('\nSaved: data/products.json, data/products.js');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
