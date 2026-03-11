window.ARRIVAL_DATA = {
  "pageName": "ARRIVAL",
  "generatedAt": "2026-03-11T13:19:00.771Z",
  "safety": {
    "proxyEnabled": false,
    "proxyPrefixSet": false,
    "proxyNotice": "프록시 방식은 제3자 인프라를 통과할 수 있으므로 기본 비활성화되어 있습니다. 필요 시 ARRIVAL_ENABLE_PROXY=1 로 활성화하세요."
  },
  "brands": [
    {
      "key": "tonywack",
      "name": "Tonywack",
      "url": "https://tonywack.com/category/new-arrivals/492/",
      "selectors": {
        "card": [
          ".prdList > li",
          ".xans-product-listnormal .prdList > li"
        ],
        "name": [
          ".name a span:nth-child(2)",
          ".name a",
          ".name"
        ],
        "price": [
          ".price",
          ".description .spec li",
          ".spec li"
        ],
        "link": [
          ".thumbnail a",
          "a[href*=\"/product/\"]"
        ],
        "image": [
          ".thumbnail img",
          "img"
        ],
        "linkPattern": "/product/"
      },
      "title": "TONYWACK",
      "screenshot": "screenshots/tonywack.png",
      "status": "ok",
      "products": [
        {
          "name": "WOOL CROPPED TAILORED BLOUSON_ BLACK",
          "price": "295,000 KRW",
          "image": "https://cafe24img.poxo.com/tonywack02/web/product/big/202602/d2d36b303bf051b7b2de45c0d3382109.jpg",
          "url": "https://tonywack.com/product/wool-cropped-tailored-blouson-black/4115/category/492/display/1/"
        },
        {
          "name": "SUPER FINE WOOL COMMANDO V-NECK KNIT_ TAUPE MELANGE",
          "price": "145,000 KRW",
          "image": "https://cafe24img.poxo.com/tonywack02/web/product/big/202602/ed311f70e251b958070d2ff8eb4b4d31.jpg",
          "url": "https://tonywack.com/product/super-fine-wool-commando-v-neck-knit-taupe-melange/4211/category/492/display/1/"
        },
        {
          "name": "SUPER FINE WOOL COMMANDO V-NECK KNIT_ PALE YELLOW",
          "price": "145,000 KRW",
          "image": "https://cafe24img.poxo.com/tonywack02/web/product/big/202602/0926427d5878420dcb12ae94d8392415.jpg",
          "url": "https://tonywack.com/product/super-fine-wool-commando-v-neck-knit-pale-yellow/4178/category/492/display/1/"
        },
        {
          "name": "SUPER FINE WOOL COMMANDO V-NECK KNIT_ SLATE GREY",
          "price": "145,000 KRW",
          "image": "https://cafe24img.poxo.com/tonywack02/web/product/big/202602/c3162ca3629531fda2c248c77a5b4822.jpg",
          "url": "https://tonywack.com/product/super-fine-wool-commando-v-neck-knit-slate-grey/4210/category/492/display/1/"
        }
      ],
      "note": "",
      "strategies": [
        {
          "strategy": "playwright",
          "items": 4,
          "blocked": false
        }
      ]
    },
    {
      "key": "automatic",
      "name": "Automatic for the people",
      "url": "https://www.automaticforthepeople.kr/68",
      "selectors": {
        "card": [
          ".shop-item._shop_item",
          ".shop-item",
          ".item-wrap"
        ],
        "name": [
          ".shop-title",
          ".item-pay h2",
          ".item-title",
          "h2",
          "a"
        ],
        "price": [
          ".pay",
          ".item-pay-detail .pay",
          ".item-pay",
          ".price"
        ],
        "link": [
          ".item-detail a[href*=\"?idx=\"]",
          "a[href*=\"?idx=\"]",
          "a"
        ],
        "image": [
          "img"
        ],
        "linkPattern": "?idx="
      },
      "title": "오토매틱 포 더 피플 | AUTOMATIC FOR THE PEOPLE OFFICIAL",
      "screenshot": "screenshots/automatic.png",
      "status": "ok",
      "products": [
        {
          "name": "SUMI DYEING PEACOAT_SUMI",
          "price": "698,000원",
          "image": "https://cdn-optimized.imweb.me/upload/S202208033f92950cd6cab/22b4c0373f23c.jpg",
          "url": "https://www.automaticforthepeople.kr/68/?idx=207"
        },
        {
          "name": "COLD WAR PARKA_CHARCOAL BLACK",
          "price": "1,315,000원",
          "image": "https://cdn-optimized.imweb.me/upload/S202208033f92950cd6cab/7b0432782a66f.jpg",
          "url": "https://www.automaticforthepeople.kr/68/?idx=185"
        },
        {
          "name": "SHAWL NECK COLLAR KNIT_NAVY",
          "price": "354,000원",
          "image": "https://cdn-optimized.imweb.me/upload/S202208033f92950cd6cab/2d7cfa5cfa4e8.jpg",
          "url": "https://www.automaticforthepeople.kr/68/?idx=208"
        },
        {
          "name": "SHAWL NECK COLLAR KNIT_BLACK",
          "price": "354,000원",
          "image": "https://cdn-optimized.imweb.me/upload/S202208033f92950cd6cab/eed5570db20c9.jpg",
          "url": "https://www.automaticforthepeople.kr/68/?idx=206"
        }
      ],
      "note": "",
      "strategies": [
        {
          "strategy": "playwright",
          "items": 4,
          "blocked": false
        }
      ]
    },
    {
      "key": "khakis",
      "name": "Khakis",
      "url": "https://khakis2020.com/collections/new",
      "selectors": {
        "card": [
          "li.grid__item",
          ".product-grid-item",
          ".card-wrapper",
          ".grid__item"
        ],
        "name": [
          ".card__heading a",
          ".card__heading",
          ".full-unstyled-link",
          "a[href*=\"/products/\"]"
        ],
        "price": [
          ".price-item--regular",
          ".price",
          ".money"
        ],
        "link": [
          "a[href*=\"/products/\"]",
          "a"
        ],
        "image": [
          "img"
        ],
        "linkPattern": "/products/"
      },
      "title": "New Arrivals — ( K h a k i s )",
      "screenshot": "screenshots/khakis.png",
      "status": "ok",
      "products": [
        {
          "name": "Loam Fleece Jacket Black Beauty",
          "price": "₩380,000",
          "image": "https://cdn.shopify.com/s/files/1/0505/4742/5436/files/ss26_loam_fleece_jacket-black_beauty-1_1280x.jpg?v=1772710996",
          "url": "https://khakis2020.com/products/loam-fleece-jacket-black-beauty"
        },
        {
          "name": "Alpha X Bunney Ma 1 Bomber Jacket Vintage Green",
          "price": "₩1,490,000",
          "image": "https://cdn.shopify.com/s/files/1/0505/4742/5436/files/ss26_alpha_x_bunney_ma_1_bomber_jacket-vintage_green-1_1280x.jpg?v=1772679423",
          "url": "https://khakis2020.com/products/alpha-x-bunney-ma-1-bomber-jacket-vintage-green"
        },
        {
          "name": "Fine Cotton Seersucker Striped Shirt Saxe",
          "price": "₩420,000",
          "image": "https://cdn.shopify.com/s/files/1/0505/4742/5436/files/ss26_fine_cotton_seersucker_striped_shirt-saxe-1_1280x.jpg?v=1772679417",
          "url": "https://khakis2020.com/products/fine-cotton-seersucker-striped-shirt-saxe"
        },
        {
          "name": "Fine Cotton Seersucker Striped Shirt Black",
          "price": "₩420,000",
          "image": "https://cdn.shopify.com/s/files/1/0505/4742/5436/files/ss26_fine_cotton_seersucker_striped_shirt-black-1_1280x.jpg?v=1772679410",
          "url": "https://khakis2020.com/products/fine-cotton-seersucker-striped-shirt-black"
        }
      ],
      "note": "",
      "strategies": [
        {
          "strategy": "playwright",
          "items": 4,
          "blocked": false
        }
      ]
    },
    {
      "key": "onthespot",
      "name": "on the spot",
      "url": "https://www.onthespot.co.kr/display/new",
      "selectors": {
        "card": [
          "li",
          ".goods-list li",
          ".new-list li",
          ".product-item"
        ],
        "name": [
          ".prdt-name",
          ".name",
          "a",
          "h2"
        ],
        "price": [
          ".prdt-price",
          ".price",
          ".pay"
        ],
        "link": [
          "a[href*=\"/product?prdtNo=\"]",
          "a[href*=\"/product?\"]",
          "a"
        ],
        "image": [
          "img"
        ],
        "linkPattern": "/product?prdtNo="
      },
      "title": "NEW | On the spot",
      "screenshot": "screenshots/onthespot.png",
      "status": "ok",
      "products": [
        {
          "name": "ADIDAS HANDBALL SPEZIAL LO 149,000원",
          "price": "149,000원",
          "image": "https://image.a-rt.com/art/product/2026/03/12307_1773109761665.png?shrink=224:224",
          "url": "https://www.onthespot.co.kr/product?prdtNo=2010125079"
        },
        {
          "name": "NEW BALANCE U204L3K9 159,000원",
          "price": "159,000원",
          "image": "https://image.a-rt.com/art/product/2026/03/30781_1773102923848.png?shrink=224:224",
          "url": "https://www.onthespot.co.kr/product?prdtNo=2010122398"
        },
        {
          "name": "NORTHWAVE ESPRESSO SUEDE 240,000원",
          "price": "240,000원",
          "image": "https://image.a-rt.com/art/product/2026/03/57106_1773194820804.png?shrink=224:224",
          "url": "https://www.onthespot.co.kr/product?prdtNo=2010125123"
        },
        {
          "name": "NORTHWAVE ESPRESSO SUEDE 240,000원",
          "price": "240,000원",
          "image": "https://image.a-rt.com/art/product/2026/03/95261_1773034243179.png?shrink=224:224",
          "url": "https://www.onthespot.co.kr/product?prdtNo=2010125124"
        }
      ],
      "note": "",
      "strategies": [
        {
          "strategy": "playwright",
          "items": 4,
          "blocked": false
        }
      ]
    },
    {
      "key": "cos",
      "name": "COS",
      "url": "https://www.cos.com/ko-kr/men/new-arrivals.html",
      "selectors": {
        "card": [
          ".o-product",
          ".plp-product-list__item",
          ".product-item",
          "li"
        ],
        "name": [
          ".o-product__name",
          ".product-item-name",
          "a"
        ],
        "price": [
          ".o-product__price",
          ".price",
          ".product-item-price"
        ],
        "link": [
          "a[href*=\"/product/\"]",
          "a"
        ],
        "image": [
          "img"
        ],
        "linkPattern": "/product."
      },
      "title": "Access Denied",
      "screenshot": "screenshots/cos.png",
      "status": "ok",
      "products": [
        {
          "name": "LEATHER BLOUSON JACKET",
          "price": "690,000원",
          "image": "https://image.thehyundai.com/static/7/4/5/21/A2/hnm40A2215477_A2215477_720.jpg",
          "url": "https://www.cos.com/ko-kr/men/new-arrivals/product.leather-blouson-jacket-black.1301223001.html?slitmCd=40A2215477"
        },
        {
          "name": "PLEATED WOOL WIDE-LEG TROUSERS",
          "price": "250,000원",
          "image": "https://image.thehyundai.com/static/5/1/6/22/A2/hnm40A2226155_A2226155_720.jpg",
          "url": "https://www.cos.com/ko-kr/men/new-arrivals/product.pleated-wool-wide-leg-trousers-black.1323833001.html?slitmCd=40A2226155"
        },
        {
          "name": "TECHNICAL WINDBREAKER JACKET",
          "price": "220,000원",
          "image": "https://image.thehyundai.com/static/9/3/5/25/A2/hnm40A2255392_BWE_COS_Tier_B_MW_S19_1055_AD_F03_720.jpg",
          "url": "https://www.cos.com/ko-kr/men/new-arrivals/product.technical-windbreaker-jacket-grey.1314405001.html?slitmCd=40A2255392"
        },
        {
          "name": "CHECKED COTTON-TWILL SHIRT",
          "price": "135,000원",
          "image": "https://image.thehyundai.com/static/2/3/5/29/A2/hnm40A2295322_BWE_COS_Tier_B_MW_S09_084_AW_F07_720.jpg",
          "url": "https://www.cos.com/ko-kr/men/new-arrivals/product.checked-cotton-twill-shirt-grey---brown---checked.1326900001.html?slitmCd=40A2295322"
        }
      ],
      "note": "",
      "strategies": [
        {
          "strategy": "playwright",
          "items": 0,
          "blocked": true
        },
        {
          "strategy": "official_api",
          "items": 0,
          "skipped": "ARRIVAL_API_URL_* not set"
        },
        {
          "strategy": "direct_html",
          "items": 0,
          "error": "empty response"
        },
        {
          "strategy": "manual_override",
          "items": 4
        }
      ]
    },
    {
      "key": "arket",
      "name": "Arket",
      "url": "https://www.arket.com/ko-kr/men/new-arrivals.html",
      "selectors": {
        "card": [
          ".o-product",
          ".plp-product-list__item",
          ".product-item",
          "li"
        ],
        "name": [
          ".o-product__name",
          ".product-item-name",
          "a"
        ],
        "price": [
          ".o-product__price",
          ".price",
          ".product-item-price"
        ],
        "link": [
          "a[href*=\"product.\"]",
          "a"
        ],
        "image": [
          "img"
        ],
        "linkPattern": "/product."
      },
      "title": "Access Denied",
      "screenshot": "screenshots/arket.png",
      "status": "ok",
      "products": [
        {
          "name": "왁스 나일론 코튼 재킷",
          "price": "229,000원",
          "image": "https://image.thehyundai.com/static/6/7/5/25/A2/hnm40A2255763_1326628002_750.jpg",
          "url": "https://www.arket.com/ko-kr/men/new-arrivals/product.waxed-nylon-cotton-jacket-light-beige.1326628002.html"
        },
        {
          "name": "CREEK 릴랙스드 배럴 진",
          "price": "169,000원",
          "image": "https://image.thehyundai.com/static/8/0/8/29/A2/hnm40A2298082_1_750.jpg",
          "url": "https://www.arket.com/ko-kr/men/new-arrivals/product.creek-relaxed-barrel-jeans-dark-blue.1321210002.html"
        },
        {
          "name": "릴랙스드 롱 슬리브 티셔츠",
          "price": "79,000원",
          "image": "https://image.thehyundai.com/static/6/2/8/24/A2/hnm40A2248262_3_750.jpg",
          "url": "https://www.arket.com/ko-kr/men/new-arrivals/product.relaxed-long-sleeve-t-shirt-grey-white.1331299001.html"
        },
        {
          "name": "팩커블 토트",
          "price": "65,000원",
          "image": "https://image.thehyundai.com/static/9/5/2/24/A2/hnm40A2242590_1_750.jpg",
          "url": "https://www.arket.com/ko-kr/men/new-arrivals/product.packable-tote-red.0986326014.html"
        }
      ],
      "note": "",
      "strategies": [
        {
          "strategy": "playwright",
          "items": 0,
          "blocked": true
        },
        {
          "strategy": "official_api",
          "items": 0,
          "skipped": "ARRIVAL_API_URL_* not set"
        },
        {
          "strategy": "direct_html",
          "items": 0,
          "error": "empty response"
        },
        {
          "strategy": "manual_override",
          "items": 4
        }
      ]
    }
  ]
};
