let apiKey = "8cd4b9c2e4cfb6a06665c735d7e97a72";
let noOfDays = 15;

// Selecting the DOM 
let searchCity = document.getElementById("searchCity");
let body = document.getElementById("globalBody");
let weatherBackground = document.getElementById("globalContent");





// Some functions to use as a built-in function
let getTime = (timeStamp) => {
  const timestamp = timeStamp * 1000; // Convert to milliseconds

  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
};
let getMonth = (month) => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return months[month];
};
let generateDate = (date) => {
  let dateArray = date.split('-').map(Number);
  let month = getMonth(dateArray[1]);
  return `${month} ${dateArray[2]}, ${dateArray[0]}`;
};
let getTodayDate = (noOfDays = 0) => {
  const today = new Date();

  // Add the specified number of days to the current date
  const futureDate = new Date(today.setDate(today.getDate() + noOfDays));

  // Get the year
  const year = futureDate.getFullYear();

  // Get the month
  const month = futureDate.getMonth() + 1; // Months are zero-indexed, so add 1

  // Get the day of the month
  const day = futureDate.getDate();

  // Display the date
  return generateDate(`${year}-${month}-${day}`);
};
let capitalize = (text) => {
  text = text.trim();
  textArr = text.split(" ");
  
  for(let i=0; i<textArr.length; i++) {
      textArr[i] = textArr[i][0].toUpperCase() + textArr[i].slice(1);
  }
  return textArr.join(" ");
}




// Fetch weather info from Weather API
let getWeather = async (city="Delhi") => {
  let url = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log(data)

  let currentDate = new Date().toISOString().split("T")[0];
  let cityWeather = {
    name: data.city.name,
    location: [data.city.coord.lat, data.city.coord.lon],
    population: data.city.population,
    sunRise: getTime(data.city.sunrise),
    sunSet: getTime(data.city.sunset),
    timeZone: data.city.timezone,
    feelsLike: data.list[0].main.feels_like,
    humidity: `${data.list[0].main.humidity}%`,
    seaLevel: `${data.list[0].main.sea_level}m`,
    wind: `${data.list[0].wind.speed}kph`,
    visiblity: `${Number.parseInt((data.list[0].visibility)/1000)}km`,
    forecast: {}
  };

  // Process forecast for each day
  for (let i = 0; i < data.list.length; i++) {
    const forecastItem = data.list[i];
    const date = forecastItem.dt_txt.split(" ")[0];
    const time = forecastItem.dt_txt.split(" ")[1];

    if (date === currentDate) {
      if (!cityWeather.forecast[generateDate(date)]) {
        cityWeather.forecast[generateDate(date)] = [];
      }

      cityWeather.forecast[generateDate(date)].push({
        date: generateDate(date),
        time: time,
        weather: capitalize(forecastItem.weather[0].description),
        iconLogo: forecastItem.weather[0].icon,
        temperature: `${Number.parseInt(forecastItem.main.temp)}°`,
        tempRange: `H:${(forecastItem.main.temp_max)}° L:${(forecastItem.main.temp_min)}°`
      });
    } else if (Object.keys(cityWeather.forecast).length < noOfDays) {
      if (!cityWeather.forecast[generateDate(date)]) {
        cityWeather.forecast[generateDate(date)] = [{
          date: generateDate(date),
          time: time,
          iconLogo: forecastItem.weather[0].icon,
          weather: capitalize(forecastItem.weather[0].description),
          temperature: `${Number.parseInt(forecastItem.main.temp)}°`,
          tempRange: `H:${(forecastItem.main.temp_max)}° L:${(forecastItem.main.temp_min)}°`
        }];
      }
    }
  }

  console.log(cityWeather);
  return cityWeather;
};

// Dynamically changes the website template, such as - background, color etc, according to the weather
let changeBackground = (weather) => {
  if(weather.includes("cloud")) {
    body.classList.add('cloudyColor', 'cloudyTextColor');
    weatherBackground.classList.add('cloudy');
  }
  else if(weather.includes("rain")) {
    body.classList.add('raining', 'rainingTextColor');
  }
  else if(weather.includes("strom") || weather.includes("thunder")) {
    body.classList.add('thunder', 'rainingTextColor');
  }
  else {
    body.classList.add('cloudyColor', 'cloudyTextColor');
    weatherBackground.classList.add('lightCloud');
  }
};

// generate the main content of Today's weather
let changeCurrentDay = (cityName, temperature, weather, temperatureRange) => {
  // Get a reference to the parent container
  const currentTemperatureContainer = document.querySelector('.currentTemperature');
  currentTemperatureContainer.innerHTML = '';

  // Create the elements dynamically
  const city = document.createElement('div');
  city.id = 'city';
  city.innerHTML = cityName;

  const currentTemp = document.createElement('div');
  currentTemp.id = 'currentTemp';
  currentTemp.innerHTML = temperature;

  const currentWeather = document.createElement('div');
  currentWeather.id = 'currentWeather';
  currentWeather.innerHTML = weather;

  const currentTempRange = document.createElement('div');
  currentTempRange.id = 'currentTempRange';
  currentTempRange.innerHTML = temperatureRange;

  currentTemperatureContainer.appendChild(city);
  currentTemperatureContainer.appendChild(currentTemp);
  currentTemperatureContainer.appendChild(currentWeather);
  currentTemperatureContainer.appendChild(currentTempRange);

}

// generate template about the other infos of Today's weather i.e., wind speed, humidity etc
let currentWeatherTemplate = (cfeelsLike, chumidity, cvisibility, cseaLevel, cwind) => {
  // Get a reference to the parent container
  const extraContentContainer = document.querySelector('.extraContent.centers');
  extraContentContainer.innerHTML = '';

  // Create the first container
  const container1 = document.createElement('div');
  container1.classList.add('container', 'glass');

  const center1 = document.createElement('div');
  center1.classList.add('center');

  const icon1 = document.createElement('img');
  icon1.src = 'Images/feelingLikeIcon.svg';
  icon1.alt = 'Icon';
  icon1.classList.add('images');

  const label1 = document.createTextNode('FEELS LIKE');
  center1.appendChild(icon1);
  center1.appendChild(label1);

  const feelsLike = document.createElement('div');
  feelsLike.id = 'feelsLike';
  feelsLike.innerHTML = cfeelsLike;
  
  container1.appendChild(center1);
  container1.appendChild(feelsLike);
  
  extraContentContainer.appendChild(container1);
  
  // Create the second container
  const container2 = document.createElement('div');
  container2.classList.add('container', 'glass');
  
  const center2 = document.createElement('div');
  center2.classList.add('center');
  
  const icon2 = document.createElement('img');
  icon2.src = 'Images/humidityIcon.svg';
  icon2.alt = 'Icon';
  icon2.classList.add('images');
  
  const label2 = document.createTextNode('HUMIDITY');
  center2.appendChild(icon2);
  center2.appendChild(label2);
  
  const humidity = document.createElement('div');
  humidity.id = 'humidity';
  humidity.innerHTML = chumidity;
  
  container2.appendChild(center2);
  container2.appendChild(humidity);
  
  extraContentContainer.appendChild(container2);
  
  // Create the third container
  const container3 = document.createElement('div');
  container3.classList.add('container', 'glass');

  const center3 = document.createElement('div');
  center3.classList.add('center');
  
  const icon3 = document.createElement('img');
  icon3.src = 'Images/visiblityIcon.svg';
  icon3.alt = 'Icon';
  icon3.classList.add('images');
  
  const label3 = document.createTextNode('VISIBILITY');
  center3.appendChild(icon3);
  center3.appendChild(label3);
  
  const visibility = document.createElement('div');
  visibility.id = 'visiblity';
  visibility.innerHTML = cvisibility;
  
  container3.appendChild(center3);
  container3.appendChild(visibility);
  
  extraContentContainer.appendChild(container3);
  
  // Create the fourth container
  const container4 = document.createElement('div');
  container4.classList.add('container', 'glass');
  
  const center4 = document.createElement('div');
  center4.classList.add('center');
  
  const icon4 = document.createElement('img');
  icon4.src = 'Images/feelingLikeIcon.svg';
  icon4.alt = 'Icon';
  icon4.classList.add('images');
  
  const label4 = document.createTextNode('SEA LEVEL');
  center4.appendChild(icon4);
  center4.appendChild(label4);
  
  const rainfall = document.createElement('div');
  rainfall.id = 'rainfall';
  rainfall.innerHTML = cseaLevel;
  
  container4.appendChild(center4);
  container4.appendChild(rainfall);
  
  extraContentContainer.appendChild(container4);
  
  // Create the fifth container
  const container5 = document.createElement('div');
  container5.classList.add('container', 'glass');
  
  const center5 = document.createElement('div');
  center5.classList.add('center');
  
  const icon5 = document.createElement('img');
  icon5.src = 'Images/windIcon.svg';
  icon5.alt = 'Icon';
  icon5.classList.add('images');
  
  const label5 = document.createTextNode('WIND');
  center5.appendChild(icon5);
  center5.appendChild(label5);
  
  const wind = document.createElement('div');
  wind.id = 'wind';
  wind.innerHTML = cwind;

  container5.appendChild(center5);
  container5.appendChild(wind);

  extraContentContainer.appendChild(container5);

}

// clears out previous forcast & generate the forcast according to the city
let forcastTemplate = (date, icon, temperature, weather, temperatureRange) => {
  let imageUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`

  // Get a reference to the parent container
  const forecastContainer = document.querySelector('.forecastContent.centers');
  forecastContainer.innerHTML = '';

  // Create the elements dynamically
  const forecastSize = document.createElement('div');
  forecastSize.classList.add('forecastSize', 'glass');

  const forecastDate = document.createElement('div');
  forecastDate.id = 'forecastDate';
  forecastDate.innerHTML = date;

  const forecastLogo = document.createElement('img');
  forecastLogo.src = imageUrl;
  forecastLogo.id = 'forecastLogo';
  forecastLogo.alt = '';

  const forecastInfoContainer = document.createElement('div');

  const forecastTemperature = document.createElement('div');
  forecastTemperature.id = 'forecastTemperature';
  forecastTemperature.innerHTML = temperature;
  
  const forecastWeather = document.createElement('div');
  forecastWeather.id = 'forecastWeather';
  forecastWeather.innerHTML = weather;
  
  const forecastTemperatureRange = document.createElement('div');
  forecastTemperatureRange.id = 'forecastTemperatureRange';
  forecastTemperatureRange.innerHTML = temperatureRange;

  // Append the elements to the parent container
  forecastContainer.appendChild(forecastSize);
  forecastSize.appendChild(forecastDate);
  forecastSize.appendChild(forecastLogo);
  forecastSize.appendChild(forecastInfoContainer);
  forecastInfoContainer.appendChild(forecastTemperature);
  forecastInfoContainer.appendChild(forecastWeather);
  forecastInfoContainer.appendChild(forecastTemperatureRange);
}

// This is the duplicate of above function, as it doesn't erase the innerHTML which helps to create the further forcast template 
let forcastTemplate1 = (date, icon, temperature, weather, temperatureRange) => {
  let imageUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`

  // Get a reference to the parent container
  const forecastContainer = document.querySelector('.forecastContent.centers');

  // Create the elements dynamically
  const forecastSize = document.createElement('div');
  forecastSize.classList.add('forecastSize', 'glass');

  const forecastDate = document.createElement('div');
  forecastDate.id = 'forecastDate';
  forecastDate.innerHTML = date;

  const forecastLogo = document.createElement('img');
  forecastLogo.src = imageUrl;
  forecastLogo.id = 'forecastLogo';
  forecastLogo.alt = '';

  const forecastInfoContainer = document.createElement('div');

  const forecastTemperature = document.createElement('div');
  forecastTemperature.id = 'forecastTemperature';
  forecastTemperature.innerHTML = temperature;
  
  const forecastWeather = document.createElement('div');
  forecastWeather.id = 'forecastWeather';
  forecastWeather.innerHTML = weather;
  
  const forecastTemperatureRange = document.createElement('div');
  forecastTemperatureRange.id = 'forecastTemperatureRange';
  forecastTemperatureRange.innerHTML = temperatureRange;

  // Append the elements to the parent container
  forecastContainer.appendChild(forecastSize);
  forecastSize.appendChild(forecastDate);
  forecastSize.appendChild(forecastLogo);
  forecastSize.appendChild(forecastInfoContainer);
  forecastInfoContainer.appendChild(forecastTemperature);
  forecastInfoContainer.appendChild(forecastWeather);
  forecastInfoContainer.appendChild(forecastTemperatureRange);
}

// generate forecast template day-by-day 
let changeForecastDay = (first, second, third, fourth) => {
  forcastTemplate(first.date.split(",")[0], first.iconLogo, first.temperature, first.weather, first.tempRange);
  forcastTemplate1(second.date.split(",")[0], second.iconLogo, second.temperature, second.weather, second.tempRange);
  forcastTemplate1(third.date.split(",")[0], third.iconLogo, third.temperature, third.weather, third.tempRange);
  forcastTemplate1(fourth.date.split(",")[0], fourth.iconLogo, fourth.temperature, fourth.weather, fourth.tempRange);
}

// onClick function, generate Current Weather along with it's forcast [Basically it calls all the required functions]
let searchClicked = async () => {
  let data = await getWeather(searchCity.value);
  console.log(data);

  changeCurrentDay(data.name, data.forecast[getTodayDate()][0].temperature, data.forecast[getTodayDate()][0].weather, data.forecast[getTodayDate()][0].tempRange);

  changeForecastDay(data.forecast[getTodayDate(1)][0], data.forecast[getTodayDate(2)][0], data.forecast[getTodayDate(3)][0], data.forecast[getTodayDate(4)][0]);

  currentWeatherTemplate(data.feelsLike, data.humidity, data.visiblity, data.seaLevel, data.wind);
  changeBackground(data.forecast[getTodayDate()][0].weather)
}

// It runs by default for city=Delhi
let byDefault = async () => {
  let data = await getWeather();
  console.log(data);

  changeCurrentDay(data.name, data.forecast[getTodayDate()][0].temperature, data.forecast[getTodayDate()][0].weather, data.forecast[getTodayDate()][0].tempRange);

  changeForecastDay(data.forecast[getTodayDate(1)][0], data.forecast[getTodayDate(2)][0], data.forecast[getTodayDate(3)][0], data.forecast[getTodayDate(4)][0]);

  currentWeatherTemplate(data.feelsLike, data.humidity, data.visiblity, data.seaLevel, data.wind);
  changeBackground(data.forecast[getTodayDate()][0].weather.toLowerCase());
}

byDefault();