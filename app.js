const API_KEY="bdca2295fe3404079e7be89972321194";
const getCurrentWeatherData = async()=>{
    const city ="pune"
    const response = await fetch (`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    return response.json()
}


const loadCurrentData = ({name,main:{temp, temp_max, temp_min}, weather:[{description}]})=>{

    const currentForeCastElement = document.querySelector("#current-forcast");
    currentForeCastElement.querySelector(".city").textContent=name;
    currentForeCastElement.querySelector(".temp").textContent=temp;
    currentForeCastElement.querySelector(".description").textContent=description;
    currentForeCastElement.querySelector(".min-max-temp").textContent=`h: ${temp_max} l:${temp_min}`;


}

document.addEventListener("DOMContentLoaded",async()=>{
    const CurrentWeather = await getCurrentWeatherData();
   loadCurrentData(CurrentWeather)

})