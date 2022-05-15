function playAudio() {
    setTimeout(function () {
        var audioDOM = document.getElementById("audio");
        var promise = audioDOM.play();
        promise.then(resolve => {
        }).catch(reject => {
            playAudio()
        })
    }, 0)
}
playAudio();