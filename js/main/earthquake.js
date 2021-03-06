let Lat = 25.0421407
let Long = 121.5198716
let audio = false
let audioList = []
let audioLock = false
let isPlay = false
let ReportCache = {}
let ReportMark = null

let data = {
    "APIkey": "a5ef9cb2cf9b0c86b6ba71d0fc39e329",
    "Function": "data",
    "Type": "earthquake",
    "FormatVersion": 1
}
axios.post('http://150.117.110.118:10150', data)
    .then(function (response) {
        main(response.data)
    })
    .catch(function (error) {
        console.log(error)
    })

if ("WebSocket" in window) {
    var ws = new WebSocket("ws://150.117.110.118:910")

    ws.onopen = async function () {
        let UUID = await uuid()
        ws.send(JSON.stringify({
            "APIkey": "a5ef9cb2cf9b0c14b6ba71d0fc39e329",
            "Function": "earthquakeService",
            "Type": "subscription",
            "FormatVersion": 1,
            "UUID": "UUID"
        }))
        console.log("UUID >> " + UUID)
    }

    ws.onmessage = async function (evt) {
        let json = JSON.parse(evt.data)
        if (json.Function == "report") {
            main(json)
        } else if (json.Function == "earthquake") {
            if (audio == true) {
                audioPlay("../../audio/main/1/alert.wav")
                let point = Math.sqrt(Math.pow(Math.abs(Lat + (Number(json.NorthLatitude) * -1)) * 111, 2) + Math.pow(Math.abs(Long + (Number(json.EastLongitude) * -1)) * 101, 2))
                let distance = Math.sqrt(Math.pow(Number(json.Depth), 2) + Math.pow(point, 2))
                let value = Math.round((distance - ((new Date().getTime() - json.Time) / 1000) * 3.5) / 3.5)

                let level = "0"
                let PGA = (1.657 * Math.pow(Math.E, (1.533 * json.Scale)) * Math.pow(distance, -1.607)).toFixed(3)
                if (PGA >= 800) {
                    level = "7"
                } else if (800 >= PGA && 440 < PGA) {
                    level = "6+"
                } else if (440 >= PGA && 250 < PGA) {
                    level = "6-"
                } else if (250 >= PGA && 140 < PGA) {
                    level = "5+"
                } else if (140 >= PGA && 80 < PGA) {
                    level = "5-"
                } else if (80 >= PGA && 25 < PGA) {
                    level = "4"
                } else if (25 >= PGA && 8 < PGA) {
                    level = "3"
                } else if (8 >= PGA && 2.5 < PGA) {
                    level = "2"
                } else if (2.5 >= PGA && 0.8 < PGA) {
                    level = "1"
                } else {
                    level = "0"
                }
                audioPlay(`../../audio/main/1/${level.replace("+", "").replace("-", "")}.wav`)
                if (level.includes("+")) {
                    audioPlay(`../../audio/main/1/intensity-strong.wav`)
                } else if (level.includes("-")) {
                    audioPlay(`../../audio/main/1/intensity-weak.wav`)
                } else {
                    audioPlay(`../../audio/main/1/intensity.wav`)
                }
                if (value > 0) {
                    if (value <= 10) {
                        audioPlay(`../../audio/main/1/${value.toString()}.wav`)
                    } else if (value < 20) {
                        audioPlay(`../../audio/main/1/x${value.toString().substring(1, 2)}.wav`)
                    } else {
                        audioPlay(`../../audio/main/1/${value.toString().substring(0, 1)}x.wav`)
                        audioPlay(`../../audio/main/1/x${value.toString().substring(1, 2)}.wav`)
                    }
                    audioPlay(`../../audio/main/1/second.wav`)
                }
                let time = -1
                let Stamp = 0
                let t = setInterval(async () => {
                    value = Math.round((distance - ((new Date().getTime() - json.Time) / 1000) * 3.5) / 3.5)
                    if (Stamp != value) {
                        Stamp = value
                        if (time >= 0) {
                            audioPlay(`../../audio/main/1/ding.wav`)
                            time++
                            if (time >= 10) {
                                clearInterval(t)
                            }
                        } else {
                            if (value > 10) {
                                if (value.toString().substring(1, 2) == "0") {
                                    audioPlay(`../../audio/main/1/${value.toString().substring(0, 1)}x.wav`)
                                    audioPlay(`../../audio/main/1/x0.wav`)
                                } else {
                                    audioPlay(`../../audio/main/1/ding.wav`)
                                }
                            } else if (value > 0) {
                                audioPlay(`../../audio/main/1/${value.toString()}.wav`)
                            } else {
                                audioPlay(`../../audio/main/1/arrive.wav`)
                                time = 0
                            }
                        }
                    }
                }, 0)
            }
            var myIcon = L.icon({
                iconUrl: '../../image/main/cross.png',
                iconSize: [30, 30],
            })
            L.marker([Number(json.NorthLatitude), Number(json.EastLongitude)], { icon: myIcon }).addTo(map)
            map.setView([Number(json.NorthLatitude), Number(json.EastLongitude)], 7.5)
            var Pcircle = null
            var Scircle = null
            let Loom = 0
            let Timer = setInterval(async () => {
                if (Pcircle != null) map.removeLayer(Pcircle)
                Pcircle = L.circle([Number(json.NorthLatitude), Number(json.EastLongitude)], {
                    color: '#6FB7B7',
                    fillColor: 'transparent',
                    radius: Math.sqrt(Math.pow((new Date().getTime() - json.Time) * 6.5, 2) - Math.pow(Number(json.Depth) * 1000, 2))
                })
                map.addLayer(Pcircle)
                if (Scircle != null) map.removeLayer(Scircle)
                Scircle = L.circle([Number(json.NorthLatitude), Number(json.EastLongitude)], {
                    color: 'red',
                    fillColor: '#F8E7E7',
                    fillOpacity: 0.1,
                    radius: Math.sqrt(Math.pow((new Date().getTime() - json.Time) * 3.5, 2) - Math.pow(Number(json.Depth) * 1000, 2))
                })
                map.addLayer(Scircle)
                if (new Date().getTime() - json.Time > 180000) {
                    map.removeLayer(Scircle)
                    map.removeLayer(Pcircle)
                    clearInterval(Timer)
                    map.setView([Lat, Long], 7.5)
                }
                if ((new Date().getTime() - json.Time) * 6.5 > 150000 && Loom < 150000) {
                    Loom = 150000
                    map.setView([Number(json.NorthLatitude), Number(json.EastLongitude)], 7)
                } else if ((new Date().getTime() - json.Time) * 6.5 > 250000 && Loom < 250000) {
                    Loom = 250000
                    map.setView([Number(json.NorthLatitude), Number(json.EastLongitude)], 6)
                } else if ((new Date().getTime() - json.Time) * 6.5 > 500000 && Loom < 500000) {
                    Loom = 500000
                    map.setView([Number(json.NorthLatitude), Number(json.EastLongitude)], 5)
                } else if ((new Date().getTime() - json.Time) * 6.5 > 1000000 && Loom < 1000000) {
                    Loom = 1000000
                    map.setView([Number(json.NorthLatitude), Number(json.EastLongitude)], 4)
                }
            }, 0)
        }
    }

    ws.onclose = function () {
        ws = new WebSocket("ws://150.117.110.118:910")
        alert("???????????????????????????")
    }
} else {
    alert("WebSocket NOT supported by your Browser!")
}

async function audioPlay(src) {
    audioList.push(src)
    if (isPlay == false) {
        isPlay = true
        let T = setInterval(async () => {
            if (audioList.length != 0) {
                Audio(audioList[0])
            } else {
                clearInterval(T)
                isPlay = false
            }
        }, 0)
    }

    function Audio(src) {
        if (audioLock == false) {
            audioLock = true
            audioList.splice(audioList.indexOf(src), 1)
            var audioDOM = document.getElementById("warning-update-player")
            audioDOM.src = src
            var promise = audioDOM.play()
            promise.then(resolve => {
                audioDOM.addEventListener("ended", function () {
                    audioLock = false
                })
            }).catch(reject => {

            })
        }
    }
}

var map = L.map('map', {
    attributionControl: false,
    closePopupOnClick: false
}).setView([23, 121], 7.5)

var tiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 14,
    id: 'mapbox/dark-v10',
    tileSize: 512,
    zoomOffset: -1
}).addTo(map)

navigator.geolocation.getCurrentPosition(function (position) {
    Lat = Number(position.coords.latitude)
    Long = Number(position.coords.longitude)
    add()
})

add()

function add() {
    var marker = L.marker([Lat, Long])
    map.addLayer(marker)
    map.setView([Lat, Long], 7.5)
}

function playAudio() {
    audio = false
    setTimeout(function () {
        var audioDOM = document.getElementById("warning-update-player")
        var promise = audioDOM.play()
        promise.then(resolve => {
            audio = true
        }).catch(reject => {
            playAudio()
        })
    }, 0)
}
playAudio()

async function click(time) {
    // var roll = document.getElementById("rolllist")
    // roll.scrollTo(0,0)
    if (ReportMark != null) map.removeLayer(ReportMark)
    var myIcon = L.icon({
        iconUrl: '../../image/main/star.png',
        iconSize: [30, 30],
    })
    map.setView([Number(ReportCache[time].NorthLatitude), Number(ReportCache[time].EastLongitude)], 7.5)
    ReportMark = L.marker([Number(ReportCache[time].NorthLatitude), Number(ReportCache[time].EastLongitude)], { icon: myIcon }).addTo(map)
}

async function main(Data) {
    for (let index = 0; index < Data["response"].length; index++) {
        var roll = document.getElementById("rolllist")
        var Div = document.createElement("DIV")
        Div.style.height = "auto"
        Div.style.overflow = "hidden"
        Div.style.paddingRight = "3%"
        if (index == 0) {
            Div.innerHTML =
                `<div class="background" style="display: flex; align-items:center; padding:2%;">
                <div class="left" style="width:30%; text-align: center;">
                    <font color="white" size="3">????????????</font><br><b><font color="white" size="7">${Data["response"][index]["Max"]}</font></b>
                </div>
                <div class="middle" style="width:60%;">
                    <b><font color="white" size="4">${Data["response"][index]["Location"].substring(Data["response"][index]["Location"].indexOf("(") + 1, Data["response"][index]["Location"].indexOf(")")).replace("??????", "")}</font></b>
                    <br><font color="white" size="2">${Data["response"][index]["UTC+8"]}</font>
                    <br><b><font color="white" size="5">M${Data["response"][index]["Scale"]} </font></b><font color="white" size="2"> ??????: </font><b><font color="white" size="4">${Data["response"][index]["Depth"]}km</font></b>
                </div>
            </div>`
        } else {
            Div.innerHTML =
                `<div class="background" style="display: flex; align-items:center;">
                <div class="left" style="width:20%; text-align: center;">
                    <b><font color="white" size="6">${Data["response"][index]["Max"]}</font></b>
                </div>
                <div class="middle" style="width:60%;">
                    <b><font color="white" size="3">${Data["response"][index]["Location"].substring(Data["response"][index]["Location"].indexOf("(") + 1, Data["response"][index]["Location"].indexOf(")")).replace("??????", "")}</font></b>
                    <br><font color="white" size="2">${Data["response"][index]["UTC+8"]}</font>
                </div>
                <div class="right" >
                <b><font color="white" size="5">M${Data["response"][index]["Scale"]}</font></b>
                </div>
            </div>`
        }
        if (Data["response"][index]["Max"] == 1) {
            Div.style.backgroundColor = "gray"
        } else if (Data["response"][index]["Max"] == 2) {
            Div.style.backgroundColor = "#0072E3"
        } else if (Data["response"][index]["Max"] == 3) {
            Div.style.backgroundColor = "#00DB00"
        } else if (Data["response"][index]["Max"] == 4) {
            Div.style.backgroundColor = "#EAC100"
        } else if (Data["response"][index]["Max"] == 5) {
            Div.style.backgroundColor = "#FFA042"
        } else if (Data["response"][index]["Max"] == 5) {
            Div.style.backgroundColor = "#D94600"
        } else if (Data["response"][index]["Max"] == 6) {
            Div.style.backgroundColor = "#EA0000"
        } else if (Data["response"][index]["Max"] == 6) {
            Div.style.backgroundColor = "#AE0000"
        } else if (Data["response"][index]["Max"] == 7) {
            Div.style.backgroundColor = "#930093"
        }
        Div.addEventListener("click", function () {
            ReportCache[Data["response"][index]["Time"]] = Data["response"][index]
            click(Data["response"][index]["Time"])
        })
        roll.appendChild(Div)
    }
}

document.cookie = `${JSON.stringify()}; expires=Thu, 18 Dec 2043 12:00:00 GMT; path=/`