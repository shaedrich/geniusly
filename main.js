console.log('Geniusly loaded')
var styleSheet = document.createElement('style');
document.head.appendChild(styleSheet);
styleSheet.sheet.insertRule(".contribution-opportunities-artist { cursor: pointer; padding: 2px 5px; }");
styleSheet.sheet.insertRule(".contribution-opportunities-artist:hover { background-color: silver; }");
styleSheet.sheet.insertRule(".contribution-opportunities-artist-pointer { float: right; font-weight: bold; }");
styleSheet.sheet.insertRule(".contribution-opportunities-artist > .user_avatar { float: left; margin-right: 5px; }");

var earnIQBtn = document.querySelector('inbox-container[inbox-name="iq_inbox"]');
var oldListHandled = false;
var newContainer = new DocumentFragment();
earnIQBtn.querySelector('inbox-icon').addEventListener('click', function(e) {
	var feedDropdown = earnIQBtn.querySelector('.feed_dropdown');
	var isOpen = feedDropdown != null || !feedDropdown.classList.contains('ng-hide');
	var headline = feedDropdown.querySelector('iq-inbox > div > span');
	var subHeadline = document.createElement('span');
	var subHeadlineText = document.createTextNode('');

	subHeadline.classList.add('subheading');
	subHeadline.appendChild(subHeadlineText);
	headline.appendChild(subHeadline);

	if (isOpen) {
		artistOverview();

		if (!oldListHandled) {
			handleOldList();
		}
	}
});

function handleOldList() {
	var container = earnIQBtn.querySelector('.feed_dropdown > iq-inbox > div');
	const observer = new MutationObserver(function(mutationsList, observer) {
		if (!oldListHandled) {
			console.log("initial newContainer", newContainer, newContainer.childElementCount)
			var _newContainer = new DocumentFragment();
			var els = mutationsList.reduce(function(list, mutation) {
				if (mutation.addedNodes) {
					list = list.concat(...Array.from(mutation.addedNodes).filter(function(node) {
						return node.nodeType === Node.ELEMENT_NODE && node.classList.contains('nganimate-fade_slide_from_left');
					}));
				}
				return list;
			}, []);
			if (els.length) {
				for (var el of els) {
					el.remove();
					_newContainer.appendChild(el);
				}
				newContainer = _newContainer;
				observer.disconnect();
				oldListHandled = true;
			}
		}
	});
	observer.observe(container, { childList: true });
}

var getMe = (function() {
	var me = null;
	return async function () {
		if (me == null) {
			var get = await fetch('/api/account');
			json = await get.json();
			me = json.response.user;
		}
		return me;
	}
})();

var artistOverview = (function() {
	var artists = null;
	return async function() {
		if (artists == null) {
			artists = await loadArtists();
		}
		renderArtists(artists);
	}
})();

async function loadArtists() {
	var me = await getMe();
	var accomplishments = await fetch(`https://genius.com/api/users/${me.id}/accomplishments?per_page=10&visibility=visible`);
	var top10Artists = await accomplishments.json();
	var allArtist = { name: "All", id: "all" };
	var artists = [ allArtist, ...top10Artists.response.accomplishments.map(accomplishment => accomplishment.artist)];

	renderArtists(artists);
	return artists;
}

function renderArtists(artists) {
	var list = document.createElement('ul');

	for (var artist of artists) {
		var item = document.createElement('li');
		var itemImage = document.createElement('div');
		var itemPointer = document.createElement('span');
		var itemPointerText = document.createTextNode('>');
		var itemText = document.createTextNode(artist.name);

		itemImage.classList.add('user_avatar', 'user_avatar--x_small', 'clipped_background_image');
		itemImage.style.backgroundImage = `url(${artist.image_url})`;
		itemPointer.classList.add('contribution-opportunities-artist-pointer');

		item.style.cursor = 'pointer';
		item.dataset.artistId = artist.id;
		item.dataset.artist = artist.name;
		item.classList.add('contribution-opportunities-artist');
		item.addEventListener('click', loadArtistOpportunities);

		itemPointer.appendChild(itemPointerText);
		item.appendChild(itemImage);
		item.appendChild(itemText);
		item.appendChild(itemPointer);
		list.appendChild(item);
	}

	renderEarnIQContent(list, false);
}

async function loadArtistOpportunities(ev) {
	var { artistId, artist } = ev.target.dataset;

	renderArtistOpportunities(null, artist);

	if (artistId === "all") {
		var artistOpportunities = {};
	}
	else {
		var opportunities = await fetch(`https://genius.com/api/artists/${artistId}/contribution_opportunities?per_page=10&text_format=html,markdown`);
		var contributionOpportunities = await opportunities.json();
		var artistOpportunities = contributionOpportunities.response.contribution_opportunities;
	}

	renderArtistOpportunities(artistOpportunities, artist);
}

function renderArtistOpportunities(opportunities, artist) {
	var fragment = new DocumentFragment();
	var backBtn = document.createElement('a');
	var backBtnText = document.createTextNode('Back');

	backBtn.addEventListener('click', artistOverview);
	Object.assign(backBtn.style, {
		cursor: 'pointer',
		display: 'block'
	});

	backBtn.appendChild(backBtnText);
	fragment.appendChild(backBtn);

	if (artist === "All") {
		console.log("All newContainer", newContainer, newContainer.childElementCount)
		fragment.appendChild(newContainer.cloneNode(true));
		renderEarnIQContent(fragment);
	} else if (opportunities === null) {
		var loadingBox = document.createElement('div');
		var loadingText = document.createTextNode('Loading …');
		loadingBox.appendChild(loadingText);
		fragment.appendChild(loadingBox);
		renderEarnIQContent(fragment, ` of ${artist}`);
	} else {
		var pre = document.createElement('pre');
		var preText = document.createTextNode(opportunities);
		pre.appendChild(preText);
		fragment.appendChild(pre);
		renderEarnIQContent(fragment, ` of ${artist}`);
	}

}

function renderEarnIQContent(child, subheading) {
	var feedDropdown = earnIQBtn.querySelector('.feed_dropdown');
	var container = feedDropdown.querySelector('iq-inbox > div');
	var content = feedDropdown.querySelectorAll('iq-inbox > div > :not(:first-child)');
	for (var el of content) {
		el.remove();
	}

	if (subheading != null || subheading === false) {
		var subheadingText = document.createTextNode(subheading === false ? '' : subheading);
		el = feedDropdown.querySelector('.subheading');
		console.log(el, el.firstChild, subheadingText)
		el.replaceChild(subheadingText, el.firstChild);
	}

	container.appendChild(child);
}
