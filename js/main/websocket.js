if ("WebSocket" in window) {
    var ws = new WebSocket("ws://150.117.110.118:910")

    ws.onopen = function () {
        ws.send(JSON.stringify({
            "APIkey": "a5ef9cb2cf9b0c14b6ba71d0fc39e329",
            "Function": "earthquakeService",
            "Type": "subscription",
            "FormatVersion": 1,
            "UUID": 2
        }))
    }

    ws.onmessage = function (evt) {
        var received_msg = evt.data
        //alert(received_msg)
    }

    ws.onclose = function () {
        var ws = new WebSocket("ws://150.117.110.118:910")
        alert("Connection is closed...")
    }
    
} else {
    alert("WebSocket NOT supported by your Browser!")
}