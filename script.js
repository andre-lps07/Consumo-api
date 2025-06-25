document.addEventListener('DOMContentLoaded', function () {
    const refreshBtn = document.getElementById('refreshBtn');
    const currencySelect = document.getElementById('currencySelect');
    const cryptoList = document.getElementById('cryptoList');
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const updateTime = document.getElementById('updateTime');

    // Moedas para exibir
    const cryptos = [
        'bitcoin', 'ethereum', 'binancecoin', 'solana', 'cardano',
        'ripple', 'dogecoin', 'polkadot', 'litecoin', 'chainlink',
        'stellar', 'uniswap', 'avalanche-2', 'polygon-pos',
        'tron', 'monero', 'bitcoin-cash'
    ];
    // Símbolos das moedas
    const cryptoSymbols = {
        bitcoin: 'BTC',
        ethereum: 'ETH',
        binancecoin: 'BNB',
        solana: 'SOL',
        cardano: 'ADA',
        ripple: 'XRP',
        dogecoin: 'DOGE'
    };

    // Nomes completos
    const cryptoNames = {
        bitcoin: 'Bitcoin',
        ethereum: 'Ethereum',
        binancecoin: 'Binance Coin',
        solana: 'Solana',
        cardano: 'Cardano',
        ripple: 'XRP',
        dogecoin: 'Dogecoin'
    };

    // Carregar dados ao iniciar
    fetchCryptoData();

    // Event listeners
    refreshBtn.addEventListener('click', fetchCryptoData);
    currencySelect.addEventListener('change', fetchCryptoData);

    async function fetchCryptoData() {
        const currency = currencySelect.value;

        // Reset UI
        cryptoList.innerHTML = '';
        errorDiv.classList.add('hidden');
        loading.classList.remove('hidden');

        try {
            // API pública sem necessidade de token
            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&ids=${cryptos.join(',')}&order=market_cap_desc&sparkline=false`
            );

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }

            const data = await response.json();
            displayCryptoData(data, currency);

            // Atualizar horário
            updateTime.textContent = new Date().toLocaleString();

        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            errorDiv.textContent = `Erro ao carregar cotações: ${error.message}`;
            errorDiv.classList.remove('hidden');
        } finally {
            loading.classList.add('hidden');
        }
    }

    function displayCryptoData(data, currency) {
        if (!data || data.length === 0) {
            cryptoList.innerHTML = '<p>Nenhum dado disponível</p>';
            return;
        }

        // Ordenar por market_cap
        data.sort((a, b) => b.market_cap - a.market_cap);

        // Símbolo da moeda
        const currencySymbol = {
            usd: '$',
            brl: 'R$',
            eur: '€'
        }[currency] || '$';

        data.forEach(crypto => {
            const cryptoItem = document.createElement('div');
            cryptoItem.className = 'crypto-item';

            const priceChange = crypto.price_change_percentage_24h;
            const changeClass = priceChange >= 0 ? 'positive' : 'negative';
            const changeIcon = priceChange >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';

            cryptoItem.innerHTML = `
                <div class="crypto-info">
                    <img src="${crypto.image}" alt="${crypto.name}" class="crypto-icon">
                    <div>
                        <div class="crypto-name">${cryptoNames[crypto.id] || crypto.name}</div>
                        <div class="crypto-symbol">${cryptoSymbols[crypto.id] || ''}</div>
                    </div>
                </div>
                <div class="crypto-price">
                    ${currencySymbol} ${crypto.current_price.toLocaleString()}
                    <div class="price-change ${changeClass}">
                        <i class="fas ${changeIcon}"></i> ${Math.abs(priceChange).toFixed(2)}%
                    </div>
                </div>
            `;

            cryptoList.appendChild(cryptoItem);
        });
    }
});