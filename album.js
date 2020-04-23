chrome.runtime.sendMessage('dfccfpkdlaefepafaljbhpghnbimnfca', { command: "loadYTApi" }, {}, function() {
	console.log(arguments)
});

var styleSheet = document.createElement('style');
document.head.appendChild(styleSheet);
styleSheet.sheet.insertRule(".square_button_active { background-color: black; color: white; }");
styleSheet.sheet.insertRule(".square_button_active:hover { color: black; }");

ytInit = false;
YT = null;
function onYouTubeInitialized(callbackFn) {
	if (!ytInit) {
		window.addEventListener('youtube:initialized', function(e) {
			YT = e.detail.YT;
			ytInit = true;
			callbackFn(YT);
		});
		return;
	}
	callbackFn(YT);
}

chrome.runtime.onMessage.addListener(function(message, sender, callback) {
	console.log("onMessage", message, sender, callback, message.command === 'loadYTiframes')
	if (message.command === 'loadYTiframes') {
		console.log("youtube is ready my lord!")
		var ev = new CustomEvent('youtube:initialized', { detail: { YT: message.YT } });
		window.dispatchEvent(ev);
	}
});

var albumPage = document.querySelector('.column_layout-column_span--primary > div');
var adminMenu = albumPage.querySelector('album-admin-menu');
var tracklistRows = albumPage.querySelectorAll('album-tracklist-row');

var albumTitle = document.querySelector('.header_with_cover_art-primary_info-title').innerHTML;
var pageData = JSON.parse(document.querySelector('meta[itemprop="page_data"]').content);

var btnBox = document.createElement('ul');
btnBox.classList.add('view-type-btn-box');
btnBox.style.float = 'right';
var displayOptions = {
	"tracklist": {
		icon: "\u2637",
		title: "Tracklist",
	},
	"youtube": {
		icon: "\u25B6",
		title: "YouTube videos",
	},
};
var videoList = document.createElement('div');
Object.assign(videoList.style, {
	display: 'flex',
});
var videoListTitle = document.createElement('h2');
var videoListTitleText = document.createTextNode(`${albumTitle} YouTube Videos`)
videoListTitle.classList.add('text_label', 'text_label--gray', 'u-half_bottom_margin');

var videosLoaded = false;
function getVideos() {
	var requests = pageData.album_appearances.map(function(appearance) {
		return fetch(`/api${appearance.song.api_path}`).then(function(res) {
			videosLoaded = true;
			return res.json();
		});
	});
	console.log("requests", requests);

	Promise.all(requests).then(renderVideos);
}

function renderVideos(songs) {
	songs = songs.map(function(song) {
		return song.response.song;
	});
	console.log("songs", songs, window, window.top);
	var fragment = new DocumentFragment();
	for (var song of songs) {
		if (song.youtube_url !== null) {
			var videoId = song.youtube_url.slice(31);
			var embed = document.createElement('iframe')
			Object.assign(embed, {
				id: "ytplayer",
				type: "text/html",
				width: "250",
				height: "140.625",
				src: `https://www.youtube.com/embed/${videoId}?modestbranding=1&origin=http://genius.com`,
				frameborder: "0",
			})
			embed.style.margin = "5px"
			fragment.appendChild(embed)
			/* ------------- *//*
			var iframe = document.createElement('div');
			iframe.setAttribute('id', `player_${videoId}`);
			fragment.appendChild(iframe);
			onYouTubeInitialized(function(_YT) {
				console.log("youtube is intialized my lord!", YT, _YT)
				new YT.Player(`player_${videoId}`, {
					height: '360',
					width: '640',
					videoId: videoId,/*
					events: {
					  'onReady': onPlayerReady,
					  'onStateChange': onPlayerStateChange
					}*//*
				});
			})*/
		}
	}
	videoList.appendChild(fragment);
}

var fragment = new DocumentFragment();
for (var option in displayOptions) {
	var optionEl = document.createElement('li');
	var optionText = document.createTextNode(displayOptions[option].icon);

	optionEl.setAttribute('title', displayOptions[option].title);
	optionEl.dataset.option = option;
	optionEl.classList.add('square_button', 'u-bottom_margin');
	if (option === "tracklist") {
		optionEl.classList.add('square_button_active');
	}
	optionEl.style.marginRight = "2px";
	optionEl.addEventListener('click', function(e) {
		var option = e.target.dataset.option;

		btnBox.querySelector(`:scope > [data-option="${option}"]`).classList.add('square_button_active');
		btnBox.querySelector(`:scope > :not([data-option="${option}"])`).classList.remove('square_button_active');
		if (option === "youtube") {
			videoList.style.display = 'initial';
			adminMenu.nextElementSibling.style.display = 'none';
			tracklistRows.forEach(function(el) {
				el.style.display = 'none';
			});
			if (!videosLoaded) {
				getVideos();
			}
		} else if (option === "tracklist") {
			videoList.style.display = 'none';
			adminMenu.nextElementSibling.style.display = 'block';
			tracklistRows.forEach(function(el) {
				el.style.display = 'initial';
			});
		}
	});

	optionEl.appendChild(optionText);
	fragment.appendChild(optionEl);
}
videoListTitle.appendChild(videoListTitleText);
videoList.appendChild(videoListTitle);
btnBox.appendChild(fragment);
albumPage.insertBefore(btnBox, adminMenu);
albumPage.appendChild(videoList);
