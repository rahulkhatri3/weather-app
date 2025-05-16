const API_KEY="bdca2295fe3404079e7be89972321194";

const DAYS_OF_THE_WEEK = ["sun","mon","tue","wed","thu","fri","sat"];

const getCurrentWeatherData = async()=>{
    const city ="ujjain"
    const response = await fetch (`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    return response.json()
}

const gethourlyforcast = async({name:city})=>{
const response = await fetch (`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`)
const data = await response.json()
return data.list.map(forcast=>{
    const {main:{temp, temp_max,temp_min},dt, dt_txt,weather:[{description,icon}]}=forcast;
    return{temp,temp_max,temp_min,dt,dt_txt,description,icon }
   
})

}

const formatTemprature = (temp)=> `${temp?. toFixed(1)}`;
 const createIconUrl= (icon)=>`https://openweathermap.org/img/wn/${icon}@2x.png`

const loadCurrentData = ({name,main:{temp, temp_max, temp_min}, weather:[{description}]})=>{

    const currentForeCastElement = document.querySelector("#current-forcast");
    currentForeCastElement.querySelector(".city").textContent=name;
    currentForeCastElement.querySelector(".temp").textContent=formatTemprature(temp);
    currentForeCastElement.querySelector(".description").textContent=description;
    currentForeCastElement.querySelector(".min-max-temp").textContent=`H: ${formatTemprature(temp_max)} L:${formatTemprature(temp_min)}`;


}

const loadHourlyForcast= (hourlyForcast)=>{

    console.log(hourlyForcast)
    let dataFor12Hours = hourlyForcast.slice(1, 13);
   const hourlyContainer= document.querySelector(".hourly-container")
        let innerHTMLString = ``;


    for (let {temp,icon, dt_txt} of dataFor12Hours){
        innerHTMLString +=  `<article>
        <h3 class="time">${dt_txt.split(" ")[1]}</h3>
        <img class="icon" src="${createIconUrl(icon)}" />
        <p class="hourly-temp">${formatTemprature(temp)}</p>
         </article> `       
}

 hourlyContainer.innerHTML=innerHTMLString;
}

const calculateDayWiseForcast = (hourlyForcast)=>{
    let dayWiseForcast = new Map();
    for (let forcast of hourlyForcast) {
        const [date] = forcast.dt_txt.split(" ");
        const dayOfTheWeek = DAYS_OF_THE_WEEK[new Date(date).getDay()]
        console.log (dayOfTheWeek);


        if (dayWiseForcast.has(dayOfTheWeek)){
            let forcastForTheDay = dayWiseForcast.get(dayOfTheWeek);
            forcastForTheDay.push(forcast);
            dayWiseForcast.set(dayOfTheWeek.forcastForTheDay)
        }
        else {
            dayWiseForcast.set(dayOfTheWeek, [forcast]);
        }
    }
    console.log(dayWiseForcast);
for (let [key, value] of dayWiseForcast){
    let temp_min = Math.min (...Array.from (value, val=> val.temp_min))
    let temp_max = Math.max (...Array.from (value, val=> val.temp_max))
dayWiseForcast.set(key, {temp_min , temp_max, icon:value.find(v=>v.icon).icon})
}
console.log(dayWiseForcast)
return dayWiseForcast;

} 


const loadFiveDayForcast = (hourlyForcast)=>{
console.log(hourlyForcast)
const dayWiseForcast =calculateDayWiseForcast(hourlyForcast);
const container = document.querySelector(".five-day-forcast-container")
let dayWiseInfo = "";
Array.from(dayWiseForcast).map(([day, { temp_max,temp_min,icon}],index) =>{

    dayWiseInfo += ` <article class="day-wise-forcast">
            <h3>${index ===0? "today": day}</h3>
           <img class="icon" src="${createIconUrl(icon)}" alt="icon for the forcast">
            <p class="min-temp">${temp_min}</p>
            <p class="max-temp">${temp_max}</p>
            </article> `;
})
container.innerHTML=dayWiseInfo;
}

const loadFeelsLike =({main:{feels_like}}) =>{
    let container = document.querySelector("#feels-like");
    container.querySelector(".feels-like-temp").textContent= formatTemprature(feels_like);

}


const loadhumidity =({main:{humidity}}) =>{
    let container = document.querySelector("#humidity");
    container.querySelector(".humidity-value").textContent=`${humidity}%`;

}


document.addEventListener("DOMContentLoaded",async()=>{
    const CurrentWeather = await getCurrentWeatherData();
   loadCurrentData(CurrentWeather)
   const hourlyforcast= await gethourlyforcast (CurrentWeather);
   loadHourlyForcast(hourlyforcast)
   loadFiveDayForcast(hourlyforcast);
   loadFeelsLike(CurrentWeather);
loadhumidity(CurrentWeather);
})