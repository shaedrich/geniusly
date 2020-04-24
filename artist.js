console.log("ROUTE :: artist")
var templates = {
	miniSongCard: `<mini-song-card object="song" artist="$ctrl.artist">
		<a ng-href="{{song.url}}" class="mini_card" ng-class="{'mini_card--small': $ctrl.variants.small}" href="{{song.url}}">
			<div class="mini_card-thumbnail clipped_background_image--background_fill clipped_background_image" clipped-background-image=":: $ctrl.song.song_art_image_thumbnail_url" style="background-image: url(&quot;{{song.song_art_image_thumbnail_url}}&quot;);">
				<!---->
			</div>
			<div class="mini_card-info">
				<div class="mini_card-title_and_subtitle">
					<div class="mini_card-title">{{song.title}}</div>
					<div class="mini_card-subtitle">
					{{song.primary_artist.name}}<!---->
					</div>
				</div>
				<!---->
				<!----><div ng-if="!$ctrl.excerpt_with_markup">
					<!----><div ng-if="$ctrl.song.lyrics_state === 'complete'" class="mini_card-metadata">
					<!---->
					<!---->
					<!----><span ng-if=":: $ctrl.song.stats.pageviews">
						<svg src="eye.svg" class="inline_icon inline_icon--up_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 15.45"><path d="M11 2c4 0 7.26 3.85 8.6 5.72-1.34 1.87-4.6 5.73-8.6 5.73S3.74 9.61 2.4 7.73C3.74 5.86 7 2 11 2m0-2C4.45 0 0 7.73 0 7.73s4.45 7.73 11 7.73 11-7.73 11-7.73S17.55 0 11 0z"></path><path d="M11 5a2.73 2.73 0 1 1-2.73 2.73A2.73 2.73 0 0 1 11 5m0-2a4.73 4.73 0 1 0 4.73 4.73A4.73 4.73 0 0 0 11 3z"></path></svg>
						{{song.stats.pageviews}}
					</span><!---->
					<!---->
					</div><!---->
					<!---->
					<!---->
				</div><!---->
			</div>
		</a>
	</mini-song-card>`
};
var pageData = JSON.parse(document.querySelector('meta[itemprop="page_data"]').content);

// Chapter settings
var contributionOpportunities = [];
var tabName = 'description';

var artistId = document.querySelector('meta[name="newrelic-resource-path"]').getAttribute('content'); // or: angular.element(document.querySelector('.profile_identity-text')).injector().get('$rootScope').artist.api_path

var filterOptions = {
	"all": chrome.i18n.getMessage('all'),
	"missing_writer_artists": chrome.i18n.getMessage('missing_writer_artists'),
	"missing_media": chrome.i18n.getMessage('missing_media'),
	"missing_producer_artists": chrome.i18n.getMessage('missing_producer_artists'),
	"answer": chrome.i18n.getMessage('answer'),
	"missing_albums": chrome.i18n.getMessage('missing_albums'),
	"missing_release_date": chrome.i18n.getMessage('missing_release_date'),
}
var activeFilter = 'all';
var content = null;
var setActiveFilter = function(e) {
	activeFilter = e.target.dataset.filter;
	renderFilterBar(content);
}
function renderFilterBar(content) {
	var previousFilterbar = document.querySelector('.zuri-filterbar');
	if (previousFilterbar) {
		previousFilterbar.remove();
	}
	var filterBar = document.createElement('ul');
	filterBar.classList.add('zuri-filterbar');
	Object.assign(filterBar.style, {
		marginTop: '20px',
	})
	for (var filter in filterOptions) {
		var filterEl = document.createElement('li');
		var filterText = document.createTextNode(filterOptions[filter]);

		filterEl.dataset.filter = filter;
		filterEl.classList.add('square_button');
		Object.assign(filterEl.style, {
			marginBottom: '5px',
			marginRight: '5px',
		});
		if (activeFilter === filter) {
			Object.assign(filterEl.style, {
				backgroundColor: 'black',
				color: 'white',
			});
		}
		filterEl.addEventListener('click', setActiveFilter);

		filterEl.appendChild(filterText);
		filterBar.appendChild(filterEl);
	}
	content.prepend(filterBar);
	contributionOpportunities = [];
	loadOpportunities();
}

function renderOpportunities() {
	console.log("contributionOpportunities", contributionOpportunities);
}

function loadOpportunities(nextCursor) {
	var url = `/api${artistId}/contribution_opportunities?per_page=10&text_format=html,markdown`;
	if (nextCursor != null) {
		url += `&next_cursor=${nextCursor}`;
	}
	fetch(url).then(function(res) {
		res.json().then(function(body) {
			if (body.meta.status === 200) {
				if (activeFilter === "all") {
					contributionOpportunities = body.response.contribution_opportunities
					renderOpportunities();
				} else {
					matches = body.response.contribution_opportunities.filter((op) => op.action === activeFilter);

					contributionOpportunities.push(matches.slice(0, Math.min(matches.length, 10 - contributionOpportunities.length)));

					if (contributionOpportunities.length < 10) {
						console.log(`${contributionOpportunities.length}/10`);
						loadOpportunities(body.response.next_cursor);
					}
					else {
						renderOpportunities();
					}
				}
			}
			else {
				console.log("error", body.meta);
			}
		});
	}); // next_cursor=eyJjcmVhdGVkX2F0IjoiMjAxOS0xMS0yNFQyMzoyNDowOVoiLCJpZCI6MTA1NzQ2NDV9
}

var setTabName = function(e) {
	var onClick = e.target.getAttribute('ng-click');
	var regExp = /\$ctrl\.change_state\('([a-z_]+)'\)/;
	tabName = onClick.match(regExp)[1];

	console.log('tabName', tabName);
	if (tabName === 'opportunities') {
		content = document.querySelector('[ng-switch-when="opportunities"]');
		renderFilterBar(content);
	} else if (tabName === 'description') {
		if (pageData.artist_songs.length < 10 && pageData.artist_has_more_songs) {
			console.log(`/api${pageData.artist.api_path}`);
			loadMoreSongs(pageData.artist).then(function(songs) {
				var grouped = Promise.all(songs.map(function(song) {
					return loadSong(song);
				})).then(groupSongsByRole).then(renderSongsByRole);
			});
		}
	}
}

function loadMoreSongs(artist) {
	return new Promise(function(resolve, reject) {
		fetch(`/api${artist.api_path}/songs?page=1&sort=popularity`).then(function(res) {
			res.json().then(function(body) {
				var songs = body.response.songs.filter(function(song) {
					return song.primary_artist.id !== artist.id;
				});
				resolve(songs);
			});
		});
	})
}

function loadSong(song) {
	return new Promise(function(resolve, reject) {
		fetch(`/api${song.api_path}`).then(function(res) {
			res.json().then(function(body) {
				resolve(body.response.song);
			});
		});
	});
}

function groupSongsByRole(songs) {
	return songs.reduce(function(roles, song) {
		if (song.writer_artists.find((artist) => artist.id === pageData.artist.id)) {
			roles.writer_artists.push(song);
		}
		if (song.producer_artists.find((artist) => artist.id === pageData.artist.id)) {
			roles.producer_artists.push(song);
		}
		if (song.featured_artists.find((artist) => artist.id === pageData.artist.id)) {
			roles.featured_artists.push(song);
		}
		if (song.custom_performances.find((artist) => artist.id === pageData.artist.id)) {
			roles.custom_performances.push(song);
		}
		if (song.primary_artist.id === pageData.artist.id) {
			roles.primary_artists.push(song);
		}
		return roles;
	}, { 'writer_artists': [], 'producer_artists': [], 'primary_artists': [], 'featured_artists': [], 'custom_performances': [] });
}

var sectionTitleMapping = {
	writer_artists: chrome.i18n.getMessage('writer'),
	producer_artists: chrome.i18n.getMessage('producer'),
	primary_artists: chrome.i18n.getMessage('primary_artist'),
	featured_artists: chrome.i18n.getMessage('feature_artist'),
	custom_performances: chrome.i18n.getMessage('custom_performances'),
}
console.log("lang", chrome.i18n.getUILanguage())

function renderSongsByRole(roles) {
	var fragment = new DocumentFragment();
	for ([ section, songs ] of Object.entries(roles)) {
		if (songs.length) {
			var sectionTitle = document.createElement('div');
			var sectionTitleText = document.createTextNode(sectionTitleMapping[section]);
			sectionTitle.classList.add('text_label', 'text_label--gray', 'u-xx_large_top_margin', 'u-half_bottom_margin');
			sectionTitle.appendChild(sectionTitleText);

			var miniCardGrid = document.createElement('div');
			var cardsFragment = new DocumentFragment();
			miniCardGrid.classList.add('mini_card_grid');

			for (var song of songs) {
				var miniCardGridSong = document.createElement('div');
				miniCardGridSong.classList.add('mini_card_grid-song');
				miniCardGridSong.innerHTML = template('miniSongCard', { song });
				cardsFragment.appendChild(miniCardGridSong);
			}

			miniCardGrid.append(cardsFragment);
			fragment.appendChild(sectionTitle);
			fragment.appendChild(miniCardGrid);
		}
	}
	var artistSongsAndAlbums = document.querySelector('artist-songs-and-albums')
	artistSongsAndAlbums.insertBefore(fragment, artistSongsAndAlbums.querySelector('album-grid'));
}

function template(tmpl, opts) {
	if (templates[tmpl] == null) {
		console.error("Template does not exist");
		return;
	}

	var placeholderRegExp = /\{\{([a-z._]+)\}\}/g;
	var tmplStr = templates[tmpl];
	//var tmplVar = [...tmplStr.matchAll(placeholderRegExp)].map((match) => match[1]);

	return tmplStr.replace(placeholderRegExp, function(match, group) {
		if (getFromPath(opts, group) != null) {
			return getFromPath(opts, group);
		}
		return match;
	});
}

// Retrieve/create elements
var headerNavItems = document.querySelectorAll('.profile_header-tabs > h3')
for (var item of headerNavItems) {
	item.addEventListener('click', setTabName);
}
