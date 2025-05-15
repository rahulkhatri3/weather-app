const API_KEY="bdca2295fe3404079e7be89972321194";
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


document.addEventListener("DOMContentLoaded",async()=>{
    const CurrentWeather = await getCurrentWeatherData();
   loadCurrentData(CurrentWeather)
   const hourlyforcast= await gethourlyforcast (CurrentWeather);
   loadHourlyForcast(hourlyforcast)

})