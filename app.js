/**
 * BTC/USDT Crypto Calculator & Leverage Simulator - Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- STATE MANAGEMENT ---
  const state = {
    currentTab: 'simular', // 'simular' | 'descobrir'
    currency: 'USD',       // 'USD' | 'BRL'
    exchange: 'binance',   // 'binance' | 'bybit'
    direction: 'long',     // 'long' | 'short'
    asset: {
      symbol: 'BTC',
      pair: 'BTC/USDT',
      price: 63141.00,
      change: -0.34,
      funding: 0.0100
    },
    usdToBrlRate: 5.60,
    
    // Tab 1 Inputs
    sim: {
      entrada: 63141,
      margem: 100,
      alvo: 66298,
      stop: 59984,
      alavancagem: 10
    },

    // Tab 2 Inputs
    disc: {
      calcMode: 'capital', // 'margem' | 'capital'
      alavancagem: 10,
      manualLeverage: false,
      entrada: 63171,
      margem: 1000,
      stop: 60012,
      lossVal: 50,
      lossMode: 'price', // 'percent' | 'price'
      includeFees: true
    },

    // Advanced Params
    params: {
      takerFee: 0.05,
      makerFee: 0.02,
      mmr: 0.40
    },

    // Dynamic API Tickers Cache & Keyboard Search Index
    tickersList: [], // List of { symbol, pair, price, change24h, fundingRate }
    currentFilteredList: [],
    selectedOptionIndex: 0,
    isFetchingApi: false
  };

  // --- DOM ELEMENTS ---
  const el = {
    // Tabs
    tabSimular: document.getElementById('tab-simular'),
    tabDescobrir: document.getElementById('tab-descobrir'),
    tabManual: document.getElementById('tab-manual'),
    viewSimular: document.getElementById('view-simular'),
    viewDescobrir: document.getElementById('view-descobrir'),
    viewManual: document.getElementById('view-manual'),

    // Currency
    btnUsd: document.getElementById('btn-usd'),
    btnBrl: document.getElementById('btn-brl'),
    headerTickerText: document.getElementById('ticker-btc-text'),

    // Asset & Search
    assetSearch: document.getElementById('asset-search'),
    searchSpinner: document.getElementById('search-spinner'),
    assetDropdown: document.getElementById('asset-dropdown'),
    dropdownStatus: document.getElementById('dropdown-status'),
    assetOptionsList: document.getElementById('asset-options-list'),
    selectedPairName: document.getElementById('selected-pair-name'),
    currentAssetPrice: document.getElementById('current-asset-price'),
    currentAssetChange: document.getElementById('current-asset-change'),
    fundingRateText: document.getElementById('funding-rate-text'),
    fundingCountdown: document.getElementById('funding-countdown'),
    btnExBinance: document.getElementById('btn-ex-binance'),
    btnExBybit: document.getElementById('btn-ex-bybit'),

    // Direction
    btnLong: document.getElementById('btn-direction-long'),
    btnShort: document.getElementById('btn-direction-short'),

    // Tab 1 Inputs
    simEntrada: document.getElementById('sim-entrada'),
    simMargem: document.getElementById('sim-margem'),
    simAlvo: document.getElementById('sim-alvo'),
    simStop: document.getElementById('sim-stop'),
    leverageSlider: document.getElementById('leverage-slider'),
    leverageDisplayVal: document.getElementById('leverage-display-val'),
    sliderFill: document.getElementById('slider-fill'),
    sliderThumbBadge: document.getElementById('slider-thumb-badge'),
    leverageCard: document.getElementById('leverage-card'),
    leverageRiskIcon: document.getElementById('leverage-risk-icon'),
    leverageRiskText: document.getElementById('leverage-risk-text'),

    // Accordion
    btnAccordionToggle: document.getElementById('btn-accordion-toggle'),
    accordionCaret: document.getElementById('accordion-caret'),
    accordionContent: document.getElementById('accordion-content'),
    paramTakerFee: document.getElementById('param-taker-fee'),
    paramMakerFee: document.getElementById('param-maker-fee'),
    paramMmr: document.getElementById('param-mmr'),
    paramUsdBrl: document.getElementById('param-usd-brl'),

    // Tab 1 Outputs
    riskPillBadge: document.getElementById('risk-pill-badge'),
    resLiqPrice: document.getElementById('res-liq-price'),
    resLiqDist: document.getElementById('res-liq-dist'),
    resLiqConverted: document.getElementById('res-liq-converted'),

    // Price Ladder Gauge Elements
    pinStop: document.getElementById('pin-stop'),
    pinLiq: document.getElementById('pin-liq'),
    pinEntrada: document.getElementById('pin-entrada'),
    pinAlvo: document.getElementById('pin-alvo'),
    vlineStop: document.getElementById('vline-stop'),
    vlineLiq: document.getElementById('vline-liq'),
    vlineEntrada: document.getElementById('vline-entrada'),
    vlineAlvo: document.getElementById('vline-alvo'),
    tooltipStop: document.getElementById('tooltip-stop'),
    tooltipLiq: document.getElementById('tooltip-liq'),
    tooltipEntrada: document.getElementById('tooltip-entrada'),
    tooltipAlvo: document.getElementById('tooltip-alvo'),
    legtipStop: document.getElementById('legtip-stop'),
    legtipLiq: document.getElementById('legtip-liq'),
    legtipEntrada: document.getElementById('legtip-entrada'),
    legtipAlvo: document.getElementById('legtip-alvo'),
    ladderSegmentedTrack: document.getElementById('ladder-segmented-track'),

    resProfit: document.getElementById('res-profit'),
    resProfitConverted: document.getElementById('res-profit-converted'),
    resRoe: document.getElementById('res-roe'),
    resRiskReward: document.getElementById('res-risk-reward'),
    resBreakeven: document.getElementById('res-breakeven'),
    resStopLoss: document.getElementById('res-stop-loss'),
    resFees: document.getElementById('res-fees'),
    resPosSize: document.getElementById('res-pos-size'),

    resFundingDaily: document.getElementById('res-funding-daily'),
    resFundingDailyConverted: document.getElementById('res-funding-daily-converted'),
    resFundingWeekly: document.getElementById('res-funding-weekly'),
    resFundingApr: document.getElementById('res-funding-apr'),

    btnShareResult: document.getElementById('btn-share-result'),

    // Tab 2 Inputs
    btnCalcMargem: document.getElementById('btn-calc-margem'),
    btnCalcCapital: document.getElementById('btn-calc-capital'),

    discEntrada: document.getElementById('disc-entrada'),
    discMargem: document.getElementById('disc-margem'),
    discStop: document.getElementById('disc-stop'),
    discLossVal: document.getElementById('disc-loss-val'),
    discLossSymbol: document.getElementById('disc-loss-symbol'),
    discModePrice: document.getElementById('disc-mode-price'),
    discModePercent: document.getElementById('disc-mode-percent'),
    discIncludeFees: document.getElementById('disc-include-fees'),

    discLeverageSlider: document.getElementById('disc-leverage-slider'),
    discLeverageDisplayVal: document.getElementById('disc-leverage-display-val'),
    discSliderFill: document.getElementById('disc-slider-fill'),
    discSliderThumbBadge: document.getElementById('disc-slider-thumb-badge'),
    discLeverageCard: document.getElementById('disc-leverage-card'),
    discLeverageRiskIcon: document.getElementById('disc-leverage-risk-icon'),
    discLeverageRiskText: document.getElementById('disc-leverage-risk-text'),

    // Tab 2 Outputs
    discHeroCard: document.getElementById('disc-hero-card'),
    discHeroTitle: document.getElementById('disc-hero-title'),
    discHeroVal: document.getElementById('disc-hero-val'),
    discRoundingIcon: document.getElementById('disc-rounding-icon'),

    discRiskMeta: document.getElementById('disc-risk-meta'),
    discEstLoss: document.getElementById('disc-est-loss'),
    discEstLossBrl: document.getElementById('disc-est-loss-brl'),
    discRoundingText: document.getElementById('disc-rounding-text'),

    discStopDist: document.getElementById('disc-stop-dist'),
    discStopDistBar: document.getElementById('disc-stop-dist-bar'),
    discPosSize: document.getElementById('disc-pos-size'),
    discStopLossVal: document.getElementById('disc-stop-loss-val'),
    discStopLossPct: document.getElementById('disc-stop-loss-pct'),
    discStopLossBar: document.getElementById('disc-stop-loss-bar'),
    discLiqPrice: document.getElementById('disc-liq-price'),
    discLiqDist: document.getElementById('disc-liq-dist'),
    discLiqDistBar: document.getElementById('disc-liq-dist-bar'),
    discStopLiqGap: document.getElementById('disc-stop-liq-gap'),
    discGapBar: document.getElementById('disc-gap-bar'),

    // Toast
    toast: document.getElementById('toast'),
    toastMsg: document.getElementById('toast-msg')
  };

  // --- INITIALIZATION ---
  init();

  function init() {
    setupEventListeners();
    startFundingTimer();
    updateLeverageSliderUI();
    
    // Fetch real USD/BRL rate, then fetch crypto tickers
    fetchUsdBrlRate().then(() => {
      fetchExchangeTickers(state.exchange).then(() => {
        const btcItem = state.tickersList.find(t => t.symbol === 'BTC');
        if (btcItem) {
          selectAssetFromApi(btcItem);
        }
      });
    });
  }

  // --- API FIAT CORS FETCHING (USD/BRL) ---
  async function fetchUsdBrlRate() {
    try {
      const res = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
      const data = await res.json();
      if (data && data.USDBRL && data.USDBRL.bid) {
        const rate = parseFloat(data.USDBRL.bid);
        if (!isNaN(rate) && rate > 0) {
          state.usdToBrlRate = rate;
          el.paramUsdBrl.value = rate.toFixed(2);
        }
      }
    } catch (e) {
      console.warn('Falha ao buscar cotação BRL. Usando fallback de 5.60.', e);
    }
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // Nav Tabs Switcher
    el.tabSimular.addEventListener('click', () => switchTab('simular'));
    el.tabDescobrir.addEventListener('click', () => switchTab('descobrir'));
    el.tabManual.addEventListener('click', () => switchTab('manual'));

    // Currency Toggle
    el.btnUsd.addEventListener('click', () => setCurrency('USD'));
    el.btnBrl.addEventListener('click', () => setCurrency('BRL'));

    // Direction Toggle
    el.btnLong.addEventListener('click', () => setDirection('long'));
    el.btnShort.addEventListener('click', () => setDirection('short'));

    // Exchange Toggle (Binance vs Bybit)
    el.btnExBinance.addEventListener('click', () => setExchange('binance'));
    el.btnExBybit.addEventListener('click', () => setExchange('bybit'));

    // Asset Search Input - Live Typing, Dropdown Open & Keyboard Navigation (Enter, Up, Down)
    el.assetSearch.addEventListener('input', (e) => {
      state.selectedOptionIndex = 0;
      filterAndRenderDropdown(e.target.value);
      el.assetDropdown.classList.add('open');
    });

    el.assetSearch.addEventListener('click', (e) => {
      if (!el.assetDropdown.classList.contains('open')) {
        state.selectedOptionIndex = 0;
        filterAndRenderDropdown(el.assetSearch.value);
        el.assetDropdown.classList.add('open');
      }
    });

    // Format to 2 decimal places on blur
    const formatInputTo2Decimals = (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val > 0) {
        // Only format if price > 1 to not ruin low price coins like PEPE
        if (val >= 1) {
          e.target.value = val.toFixed(2);
        }
      }
    };

    [el.simEntrada, el.simMargem, el.simAlvo, el.simStop, el.discEntrada, el.discMargem, el.discStop].forEach(input => {
      input.addEventListener('blur', formatInputTo2Decimals);
    });

    el.assetSearch.addEventListener('focus', () => {
      state.selectedOptionIndex = 0;
      filterAndRenderDropdown(el.assetSearch.value);
      el.assetDropdown.classList.add('open');
    });

    el.assetSearch.addEventListener('keydown', async (e) => {
      if (!el.assetDropdown.classList.contains('open')) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          el.assetDropdown.classList.add('open');
          filterAndRenderDropdown(el.assetSearch.value);
        }
        return;
      }

      const totalItems = state.currentFilteredList.length;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (totalItems > 0) {
          state.selectedOptionIndex = (state.selectedOptionIndex + 1) % totalItems;
          highlightDropdownOption();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (totalItems > 0) {
          state.selectedOptionIndex = (state.selectedOptionIndex - 1 + totalItems) % totalItems;
          highlightDropdownOption();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (totalItems > 0 && state.selectedOptionIndex >= 0 && state.selectedOptionIndex < totalItems) {
          const selectedAsset = state.currentFilteredList[state.selectedOptionIndex];
          selectAssetFromApi(selectedAsset);
          el.assetDropdown.classList.remove('open');
          el.assetSearch.blur();
        } else {
          const typedSymbol = el.assetSearch.value.trim().toUpperCase().replace('/USDT', '');
          if (typedSymbol) {
            await fetchSingleFuturesSymbol(typedSymbol, state.exchange);
            el.assetDropdown.classList.remove('open');
            el.assetSearch.blur();
          }
        }
      } else if (e.key === 'Escape') {
        el.assetDropdown.classList.remove('open');
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-input-wrapper')) {
        el.assetDropdown.classList.remove('open');
      }
    });

    // Leverage Slider Input
    el.leverageSlider.addEventListener('input', (e) => {
      state.sim.alavancagem = parseInt(e.target.value);
      updateLeverageSliderUI();
      calculateAll();
    });

    el.discLeverageSlider.addEventListener('input', (e) => {
      state.disc.alavancagem = parseInt(e.target.value);
      state.disc.manualLeverage = true;
      updateDiscLeverageSliderUI();
      calculateAll();
    });

    // Accordion Toggle
    el.btnAccordionToggle.addEventListener('click', () => {
      const isOpen = el.accordionContent.classList.contains('open');
      if (isOpen) {
        el.accordionContent.classList.remove('open');
        el.accordionCaret.classList.remove('open');
      } else {
        el.accordionContent.classList.add('open');
        el.accordionCaret.classList.add('open');
      }
    });

    // Advanced Params Inputs
    el.paramTakerFee.addEventListener('input', e => { state.params.takerFee = parseFloat(e.target.value) || 0; calculateAll(); });
    el.paramMakerFee.addEventListener('input', e => { state.params.makerFee = parseFloat(e.target.value) || 0; calculateAll(); });
    el.paramMmr.addEventListener('input', e => { state.params.mmr = parseFloat(e.target.value) || 0; calculateAll(); });
    el.paramUsdBrl.addEventListener('input', e => { 
      state.usdToBrlRate = parseFloat(e.target.value) || 5.60; 
      updateHeaderTicker();
      calculateAll(); 
    });

    // Tab 1 Inputs Real-time Binding
    el.simEntrada.addEventListener('input', e => { state.sim.entrada = parseFloat(e.target.value) || 0; calculateAll(); });
    el.simMargem.addEventListener('input', e => { state.sim.margem = parseFloat(e.target.value) || 0; calculateAll(); });
    el.simAlvo.addEventListener('input', e => { state.sim.alvo = parseFloat(e.target.value) || 0; calculateAll(); });
    el.simStop.addEventListener('input', e => { state.sim.stop = parseFloat(e.target.value) || 0; calculateAll(); });

    // Tab 2 Inputs Real-time Binding
    el.btnCalcMargem.addEventListener('click', () => setDiscCalcMode('margem'));
    el.btnCalcCapital.addEventListener('click', () => setDiscCalcMode('capital'));

    el.discEntrada.addEventListener('input', e => { state.disc.entrada = parseFloat(e.target.value) || 0; state.disc.manualLeverage = false; calculateAll(); });
    el.discMargem.addEventListener('input', e => { state.disc.margem = parseFloat(e.target.value) || 0; state.disc.manualLeverage = false; calculateAll(); });
    el.discStop.addEventListener('input', e => { state.disc.stop = parseFloat(e.target.value) || 0; state.disc.manualLeverage = false; calculateAll(); });
    el.discLossVal.addEventListener('input', e => { state.disc.lossVal = parseFloat(e.target.value) || 0; state.disc.manualLeverage = false; calculateAll(); });

    // Tab 2 Mode Switcher
    el.discModePrice.addEventListener('click', () => setDiscLossMode('price'));
    el.discModePercent.addEventListener('click', () => setDiscLossMode('percent'));

    // Tab 2 Include Fees Toggle
    el.discIncludeFees.addEventListener('change', e => {
      state.disc.includeFees = e.target.checked;
      calculateAll();
    });

    // Share Result Button
    el.btnShareResult.addEventListener('click', () => {
      showToast('Resultado copiado para a área de transferência!');
    });
  }

  // --- API FUTURES CORS FETCHING (BINANCE & BYBIT FUTURES) ---
  async function fetchExchangeTickers(exchange) {
    state.isFetchingApi = true;
    el.searchSpinner.style.display = 'block';
    el.dropdownStatus.textContent = `Carregando mercado de Futuros (${exchange.toUpperCase()} API)...`;

    try {
      if (exchange === 'binance') {
        const [tickerRes, premiumRes] = await Promise.allSettled([
          fetch('https://fapi.binance.com/fapi/v1/ticker/24hr'),
          fetch('https://fapi.binance.com/fapi/v1/premiumIndex')
        ]);

        if (tickerRes.status !== 'fulfilled') throw new Error('Binance Futures API error');
        const tickerData = await tickerRes.value.json();

        let fundingMap = {};
        if (premiumRes.status === 'fulfilled') {
          const premiumData = await premiumRes.value.json();
          if (Array.isArray(premiumData)) {
            premiumData.forEach(item => {
              fundingMap[item.symbol] = parseFloat(item.lastFundingRate ? (item.lastFundingRate * 100) : 0.01);
            });
          }
        }

        state.tickersList = tickerData
          .filter(t => t.symbol.endsWith('USDT'))
          .map(t => {
            const base = t.symbol.replace('USDT', '');
            return {
              symbol: base,
              pair: `${base}/USDT`,
              price: parseFloat(t.lastPrice) || 0,
              change24h: parseFloat(t.priceChangePercent) || 0,
              fundingRate: fundingMap[t.symbol] || 0.0100
            };
          });
      } else {
        const response = await fetch('https://api.bybit.com/v5/market/tickers?category=linear');
        if (!response.ok) throw new Error('Bybit Futures API error');
        const resJson = await response.json();
        
        if (resJson.result && resJson.result.list) {
          state.tickersList = resJson.result.list
            .filter(t => t.symbol.endsWith('USDT'))
            .map(t => {
              const base = t.symbol.replace('USDT', '');
              return {
                symbol: base,
                pair: `${base}/USDT`,
                price: parseFloat(t.lastPrice) || 0,
                change24h: parseFloat(t.price24hPcnt ? (parseFloat(t.price24hPcnt) * 100) : 0),
                fundingRate: parseFloat(t.fundingRate ? (parseFloat(t.fundingRate) * 100) : 0.01)
              };
            });
        }
      }

      el.dropdownStatus.textContent = `${state.tickersList.length} contratos de Futuros (${exchange.toUpperCase()})`;
    } catch (err) {
      console.warn('API Fetch error, falling back to default tickers:', err);
      state.tickersList = [
        { symbol: 'BTC', pair: 'BTC/USDT', price: 63141.00, change24h: -0.34, fundingRate: 0.0100 },
        { symbol: 'ETH', pair: 'ETH/USDT', price: 3420.50, change24h: 1.25, fundingRate: 0.0100 },
        { symbol: 'SOL', pair: 'SOL/USDT', price: 148.20, change24h: -2.10, fundingRate: 0.0150 },
        { symbol: 'BNB', pair: 'BNB/USDT', price: 575.80, change24h: 0.45, fundingRate: 0.0080 },
        { symbol: 'XRP', pair: 'XRP/USDT', price: 0.584, change24h: 3.12, fundingRate: 0.0100 },
        { symbol: 'HYPE', pair: 'HYPE/USDT', price: 42.15, change24h: 8.75, fundingRate: 0.0120 },
        { symbol: 'PEPE', pair: 'PEPE/USDT', price: 0.0000098, change24h: -5.40, fundingRate: 0.0200 },
        { symbol: 'AVAX', pair: 'AVAX/USDT', price: 27.50, change24h: 0.90, fundingRate: 0.0100 }
      ];
      el.dropdownStatus.textContent = `Contratos de Futuros (Modo Offline)`;
    } finally {
      state.isFetchingApi = false;
      el.searchSpinner.style.display = 'none';
      filterAndRenderDropdown(el.assetSearch.value);
    }
  }

  // --- QUERY SINGLE FUTURES SYMBOL DIRECTLY ---
  async function fetchSingleFuturesSymbol(baseSymbol, exchange) {
    const fullSymbol = `${baseSymbol}USDT`;
    el.searchSpinner.style.display = 'block';

    try {
      if (exchange === 'binance') {
        const res = await fetch(`https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${fullSymbol}`);
        if (!res.ok) throw new Error('Symbol not found');
        const t = await res.json();
        
        const item = {
          symbol: baseSymbol,
          pair: `${baseSymbol}/USDT`,
          price: parseFloat(t.lastPrice) || 0,
          change24h: parseFloat(t.priceChangePercent) || 0,
          fundingRate: 0.0100
        };
        selectAssetFromApi(item);
        showToast(`Futuros ${baseSymbol}/USDT carregado da Binance!`);
      } else {
        const res = await fetch(`https://api.bybit.com/v5/market/tickers?category=linear&symbol=${fullSymbol}`);
        if (!res.ok) throw new Error('Symbol not found');
        const resJson = await res.json();
        if (resJson.result && resJson.result.list && resJson.result.list.length > 0) {
          const t = resJson.result.list[0];
          const item = {
            symbol: baseSymbol,
            pair: `${baseSymbol}/USDT`,
            price: parseFloat(t.lastPrice) || 0,
            change24h: parseFloat(t.price24hPcnt ? (parseFloat(t.price24hPcnt) * 100) : 0),
            fundingRate: parseFloat(t.fundingRate ? (parseFloat(t.fundingRate) * 100) : 0.01)
          };
          selectAssetFromApi(item);
          showToast(`Futuros ${baseSymbol}/USDT carregado da Bybit!`);
        }
      }
    } catch (err) {
      showToast(`Ativo de Futuros ${baseSymbol}/USDT não encontrado na ${exchange.toUpperCase()}`);
    } finally {
      el.searchSpinner.style.display = 'none';
    }
  }

  // --- RENDER DYNAMIC AUTOCOMPLETE DROPDOWN WITH KEYBOARD SUPPORT ---
  function filterAndRenderDropdown(query) {
    const cleanQuery = (query || '').trim().toUpperCase().replace('/USDT', '');
    el.assetOptionsList.innerHTML = '';

    state.currentFilteredList = state.tickersList.filter(item => 
      item.symbol.includes(cleanQuery) || item.pair.includes(cleanQuery)
    ).slice(0, 30);

    if (state.currentFilteredList.length === 0) {
      el.assetOptionsList.innerHTML = `<div class="asset-option" style="cursor:default; color:var(--text-muted);">Pressione Enter para buscar "${cleanQuery}/USDT" em Futuros</div>`;
      return;
    }

    if (state.selectedOptionIndex >= state.currentFilteredList.length) {
      state.selectedOptionIndex = 0;
    }

    state.currentFilteredList.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'asset-option';
      div.dataset.index = idx;

      if (idx === state.selectedOptionIndex) {
        div.classList.add('active');
      }

      const changeClass = item.change24h >= 0 ? 'positive' : 'negative';
      const changeSign = item.change24h >= 0 ? '+' : '';

      div.innerHTML = `
        <span class="asset-name">
          <span class="asset-symbol-bold">${item.symbol}</span>/USDT
          <span class="asset-ex-tag">FUTUROS ${state.exchange.toUpperCase()}</span>
        </span>
        <span class="asset-val">
          $${formatNumber(item.price)} 
          <small class="ticker-change ${changeClass}" style="margin-left:6px;">${changeSign}${item.change24h.toFixed(2)}%</small>
        </span>
      `;

      div.addEventListener('click', () => {
        selectAssetFromApi(item);
        el.assetDropdown.classList.remove('open');
      });

      div.addEventListener('mouseenter', () => {
        state.selectedOptionIndex = idx;
        highlightDropdownOption();
      });

      el.assetOptionsList.appendChild(div);
    });
  }

  function highlightDropdownOption() {
    const children = el.assetOptionsList.children;
    for (let i = 0; i < children.length; i++) {
      if (i === state.selectedOptionIndex) {
        children[i].classList.add('active');
        children[i].scrollIntoView({ block: 'nearest' });
      } else {
        children[i].classList.remove('active');
      }
    }
  }

  function selectAssetFromApi(item) {
    state.asset.symbol = item.symbol;
    state.asset.pair = item.pair;
    state.asset.price = item.price;
    state.asset.change = item.change24h;
    if (item.fundingRate) state.asset.funding = item.fundingRate;

    el.assetSearch.value = item.pair;
    el.selectedPairName.innerHTML = `${item.symbol}<span class="pair-denom">/USDT</span>`;
    el.currentAssetPrice.textContent = `$ ${formatNumber(item.price)}`;

    const changeClass = item.change24h >= 0 ? 'ticker-change positive' : 'ticker-change negative';
    const changeSign = item.change24h >= 0 ? '+' : '';
    el.currentAssetChange.className = changeClass;
    el.currentAssetChange.textContent = `${changeSign}${item.change24h.toFixed(2)}%`;
    el.fundingRateText.textContent = `${state.asset.funding.toFixed(4)}%`;

    state.sim.entrada = item.price;
    state.disc.entrada = item.price;
    
    const priceStr = item.price >= 1 ? item.price.toFixed(2) : item.price;
    el.simEntrada.value = priceStr;
    el.discEntrada.value = priceStr;

    if (state.direction === 'long') {
      state.sim.alvo = roundPrice(item.price * 1.05);
      state.sim.stop = roundPrice(item.price * 0.95);
      state.disc.stop = roundPrice(item.price * 0.95);
    } else {
      state.sim.alvo = roundPrice(item.price * 0.95);
      state.sim.stop = roundPrice(item.price * 1.05);
      state.disc.stop = roundPrice(item.price * 1.05);
    }

    el.simAlvo.value = state.sim.alvo >= 1 ? state.sim.alvo.toFixed(2) : state.sim.alvo;
    el.simStop.value = state.sim.stop >= 1 ? state.sim.stop.toFixed(2) : state.sim.stop;
    el.discStop.value = state.disc.stop >= 1 ? state.disc.stop.toFixed(2) : state.disc.stop;

    updateHeaderTicker();
    calculateAll();
  }

  function roundPrice(p) {
    if (p < 1) return parseFloat(p.toFixed(6));
    if (p < 10) return parseFloat(p.toFixed(4));
    return parseFloat(p.toFixed(2));
  }

  function setExchange(ex) {
    state.exchange = ex;
    if (ex === 'binance') {
      el.btnExBinance.classList.add('active');
      el.btnExBybit.classList.remove('active');
    } else {
      el.btnExBybit.classList.add('active');
      el.btnExBinance.classList.remove('active');
    }
    fetchExchangeTickers(ex);
  }

  // --- STEP BUTTON HELPER ---
  window.stepVal = function(inputId, delta) {
    const input = document.getElementById(inputId);
    let val = parseFloat(input.value) || 0;
    val += delta;
    if (val < 0) val = 0;
    input.value = val;
    input.dispatchEvent(new Event('input'));
  };

  // --- PRESET LOSS HELPER ---
  window.setPresetLoss = function(percent) {
    document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
    event.target.classList.add('active');
    
    setDiscLossMode('percent');
    el.discLossVal.value = percent;
    state.disc.lossVal = percent;
    calculateAll();
  };

  // --- TAB & STATE SWITCHERS ---
  function switchTab(tab) {
    state.currentTab = tab;
    
    // Reset all tabs
    el.tabSimular.classList.remove('active');
    el.tabDescobrir.classList.remove('active');
    el.tabManual.classList.remove('active');
    
    // Reset all views
    el.viewSimular.classList.remove('active');
    el.viewDescobrir.classList.remove('active');
    el.viewManual.classList.remove('active');
    
    // Activate selected
    if (tab === 'simular') {
      el.tabSimular.classList.add('active');
      el.viewSimular.classList.add('active');
    } else if (tab === 'descobrir') {
      el.tabDescobrir.classList.add('active');
      el.viewDescobrir.classList.add('active');
    } else if (tab === 'manual') {
      el.tabManual.classList.add('active');
      el.viewManual.classList.add('active');
    }
    
    if (tab === 'manual') {
      document.body.classList.add('manual-active');
    } else {
      document.body.classList.remove('manual-active');
      calculateAll();
    }
  }

  function setCurrency(curr) {
    state.currency = curr;
    if (curr === 'USD') {
      el.btnUsd.classList.add('active');
      el.btnBrl.classList.remove('active');
    } else {
      el.btnBrl.classList.add('active');
      el.btnUsd.classList.remove('active');
    }
    updateHeaderTicker();
    calculateAll();
  }

  function setDirection(dir) {
    state.direction = dir;
    if (dir === 'long') {
      el.btnLong.classList.add('active');
      el.btnShort.classList.remove('active');
    } else {
      el.btnShort.classList.add('active');
      el.btnLong.classList.remove('active');
    }

    // Auto-adjust stop to 5% from current asset price
    if (state.asset && state.asset.price > 0) {
      if (dir === 'long') {
        state.sim.stop = roundPrice(state.asset.price * 0.95);
        state.disc.stop = roundPrice(state.asset.price * 0.95);
      } else {
        state.sim.stop = roundPrice(state.asset.price * 1.05);
        state.disc.stop = roundPrice(state.asset.price * 1.05);
      }
      el.simStop.value = state.sim.stop >= 1 ? state.sim.stop.toFixed(2) : state.sim.stop;
      el.discStop.value = state.disc.stop >= 1 ? state.disc.stop.toFixed(2) : state.disc.stop;
    }

    calculateAll();
  }

  function setDiscLossMode(mode) {
    state.disc.lossMode = mode;
    state.disc.manualLeverage = false;
    if (mode === 'price') {
      el.discModePrice.classList.add('active');
      el.discModePercent.classList.remove('active');
      el.discLossSymbol.textContent = '$';
    } else {
      el.discModePercent.classList.add('active');
      el.discModePrice.classList.remove('active');
      el.discLossSymbol.textContent = '%';
    }
    calculateAll();
  }

  function setDiscCalcMode(mode) {
    state.disc.calcMode = mode;
    state.disc.manualLeverage = false;
    
    if (mode === 'margem') {
      el.btnCalcMargem.classList.add('active');
      el.btnCalcCapital.classList.remove('active');
    } else {
      el.btnCalcCapital.classList.add('active');
      el.btnCalcMargem.classList.remove('active');
      updateDiscLeverageSliderUI(); // apply initial UI colors for manual mode
    }
    calculateAll();
  }

  // --- LEVERAGE SLIDER COLOR LOGIC ---
  function updateLeverageSliderUI() {
    const val = state.sim.alavancagem;
    const max = 125;
    const pct = ((val - 1) / (max - 1)) * 100;

    el.leverageDisplayVal.textContent = `${val}x`;
    el.sliderThumbBadge.textContent = `${val}x`;
    el.sliderThumbBadge.style.left = `${pct}%`;
    el.sliderFill.style.width = `${pct}%`;
    el.leverageSlider.value = val;

    el.leverageCard.classList.remove('level-low', 'level-mid', 'level-orange', 'level-high');

    if (val <= 3) {
      el.leverageCard.classList.add('level-low');
      el.leverageRiskIcon.className = 'ph ph-shield-check';
      el.leverageRiskIcon.style.color = 'var(--green-success)';
      el.leverageRiskText.textContent = 'Alavancagem Conservadora (Baixo Risco: 1x a 3x)';
      el.leverageRiskText.style.color = 'var(--green-success)';
    } else if (val >= 4 && val <= 6) {
      el.leverageCard.classList.add('level-mid');
      el.leverageRiskIcon.className = 'ph ph-shield-warning';
      el.leverageRiskIcon.style.color = 'var(--yellow-warning)';
      el.leverageRiskText.textContent = 'Alavancagem Moderada (Atenção ao Stop: 4x a 6x)';
      el.leverageRiskText.style.color = 'var(--yellow-warning)';
    } else if (val >= 7 && val <= 13) {
      el.leverageCard.classList.add('level-orange');
      el.leverageRiskIcon.className = 'ph ph-warning';
      el.leverageRiskIcon.style.color = 'var(--orange-primary)';
      el.leverageRiskText.textContent = 'Alavancagem Elevada (Cuidado com volatilidade: 7x a 13x)';
      el.leverageRiskText.style.color = 'var(--orange-primary)';
    } else {
      el.leverageCard.classList.add('level-high');
      el.leverageRiskIcon.className = 'ph ph-warning-octagon';
      el.leverageRiskIcon.style.color = 'var(--red-danger)';
      el.leverageRiskText.textContent = 'ALERTA: Alta Alavancagem (≥14x aumenta risco de liquidação rápido!)';
      el.leverageRiskText.style.color = 'var(--red-danger)';
    }
  }

  function updateDiscLeverageSliderUI() {
    const val = state.disc.alavancagem;
    const max = 125;
    const pct = ((val - 1) / (max - 1)) * 100;

    el.discLeverageDisplayVal.textContent = `${val}x`;
    el.discSliderThumbBadge.textContent = `${val}x`;
    el.discSliderThumbBadge.style.left = `${pct}%`;
    el.discSliderFill.style.width = `${pct}%`;
    el.discLeverageSlider.value = val;

    el.discLeverageCard.classList.remove('level-low', 'level-mid', 'level-orange', 'level-high');

    if (val <= 3) {
      el.discLeverageCard.classList.add('level-low');
      el.discLeverageRiskIcon.className = 'ph ph-shield-check';
      el.discLeverageRiskIcon.style.color = 'var(--green-success)';
      el.discLeverageRiskText.textContent = 'Alavancagem Conservadora';
      el.discLeverageRiskText.style.color = 'var(--green-success)';
    } else if (val >= 4 && val <= 6) {
      el.discLeverageCard.classList.add('level-mid');
      el.discLeverageRiskIcon.className = 'ph ph-shield-warning';
      el.discLeverageRiskIcon.style.color = 'var(--yellow-warning)';
      el.discLeverageRiskText.textContent = 'Alavancagem Moderada';
      el.discLeverageRiskText.style.color = 'var(--yellow-warning)';
    } else if (val >= 7 && val <= 13) {
      el.discLeverageCard.classList.add('level-orange');
      el.discLeverageRiskIcon.className = 'ph ph-warning';
      el.discLeverageRiskIcon.style.color = 'var(--orange-primary)';
      el.discLeverageRiskText.textContent = 'Alavancagem Elevada';
      el.discLeverageRiskText.style.color = 'var(--orange-primary)';
    } else {
      el.discLeverageCard.classList.add('level-high');
      el.discLeverageRiskIcon.className = 'ph ph-warning-octagon';
      el.discLeverageRiskIcon.style.color = 'var(--red-danger)';
      el.discLeverageRiskText.textContent = 'ALERTA: Alta Alavancagem';
      el.discLeverageRiskText.style.color = 'var(--red-danger)';
    }
  }

  // --- MAIN CALCULATION ENGINE ---
  function calculateAll() {
    calculateTab1Simular();
    calculateTab2Descobrir();
  }

  // =======================================================
  // TAB 1 LOGIC: SIMULAR OPERAÇÃO & PRICE POSITION LADDER
  // =======================================================
  function calculateTab1Simular() {
    const { entrada, margem, alvo, stop, alavancagem } = state.sim;
    const { takerFee, mmr } = state.params;
    const isLong = state.direction === 'long';

    if (entrada <= 0 || margem <= 0 || alavancagem <= 0) return;

    // 1. Position Size & Quantity
    const posSizeUsd = margem * alavancagem;
    const btcQty = posSizeUsd / entrada;

    // 2. Total Trading Fees (Entry + Exit Taker Fee)
    const feesUsd = posSizeUsd * (takerFee / 100) * 2;

    // 3. Liquidation Price
    let liqPrice = 0;
    if (isLong) {
      liqPrice = entrada * (1 - (1 / alavancagem) + (mmr / 100));
    } else {
      liqPrice = entrada * (1 + (1 / alavancagem) - (mmr / 100));
    }
    if (liqPrice < 0) liqPrice = 0;

    // Distance to Liquidation (%)
    let liqDistPct = 0;
    if (isLong) {
      liqDistPct = Math.max(0, ((entrada - liqPrice) / entrada) * 100);
    } else {
      liqDistPct = Math.max(0, ((liqPrice - entrada) / entrada) * 100);
    }

    // 4. Net Profit at Target Price
    let rawProfit = 0;
    if (isLong) {
      rawProfit = (alvo - entrada) * btcQty;
    } else {
      rawProfit = (entrada - alvo) * btcQty;
    }
    const netProfitUsd = rawProfit - feesUsd;
    const roePct = (netProfitUsd / margem) * 100;

    // 5. Max Loss at Stop Price
    let rawStopLoss = 0;
    if (isLong) {
      rawStopLoss = (entrada - stop) * btcQty;
    } else {
      rawStopLoss = (stop - entrada) * btcQty;
    }
    const totalStopLossUsd = rawStopLoss + feesUsd;
    const stopLossPctOfMargin = (totalStopLossUsd / margem) * 100;

    // 6. Risk / Reward Ratio
    let riskRewardRatio = 0;
    const priceGain = Math.abs(alvo - entrada);
    const priceRisk = Math.abs(entrada - stop);
    if (priceRisk > 0) {
      riskRewardRatio = priceGain / priceRisk;
    }

    // 7. Break-even Price
    let breakevenPrice = 0;
    if (isLong) {
      breakevenPrice = entrada + (feesUsd / btcQty);
    } else {
      breakevenPrice = entrada - (feesUsd / btcQty);
    }

    // 8. Daily & Weekly Funding Fee
    const fundingRateDay = state.asset.funding * 3;
    const dailyFundingUsd = posSizeUsd * (fundingRateDay / 100);
    const weeklyFundingUsd = dailyFundingUsd * 7;
    const aprPct = fundingRateDay * 365;

    // --- RENDER TAB 1 RESULTS ---

    if (alavancagem <= 3 && liqDistPct > 20) {
      el.riskPillBadge.textContent = 'BAIXO';
      el.riskPillBadge.className = 'risk-pill-badge pill-low';
    } else if (alavancagem <= 13 && liqDistPct > 8) {
      el.riskPillBadge.textContent = 'ALTO';
      el.riskPillBadge.className = 'risk-pill-badge pill-high';
    } else {
      el.riskPillBadge.textContent = 'EXTREMO';
      el.riskPillBadge.className = 'risk-pill-badge pill-extreme';
    }

    // Liquidation Box
    el.resLiqPrice.textContent = formatCurrency(liqPrice);
    el.resLiqDist.textContent = `${liqDistPct.toFixed(1)}%`;
    el.resLiqConverted.textContent = `≈ ${formatBrl(liqPrice)}`;

    // Profit & ROE Box
    const signProfit = netProfitUsd >= 0 ? '+' : '-';
    const absProfit = Math.abs(netProfitUsd);
    el.resProfit.textContent = `${signProfit}${formatCurrency(absProfit)}`;
    el.resProfit.className = netProfitUsd >= 0 ? 'hero-main-val success-text' : 'hero-main-val danger-text';
    el.resProfitConverted.textContent = `≈ ${formatBrl(absProfit)}`;
    
    const signRoe = roePct >= 0 ? '+' : '';
    el.resRoe.textContent = `${signRoe}${roePct.toFixed(2)}% ROE`;

    // Stats List
    el.resRiskReward.textContent = `1 : ${riskRewardRatio.toFixed(2)}`;
    el.resBreakeven.textContent = formatCurrency(breakevenPrice);
    el.resStopLoss.textContent = `-${formatCurrency(totalStopLossUsd)} (${stopLossPctOfMargin.toFixed(0)}%)`;
    el.resFees.textContent = `-${formatCurrency(feesUsd)}`;
    el.resPosSize.textContent = formatCurrency(posSizeUsd);

    // Funding Card
    el.resFundingDaily.textContent = `-${formatCurrency(dailyFundingUsd)}`;
    el.resFundingDailyConverted.textContent = `≈ ${formatBrl(dailyFundingUsd)}`;
    el.resFundingWeekly.textContent = `-${formatCurrency(weeklyFundingUsd)}`;
    el.resFundingApr.textContent = `-${aprPct.toFixed(2)}%`;

    // DYNAMIC PRICE LADDER RENDERER WITH TOOLTIPS & PINS
    renderPriceLadderGauge(entrada, stop, liqPrice, alvo, isLong);
  }

  // --- DYNAMIC PRICE LADDER & TOOLTIP RENDERER ---
  function renderPriceLadderGauge(entrada, stop, liq, alvo, isLong) {
    // 1. Determine min and max price bounds with padding
    const allPrices = [entrada, stop, liq, alvo].filter(p => !isNaN(p) && p > 0);
    let minPrice = Math.min(...allPrices);
    let maxPrice = Math.max(...allPrices);

    if (minPrice === maxPrice) {
      minPrice *= 0.95;
      maxPrice *= 1.05;
    }

    const priceRange = maxPrice - minPrice;

    // Relative percentage calculator with clamping between 4% and 96%
    const calcPct = (price) => {
      let pct = ((price - minPrice) / priceRange) * 100;
      return Math.max(4, Math.min(96, pct));
    };

    const stopPct = calcPct(stop);
    const liqPct = calcPct(liq);
    const entradaPct = calcPct(entrada);
    const alvoPct = calcPct(alvo);

    // Update positions of top pin icons and vertical indicator lines
    el.pinStop.style.left = `${stopPct}%`;
    el.pinLiq.style.left = `${liqPct}%`;
    el.pinEntrada.style.left = `${entradaPct}%`;
    el.pinAlvo.style.left = `${alvoPct}%`;

    el.vlineStop.style.left = `${stopPct}%`;
    el.vlineLiq.style.left = `${liqPct}%`;
    el.vlineEntrada.style.left = `${entradaPct}%`;
    el.vlineAlvo.style.left = `${alvoPct}%`;

    // Update tooltip text values
    const textLiq = `LIQUIDAÇÃO: ${formatCurrency(liq)}`;
    const textStop = `STOP LOSS: ${formatCurrency(stop)}`;
    const textEntrada = `ENTRADA: ${formatCurrency(entrada)}`;
    const textAlvo = `ALVO: ${formatCurrency(alvo)}`;

    el.tooltipLiq.innerHTML = textLiq;
    el.tooltipStop.innerHTML = textStop;
    el.tooltipEntrada.innerHTML = textEntrada;
    el.tooltipAlvo.innerHTML = textAlvo;

    el.legtipLiq.innerHTML = textLiq;
    el.legtipStop.innerHTML = textStop;
    el.legtipEntrada.innerHTML = textEntrada;
    el.legtipAlvo.innerHTML = textAlvo;

    // Render 30 segmented vertical pill bars with color transitions
    el.ladderSegmentedTrack.innerHTML = '';
    const totalSegments = 30;

    for (let i = 0; i < totalSegments; i++) {
      const segPct = (i / totalSegments) * 100;
      const div = document.createElement('div');
      div.className = 'seg-pill';

      if (isLong) {
        if (segPct <= Math.max(liqPct, stopPct)) {
          div.classList.add('red');
        } else if (segPct <= entradaPct) {
          div.classList.add('orange');
        } else if (segPct <= alvoPct) {
          div.classList.add('yellow');
        } else {
          div.classList.add('green');
        }
      } else {
        if (segPct <= alvoPct) {
          div.classList.add('green');
        } else if (segPct <= entradaPct) {
          div.classList.add('yellow');
        } else if (segPct <= Math.min(liqPct, stopPct)) {
          div.classList.add('orange');
        } else {
          div.classList.add('red');
        }
      }

      el.ladderSegmentedTrack.appendChild(div);
    }
  }


  // =======================================================
  // TAB 2 LOGIC: DESCOBRIR ALAVANCAGEM
  // =======================================================
  function calculateTab2Descobrir() {
    const { entrada, margem, stop, lossVal, lossMode, includeFees, calcMode, manualLeverage, alavancagem } = state.disc;
    const { takerFee, mmr } = state.params;
    const isLong = state.direction === 'long';

    if (entrada <= 0 || margem <= 0 || stop <= 0) return;

    let posSizeUsd = 0;
    let btcQty = 0;
    let feesUsd = 0;
    let totalEstLossUsd = 0;
    let totalEstLossPct = 0;
    let liqPrice = 0;

    // 1. Distance to Stop (%)
    let stopDistPct = 0;
    if (isLong) {
      stopDistPct = Math.max(0.01, ((entrada - stop) / entrada) * 100);
    } else {
      stopDistPct = Math.max(0.01, ((stop - entrada) / entrada) * 100);
    }

    const feeImpactFactor = includeFees ? ((takerFee / 100) * 2) : 0;
    const totalImpactPct = (stopDistPct / 100) + feeImpactFactor;

    if (calcMode === 'margem') {
      // MODE = MARGEM FIXA
      let maxAllowedLossUsd = lossMode === 'percent' ? margem * (lossVal / 100) : lossVal;
      let rawLev = (maxAllowedLossUsd / margem) / totalImpactPct;

      if (!manualLeverage) {
        let recLeverage = Math.floor(rawLev);
        if (recLeverage < 1) recLeverage = 1;
        if (recLeverage > 125) recLeverage = 125;
        state.disc.alavancagem = recLeverage;
        updateDiscLeverageSliderUI();
      }

      posSizeUsd = margem * state.disc.alavancagem;
      btcQty = posSizeUsd / entrada;
      feesUsd = includeFees ? (posSizeUsd * (takerFee / 100) * 2) : 0;
      
      let rawPriceLoss = isLong ? (entrada - stop) * btcQty : (stop - entrada) * btcQty;
      totalEstLossUsd = rawPriceLoss + feesUsd;
      totalEstLossPct = (totalEstLossUsd / margem) * 100;

      // Update Hero Box
      el.discHeroTitle.textContent = 'ALAVANCAGEM RECOMENDADA';
      el.discHeroVal.innerHTML = `${state.disc.alavancagem}<span class="x-sub">x</span>`;
      el.discRiskMeta.textContent = `${lossMode === 'percent' ? lossVal + '%' : formatCurrency(lossVal)} da margem fixa`;
      
      if (!manualLeverage) {
        el.discRoundingText.textContent = state.disc.alavancagem < rawLev ? 'Arredondado a seu favor (Protegido)' : 'Alavancagem exata calculada';
        el.discRoundingIcon.className = 'ph ph-check-circle bullet-icon green';
      } else {
        el.discRoundingText.textContent = 'Alavancagem ajustada manualmente';
        el.discRoundingIcon.className = 'ph ph-pencil-simple bullet-icon orange';
      }

    } else {
      // MODE = CAPITAL TOTAL
      let targetLossUsd = lossMode === 'percent' ? margem * (lossVal / 100) : lossVal;
      
      posSizeUsd = targetLossUsd / totalImpactPct;
      btcQty = posSizeUsd / entrada;
      
      let requiredMargin = posSizeUsd / alavancagem;
      
      feesUsd = includeFees ? (posSizeUsd * (takerFee / 100) * 2) : 0;
      let rawPriceLoss = isLong ? (entrada - stop) * btcQty : (stop - entrada) * btcQty;
      totalEstLossUsd = rawPriceLoss + feesUsd;
      totalEstLossPct = (totalEstLossUsd / margem) * 100; 

      // Update Hero Box
      el.discHeroTitle.textContent = 'MARGEM EXIGIDA';
      el.discHeroVal.innerHTML = `${formatCurrency(requiredMargin)}`;
      el.discHeroVal.style.fontSize = '50px';
      el.discRiskMeta.textContent = `${lossMode === 'percent' ? lossVal + '%' : formatCurrency(lossVal)} do capital total`;
      
      el.discRoundingText.textContent = 'Ajuste a alavancagem no slider para otimizar margem';
      el.discRoundingIcon.className = 'ph ph-info bullet-icon orange';
    }

    // Liquidation Price
    if (isLong) {
      liqPrice = entrada * (1 - (1 / state.disc.alavancagem) + (mmr / 100));
    } else {
      liqPrice = entrada * (1 + (1 / state.disc.alavancagem) - (mmr / 100));
    }
    if (liqPrice < 0) liqPrice = 0;

    let liqDistPct = 0;
    if (isLong) {
      liqDistPct = Math.max(0, ((entrada - liqPrice) / entrada) * 100);
    } else {
      liqDistPct = Math.max(0, ((liqPrice - entrada) / entrada) * 100);
    }

    const stopLiqGapPct = Math.max(0, liqDistPct - stopDistPct);

    // Update Common Hero Elements
    el.discEstLoss.textContent = `${formatCurrency(totalEstLossUsd)} (${totalEstLossPct.toFixed(2)}%)`;
    el.discEstLossBrl.textContent = `≈ ${formatBrl(totalEstLossUsd)}`;
    
    // 6 Metrics Grid Cards
    el.discStopDist.textContent = `${stopDistPct.toFixed(2)}%`;
    el.discStopDistBar.style.width = `${Math.min(100, stopDistPct * 5)}%`;

    el.discPosSize.textContent = formatCurrency(posSizeUsd);

    el.discStopLossVal.textContent = `-${formatCurrency(totalEstLossUsd)}`;
    el.discStopLossPct.textContent = `${totalEstLossPct.toFixed(2)}%`;
    el.discStopLossBar.style.width = `${Math.min(100, totalEstLossPct)}%`;

    el.discLiqPrice.textContent = formatCurrency(liqPrice);

    el.discLiqDist.textContent = `${liqDistPct.toFixed(2)}%`;
    el.discLiqDistBar.style.width = `${Math.min(100, liqDistPct * 5)}%`;

    el.discStopLiqGap.textContent = `${stopLiqGapPct.toFixed(2)}%`;
    el.discGapBar.style.width = `${Math.min(100, stopLiqGapPct * 10)}%`;
  }


  // --- FORMATTING HELPERS ---
  function formatCurrency(val) {
    if (isNaN(val)) return '$ 0,00';
    if (state.currency === 'BRL') {
      const brlVal = val * state.usdToBrlRate;
      return `R$ ${formatNumber(brlVal)}`;
    }
    return `$ ${formatNumber(val)}`;
  }

  function formatBrl(val) {
    if (isNaN(val)) return 'R$ 0,00';
    const brlVal = val * state.usdToBrlRate;
    return `R$ ${formatNumber(brlVal)}`;
  }

  function formatNumber(num) {
    if (num < 0.001 && num > 0) {
      return num.toFixed(6);
    }
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  }

  function updateHeaderTicker() {
    const assetPrice = state.asset.price;
    if (state.currency === 'BRL') {
      const brlPrice = assetPrice * state.usdToBrlRate;
      el.headerTickerText.textContent = `1 ${state.asset.symbol} = R$ ${formatNumber(brlPrice)}`;
    } else {
      el.headerTickerText.textContent = `1 ${state.asset.symbol} = US$ ${formatNumber(assetPrice)}`;
    }
  }

  // --- COUNTDOWN TIMER FOR NEXT FUNDING ---
  function startFundingTimer() {
    let secondsLeft = 5 * 3600 + 44 * 60 + 30;
    
    setInterval(() => {
      if (secondsLeft <= 0) secondsLeft = 8 * 3600;
      secondsLeft--;

      const hrs = Math.floor(secondsLeft / 3600).toString().padStart(2, '0');
      const mins = Math.floor((secondsLeft % 3600) / 60).toString().padStart(2, '0');
      const secs = (secondsLeft % 60).toString().padStart(2, '0');

      el.fundingCountdown.textContent = `${hrs}h ${mins}m ${secs}s`;
    }, 1000);
  }

  // --- TOAST NOTIFICATION HELPER ---
  function showToast(msg) {
    el.toastMsg.textContent = msg;
    el.toast.classList.add('show');
    setTimeout(() => {
      el.toast.classList.remove('show');
    }, 3000);
  }

});
