setTimeout = global.setTimeout.bind(global);
clearTimeout = global.clearTimeout.bind(global);
setInterval = global.setInterval.bind(global);
clearInterval = global.clearInterval.bind(global);

document.addEventListener('DOMContentLoaded', function(){
	window.ondragover = function(e) { e.preventDefault(); return false };
	window.ondrop = function(e) { e.preventDefault(); return false };
});