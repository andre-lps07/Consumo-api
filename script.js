// Lista completa de 20 criptomoedas com seus pares na Binance
const cryptos = [
    { symbol: 'BTC', name: 'Bitcoin', pair: 'BTCBRL', rank: 1 },
    { symbol: 'ETH', name: 'Ethereum', pair: 'ETHBRL', rank: 2 },
    { symbol: 'BNB', name: 'Binance Coin', pair: 'BNBBRL', rank: 3 },
    { symbol: 'XRP', name: 'Ripple', pair: 'XRPBRL', rank: 4 },
    { symbol: 'SOL', name: 'Solana', pair: 'SOLBRL', rank: 5 },
    { symbol: 'ADA', name: 'Cardano', pair: 'ADABRL', rank: 6 },
    { symbol: 'DOGE', name: 'Dogecoin', pair: 'DOGEBRL', rank: 7 },
    { symbol: 'DOT', name: 'Polkadot', pair: 'DOTBRL', rank: 8 },
    { symbol: 'MATIC', name: 'Polygon', pair: 'MATICBRL', rank: 9 },
    { symbol: 'LTC', name: 'Litecoin', pair: 'LTCBRL', rank: 10 },
    { symbol: 'LINK', name: 'Chainlink', pair: 'LINKBRL', rank: 11 },
    { symbol: 'XLM', name: 'Stellar', pair: 'XLMBRL', rank: 12 },
    { symbol: 'UNI', name: 'Uniswap', pair: 'UNIBRL', rank: 13 },
    { symbol: 'AVAX', name: 'Avalanche', pair: 'AVAXBRL', rank: 14 },
    { symbol: 'ETC', name: 'Ethereum Classic', pair: 'ETCBRL', rank: 15 },
    { symbol: 'VET', name: 'VeChain', pair: 'VETBRL', rank: 16 },
    { symbol: 'FIL', name: 'Filecoin', pair: 'FILBRL', rank: 17 },
    { symbol: 'ATOM', name: 'Cosmos', pair: 'ATOMBRL', rank: 18 },
    { symbol: 'ALGO', name: 'Algorand', pair: 'ALGOBRL', rank: 19 },
    { symbol: 'BCH', name: 'Bitcoin Cash', pair: 'BCHBRL', rank: 20 }
];

// Cache de dados para evitar múltiplas requisições
let cryptoDataCache = {};

// Funções de formatação
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: value < 1 ? 6 : 2
    }).format(value);
};

const formatVolume = (value) => {
    if (value >= 1000000000) {
        return (value / 1000000000).toFixed(2) + ' Bi';
    }
    if (value >= 1000000) {
        return (value / 1000000).toFixed(2) + ' Mi';
    }
    if (value >= 1000) {
        return (value / 1000).toFixed(2) + ' Mil';
    }
    return value.toFixed(2);
};

const formatPercentage = (value) => {
    return value.toFixed(2) + '%';
};

// Buscar dados da API
async function fetchCryptoData(crypto) {
    try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${crypto.pair}`);
        const data = await response.json();
        
        // Adicionar informações adicionais
        data.symbol = crypto.symbol;
        data.name = crypto.name;
        data.rank = crypto.rank;
        
        return data;
    } catch (error) {
        console.error(`Erro ao buscar dados para ${crypto.symbol}:`, error);
        return null;
    }
}

// Atualizar tabela com os dados
function updateTable(data) {
    const tableBody = document.getElementById('crypto-table-body');
    tableBody.innerHTML = '';

    if (!data || data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">Nenhum dado disponível</td>
            </tr>
        `;
        return;
    }

    data.forEach((crypto, index) => {
        if (!crypto) return;

        const lastPrice = parseFloat(crypto.lastPrice);
        const priceChangePercent = parseFloat(crypto.priceChangePercent);
        const volume = parseFloat(crypto.volume);
        const highPrice = parseFloat(crypto.highPrice);
        const lowPrice = parseFloat(crypto.lowPrice);

        const row = document.createElement('tr');
        row.className = 'crypto-row';
        row.dataset.symbol = crypto.symbol;
        row.dataset.rank = crypto.rank;
        row.dataset.change = priceChangePercent;
        
        row.innerHTML = `
            <th scope="row">${crypto.rank}</th>
            <td>
                <img src="https://cryptoicon-api.vercel.app/api/icon/${crypto.symbol.toLowerCase()}" 
                     alt="${crypto.name}" 
                     class="crypto-logo"
                     onerror="this.src='https://cryptoicon-api.vercel.app/api/icon/btc'">
                <strong>${crypto.name}</strong> <span class="text-muted">${crypto.symbol}</span>
            </td>
            <td class="text-end">${formatCurrency(lastPrice)}</td>
            <td class="text-end ${priceChangePercent >= 0 ? 'positive-change' : 'negative-change'}">
                ${priceChangePercent >= 0 ? '+' : ''}${formatPercentage(priceChangePercent)}
            </td>
            <td class="text-end">${formatVolume(volume)}</td>
            <td class="text-end">${formatCurrency(highPrice)}</td>
            <td class="text-end">${formatCurrency(lowPrice)}</td>
        `;

        tableBody.appendChild(row);
    });
}

// Filtrar criptomoedas
function filterCryptos() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
    
    let filteredData = Object.values(cryptoDataCache).filter(crypto => {
        if (!crypto) return false;
        
        // Aplicar filtro de busca
        const matchesSearch = crypto.name.toLowerCase().includes(searchTerm) || 
                             crypto.symbol.toLowerCase().includes(searchTerm);
        
        if (!matchesSearch) return false;
        
        // Aplicar filtros adicionais
        switch (activeFilter) {
            case 'top':
                return crypto.rank <= 10;
            case 'gainers':
                return parseFloat(crypto.priceChangePercent) > 0;
            case 'losers':
                return parseFloat(crypto.priceChangePercent) < 0;
            default:
                return true;
        }
    });
    
    // Ordenar por rank
    filteredData.sort((a, b) => a.rank - b.rank);
    
    updateTable(filteredData);
}

// Atualizar todos os dados
async function updateAllData() {
    try {
        // Mostrar estado de carregamento
        const tableBody = document.getElementById('crypto-table-body');
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                    <p class="mt-2 pulse">Atualizando dados...</p>
                </td>
            </tr>
        `;
        
        // Buscar dados para todas as criptomoedas em paralelo
        const fetchPromises = cryptos.map(crypto => fetchCryptoData(crypto));
        const results = await Promise.all(fetchPromises);
        
        // Atualizar cache
        results.forEach(data => {
            if (data) {
                cryptoDataCache[data.symbol] = data;
            }
        });
        
        // Aplicar filtros e atualizar tabela
        filterCryptos();
        
        // Atualizar horário
        const now = new Date();
        document.getElementById('last-update').textContent = now.toLocaleTimeString('pt-BR');
        
    } catch (error) {
        console.error('Erro ao atualizar dados:', error);
        alert('Erro ao atualizar dados. Tente novamente mais tarde.');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    updateAllData();
    // Atualizar a cada 1 minuto
    setInterval(updateAllData, 60000);
});

document.getElementById('refresh-btn').addEventListener('click', updateAllData);

document.getElementById('search-input').addEventListener('input', filterCryptos);

document.getElementById('clear-search').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    filterCryptos();
});

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        filterCryptos();
    });
});