console.log("backgroundjs")
chrome.runtime.onMessage.addListener(function(message, sender, callback) {
	console.log("onMessage", message, sender, callback)
	if (message.command === 'loadYTApi') {
		//chrome.tabs.query( {active: true }, function(tabs) {
			console.log("tab", arguments);
			(function() {
				var ga = document.createElement('script');
				ga.type = 'text/javascript';
				ga.async = true;
				ga.src = "https://www.youtube.com/iframe_api";
				ga.addEventListener('load', function() {
					console.log('YT', arguments, YT)
				})
				var s = document.getElementsByTagName('script')[0];
				s.parentNode.insertBefore(ga, s);
			})();/*
			fetch("https://www.youtube.com/iframe_api", { mode: 'no-cors', headers: { 'Content-Type': 'text/javascript' } }).then(function(result) {
				result.text().then(function(script) {
					console.log("script", result, callback, tabs[0].id)
					chrome.tabs.executeScript(tabs[0].id, {code: script});
					callback(script);
				});
			});*/
		//});
		return true;
	}
});

function onYouTubeIframeAPIReady() {
	chrome.tabs.query( {active: true }, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { command: "loadYTiframes", YT: YT });
	});
}