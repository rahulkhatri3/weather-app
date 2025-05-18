const API_KEY="bdca2295fe3404079e7be89972321194";

const DAYS_OF_THE_WEEK = ["sun","mon","tue","wed","thu","fri","sat"];
let selectedCityText;
let selectedCity;

const getCitiesusingGeolocation = async (searchText)=> {
    const response = await fetch  (`https://api.openweathermap.org/geo/1.0/direct?q=${searchText}&limit=5&appid=${API_KEY}`);
return response.json();
};

const getCurrentWeatherData = async({ lat, lon, name: city })=>{
    const url =
    lat && lon
      ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      : `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
  const response = await fetch(url);
  return response.json();
}

const gethourlyforcast = async({name:city})=>{
const response = await fetch (`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
const data = await response.json();
return data.list.map((forcast)=>{
    const {main:{temp, temp_max,temp_min},dt, dt_txt,weather:[{description,icon}]}=forcast;
    return{temp,temp_max,temp_min,dt,dt_txt,description,icon };
   
});

};

const formatTemprature = (temp)=> `${temp?. toFixed(1)}`;
 const createIconUrl= (icon)=>`https://openweathermap.org/img/wn/${icon}@2x.png`;

const loadCurrentData = ({name,main:{temp, temp_max, temp_min}, weather:[{description}]})=>{

    const currentForCastElement = document.querySelector("#current-forcast");
    currentForCastElement.querySelector(".city").textContent=name;
    currentForCastElement.querySelector(".temp").textContent=formatTemprature(temp);
    currentForCastElement.querySelector(".description").textContent=description;
    currentForCastElement.querySelector(".min-max-temp").textContent=`H: ${formatTemprature(temp_max)} L:${formatTemprature(temp_min)}`;


};

const loadHourlyForcast = ({ main:{temp:tempNow},weather:[{icon:iconNow}]},hourlyForcast)=>{
    const timeFormatter = Intl.DateTimeFormat("eng", {
    hour12: true, hour:"numeric"
});

    let dataFor12Hours = hourlyForcast.slice(2, 14);
   const hourlyContainer= document.querySelector(".hourly-container")
        let innerHTMLString = `<article>
        <h3 class="time">Now</h3>
        <img class="icon" src="${createIconUrl(iconNow)}" />
        <p class="hourly-temp">${formatTemprature(tempNow)}</p>
         </article>`;


    for (let {temp,icon, dt_txt} of dataFor12Hours){
        innerHTMLString +=  `<article>
        <h3 class="time">${timeFormatter.format(new Date(dt_txt))}</h3>
        <img class="icon" src="${createIconUrl(icon)}" />
        <p class="hourly-temp">${formatTemprature(temp)}</p>
         </article> ` ;     
}

 hourlyContainer.innerHTML=innerHTMLString;
}

const calculateDayWiseForcast = (hourlyForcast)=>{
    let dayWiseForcast = new Map();
    for (let forcast of hourlyForcast) {
        const [date] = forcast.dt_txt.split(" ");
        const dayOfTheWeek = DAYS_OF_THE_WEEK[new Date(date).getDay()];

        if (dayWiseForcast.has(dayOfTheWeek)){
            let forcastForTheDay = dayWiseForcast.get(dayOfTheWeek);
            forcastForTheDay.push(forcast);
            dayWiseForcast.set(dayOfTheWeek,forcastForTheDay)
        }
        else {
            dayWiseForcast.set(dayOfTheWeek, [forcast]);
        }
    }
    for (let [key, value] of dayWiseForcast){
        let temp_min = Math.min (...Array.from (value, (val)=> val.temp_min));
        let temp_max = Math.max (...Array.from (value, (val)=> val.temp_max));
dayWiseForcast.set(key, {temp_min , temp_max, icon:value.find((v)=>v.icon).icon,

});
}
return dayWiseForcast;

} ;


const loadFiveDayForcast = (hourlyForcast)=>{
const dayWiseForcast =calculateDayWiseForcast(hourlyForcast);
const container = document.querySelector(".five-day-forcast-container")
let dayWiseInfo = "";
Array.from(dayWiseForcast).map(([day, { temp_max,temp_min,icon}],index) =>{
    if (index < 5){
            dayWiseInfo += ` <article class="day-wise-forcast">
            <h3 class="day">${index ===0? "today": day}</h3>
           <img class="icon" src="${createIconUrl(icon)}" alt="icon for the forcast"/>
            <p class="min-temp">${temp_min}</p>
            <p class="max-temp">${temp_max}</p>
            </article> `;

    }


}
);
container.innerHTML=dayWiseInfo;
};

const loadFeelsLike =({main:{feels_like}}) =>{
    let container = document.querySelector("#feels-like");
    container.querySelector(".feels-like-temp").textContent= formatTemprature(feels_like);

};


const loadhumidity =({main:{humidity}}) =>{
    let container = document.querySelector("#humidity");
    container.querySelector(".humidity-value").textContent=`${humidity}%`;

};

const loadForcastUsingGeolocation = () => {
  navigator.geolocation.getCurrentPosition(({ coords }) => {
    const { latitude: lat, longitude: lon } = coords;
    selectedCity = { lat, lon };
    loadData();
  });
};


const loadData = async () => {
  const currentWeather = await getCurrentWeatherData(selectedCity);
  loadCurrentData(currentWeather);
  const hourlyForcast = await gethourlyforcast(currentWeather);
  loadHourlyForcast(currentWeather, hourlyForcast);
  loadFiveDayForcast(hourlyForcast);
  loadFeelsLike(currentWeather);
  loadhumidity(currentWeather);
};

function debounce(func) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, 500);
  };
}


const onSearchChange = async (event) => {
  let { value } = event.target;
  if (!value) {
    selectedCity = null;
    selectedCityText = "";
  }
  if (value && selectedCityText !== value) {
    const listOfCities = await getCitiesusingGeolocation(value);
    let options = "";
    for (let { lat, lon, name, state, country } of listOfCities) {
      options += `<option data-city-details='${JSON.stringify({lat, lon, name,  })}' value="${name}, ${state}, ${country}" ></option>`;
    }
    document.querySelector("#cities").innerHTML = options;
    console.log(listOfCities);
  }
};

const handleCitySelection =(event)=>{
  selectedCityText = event.target.value;
  let options = document.querySelectorAll("#cities > option");
  if (options?.length) {
    let selectedOption = Array.from(options).find(
      (opt) => opt.value === selectedCityText
    );
    selectedCity = JSON.parse(selectedOption.getAttribute("data-city-details"));
    loadData();
  }
};
const debounceSearch = debounce((event)=> onSearchChange(event));
loadForcastUsingGeolocation();
document.addEventListener("DOMContentLoaded",async()=>{
    const searchInput = document.querySelector("#search");
    searchInput.addEventListener("input",debounceSearch );
    searchInput.addEventListener("Change", handleCitySelection);
});