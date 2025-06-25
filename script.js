document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('searchBtn');
    const cityInput = document.getElementById('cityInput');
    const loading = document.getElementById('loading');
    const weatherInfo = document.getElementById('weatherInfo');
    const errorDiv = document.getElementById('error');
    
    // Elementos da previsão atual
    const cityName = document.getElementById('cityName');
    const weatherIcon = document.getElementById('weatherIcon');
    const currentTemp = document.getElementById('currentTemp');
    const weatherDescription = document.getElementById('weatherDescription');
    const minTemp = document.getElementById('minTemp');
    const maxTemp = document.getElementById('maxTemp');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('windSpeed');
    const forecastContainer = document.getElementById('forecastContainer');
    
    // Configuração da API HG Brasil
    const API_KEY = 'SUA_CHAVE_AQUI'; // Obtenha em https://hgbrasil.com/
    const API_URL = `https://api.hgbrasil.com/weather?key=${API_KEY}&user_ip=remote`;
    
    searchBtn.addEventListener('click', fetchWeather);
    cityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            fetchWeather();
        }
    });
    
    async function fetchWeather() {
        const city = cityInput.value.trim();
        
        if (!city) {
            showError('Por favor, digite o nome de uma cidade');
            return;
        }
        
        // Reset UI
        weatherInfo.classList.add('hidden');
        errorDiv.classList.add('hidden');
        loading.classList.remove('hidden');
        
        try {
            const response = await fetch(`${API_URL}&city_name=${encodeURIComponent(city)}`);
            
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.results) {
                displayWeather(data.results);
            } else {
                throw new Error('Cidade não encontrada');
            }
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            showError(`Erro ao carregar dados: ${error.message}`);
        } finally {
            loading.classList.add('hidden');
        }
    }
    
    function displayWeather(data) {
        // Previsão atual
        cityName.textContent = `${data.city}, ${data.region}`;
        currentTemp.textContent = `${data.temp}°C`;
        weatherDescription.textContent = data.description;
        minTemp.textContent = `${data.forecast[0].min}°C`;
        maxTemp.textContent = `${data.forecast[0].max}°C`;
        humidity.textContent = `${data.humidity}%`;
        windSpeed.textContent = `${data.wind_speedy}`;
        
        // Ícone do tempo
        weatherIcon.innerHTML = getWeatherIcon(data.condition_code);
        
        // Previsão para os próximos dias
        forecastContainer.innerHTML = '';
        for (let i = 1; i < 6; i++) { // Próximos 5 dias
            const day = data.forecast[i];
            const forecastDay = document.createElement('div');
            forecastDay.className = 'forecast-day';
            
            forecastDay.innerHTML = `
                <div>${day.weekday}</div>
                <div>${getWeatherIcon(day.condition)}</div>
                <div>${day.max}°C / ${day.min}°C</div>
                <div>${day.description}</div>
            `;
            
            forecastContainer.appendChild(forecastDay);
        }
        
        weatherInfo.classList.remove('hidden');
    }
    
    function getWeatherIcon(conditionCode) {
        // Mapeamento de códigos de condição para ícones Font Awesome
        const icons = {
            'storm': 'fa-bolt',
            'snow': 'fa-snowflake',
            'hail': 'fa-cloud-meatball',
            'rain': 'fa-cloud-rain',
            'fog': 'fa-smog',
            'clear_day': 'fa-sun',
            'clear_night': 'fa-moon',
            'cloud': 'fa-cloud',
            'cloudly_day': 'fa-cloud-sun',
            'cloudly_night': 'fa-cloud-moon',
            'none_day': 'fa-sun',
            'none_night': 'fa-moon'
        };
        
        const iconClass = icons[conditionCode] || 'fa-cloud';
        return `<i class="fas ${iconClass}"></i>`;
    }
    
    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
    
    // Carregar dados da localização do usuário por padrão
    fetchWeather();
});