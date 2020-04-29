console.log("ROUTE :: artist")
/* "Songs by role" feature */
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

var artistBio = document.querySelector('.truncated_annotation_text');

var styleSheet = document.createElement('style');
document.head.appendChild(styleSheet);
styleSheet.sheet.insertRule(".geniusly-taglist { list-style-type: none; display: flex; flex-wrap: wrap; }");
styleSheet.sheet.insertRule(".geniusly-taglist > li { background-color: grey; border-radius: 5px; margin: 2px; padding: 2px 5px; font-size: smaller; height: 1.5em; line-height: 1em; font-weight: lighter; }");
styleSheet.sheet.insertRule(".square_button--youtube { background-color: red; border-color: red; color: white; }")
styleSheet.sheet.insertRule(".square_button--youtube:hover { background-color: rgba(255, 0, 0, .8); border-color: rgba(255, 0, 0, .8); }")
styleSheet.sheet.insertRule(".square_button--youtube .inline_icon { height: 1.25em; fill: #fff; height: 1.1em; }")

var db = new Database();
db.then(function(dbConnection) {
	console.log("db", dbConnection)
	dbConnection.insert('artists', {
		geniusId: 1052235,
		youtube_name: 'UCISU64nGvougXKjzaigDlag',
		defaultRole: 'Producer',
		defaultGenre: 'genre.music.pop.EDM',
		personnelType: 'group',
		tags: ['group.boyband', 'genre.music.electronic.edm', 'language.de_DE'],
		yearCarrerBegin: 2001,
		historyMilestones: [
			{ dateFrom: '2001-01-01', dateTo: '2001-01-30', type: 'tour', title: 'Europe Tour' },
			{ dateFrom: '2005-03-12', dateTo: null, type: 'contract', title: 'Under contract at', $link: { type: '_artist', path: '/artists/Polydor-records', name: 'Polydor Records' } }
		]
	});
	var getReq = dbConnection.getId(pageData.artist.id).then(function(artist) {
		if (artist != null) {
			renderAddASong(pageData.artist, artist);

			var artistInfo = document.createElement('div');
			artistInfo.style.fontWeight = 'lighter';
			artistInfo.classList.add('annotation_label');
			delimiter = document.createTextNode(', ');

			// genre
			var genre = document.createElement('strong');
			var genreText = document.createTextNode('Genre:');
			var spacer = document.createTextNode(' ');
			var genreLink = document.createElement('a');
			var genreLinkText = document.createTextNode(artist.defaultGenre.split('.').slice(-1)[0]);
			genreLink.href = `/tags/${artist.defaultGenre.split('.').slice(-1)[0].toLowerCase()}`;
			genre.appendChild(genreText);
			genreLink.appendChild(genreLinkText);
			artistInfo.appendChild(genre);
			artistInfo.appendChild(spacer);
			artistInfo.appendChild(genreLink);

			artistInfo.appendChild(delimiter.cloneNode());

			// role
			var role = document.createElement('strong');
			var roleText = document.createTextNode('Role:');
			var spacer = document.createTextNode(' ');
			var roleTextText = document.createTextNode(artist.defaultRole);
			role.appendChild(roleText);
			artistInfo.appendChild(role);
			artistInfo.appendChild(spacer);
			artistInfo.appendChild(roleTextText);

			artistBio.parentNode.insertBefore(artistInfo, artistBio);

			if (artist.tags.length) {
				var ul = document.createElement('ul');
				ul.classList.add('geniusly-taglist');

				for (var tag of artist.tags) {
					var li = document.createElement('li');
					var liText = document.createTextNode(tag);

					li.appendChild(liText);
					ul.appendChild(li);
				}

				artistBio.parentNode.insertBefore(ul, artistBio.nextSibling);
			}

			if (artist.historyMilestones.length) {
				var table = document.createElement('table');
				var thead = document.createElement('thead');
				var tbody = document.createElement('tbody');
				var tr = document.createElement('tr');

				for (var heading of ["Date", "Action"]) {
					var th = document.createElement('th');
					var text = document.createElement(heading);

					th.appendChild(text);
					tr.appendChild(th);
				}
				thead.appendChild(tr);
				table.appendChild(thead);

				for (var milestone of artist.historyMilestones) {
					var tr = document.createElement('tr');
					var dateCell = document.createElement('td');
					var actionCell = document.createElement('td');

					tr.classList.add('metadata_unit', 'metadata_unit--table_row');

					var dateText = document.createTextNode(milestone.dateTo !== null ? `${milestone.dateFrom} \u2013 ${milestone.dateTo}` : milestone.dateFrom);
					var actionText = document.createTextNode(milestone.title);

					dateCell.appendChild(dateText);
					actionCell.appendChild(actionText);

					if (milestone.$link != null) {
						var actionLink = document.createElement('a');
						var spacer = document.createTextNode(' ');
						var actionLinkText = document.createTextNode(milestone.$link.name);

						actionLink.href = milestone.$link.path;

						actionLink.appendChild(actionLinkText);
						actionCell.appendChild(spacer);
						actionCell.appendChild(actionLink);
					}

					tr.appendChild(dateCell);
					tr.appendChild(actionCell);

					tbody.appendChild(tr);
				}
				table.appendChild(tbody);

				artistBio.parentNode.insertBefore(table, artistBio.nextSibling);
			}

			if (artist.youtube_name.length) {
				var socialMedia = document.querySelector('.u-text_center.u-vertical_margins');
				var youtubeBtn = document.createElement('a');
				var spacer = document.createTextNode('');
				var youtubeBtnText = document.createTextNode(artist.youtube_name);
				var xmlns = 'http://www.w3.org/2000/svg';
				var youtubeBtnIcon = document.createElementNS(xmlns, 'svg');
				var youtubeBtnIconPath = document.createElementNS(xmlns, 'path');

				youtubeBtnIcon.classList.add('inline_icon');
				youtubeBtnIcon.setAttributeNS(null, 'viewBox', '0 0 80 45');
				youtubeBtnIconPath.setAttributeNS(null, 'd', 'M 35.705078 0 C 35.705078 0 13.35386 0.0001149 7.765625 1.4707031 C 4.765625 2.2942325 2.2942325 4.7653952 1.4707031 7.8242188 C 0.0001149 13.412454 -2.9605947e-016 25 0 25 C 0 25 0.0001149 36.64637 1.4707031 42.175781 C 2.2942325 45.234605 4.7068015 47.647174 7.765625 48.470703 C 13.412684 50.000115 35.705078 50 35.705078 50 C 35.705078 50 58.058249 49.999885 63.646484 48.529297 C 66.705308 47.705767 69.117877 45.293199 69.941406 42.234375 C 71.411994 36.64614 71.412109 25.058594 71.412109 25.058594 C 71.412109 25.058594 71.470818 13.412454 69.941406 7.8242188 C 69.117877 4.7653952 66.705308 2.3528263 63.646484 1.5292969 C 58.058249 -0.000114879 35.705078 2.9605947e-016 35.705078 0 z M 28.587891 14.294922 L 47.175781 25 L 28.587891 35.705078 L 28.587891 14.294922 z ');

				Object.assign(youtubeBtn, {
					target: '_blank',
					href: `https://youtube.com/channel/${artist.youtube_name}`
				});
				youtubeBtn.classList.add('square_button', 'square_button--youtube', 'u-quarter_vertical_margins');

				youtubeBtnIcon.appendChild(youtubeBtnIconPath);
				youtubeBtn.appendChild(youtubeBtnIcon);
				youtubeBtn.appendChild(spacer);
				youtubeBtn.appendChild(youtubeBtnText);
				socialMedia.appendChild(youtubeBtn);
			}
		}
	});
});

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

function descriptionUI() {
	//if (pageData.artist_songs.length < 10 && pageData.artist_has_more_songs) {
		console.log(`/api${pageData.artist.api_path}`);
		loadMoreSongs(pageData.artist).then(function(songs) {
			var grouped = Promise.all(songs.map(function(song) {
				return loadSong(song);
			})).then(groupSongsByRole).then(renderSongsByRole);
		});
	//}
}
descriptionUI();

var setTabName = function(e) {
	var onClick = e.target.getAttribute('ng-click');
	var regExp = /\$ctrl\.change_state\('([a-z_]+)'\)/;
	tabName = onClick.match(regExp)[1];

	console.log('tabName', tabName);
	if (tabName === 'opportunities') {
		content = document.querySelector('[ng-switch-when="opportunities"]');
		renderFilterBar(content);
	} else if (tabName === 'description') {
		descriptionUI();
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

/* "Add a Song" feature */
var btnBar = document.querySelector('.profile_identity_and_description-action_row');
var addSongBtn = document.createElement('div');
var xmlns = 'http://www.w3.org/2000/svg';
var addBtnIcon = document.createElementNS(xmlns, 'svg');
var addBtnIconPath = document.createElementNS(xmlns, 'path');
var addBtnText = document.createTextNode('\tAdd a Song');

addBtnIcon.classList.add('inline_icon', 'inline_icon--reading_size', 'inline_icon--up_1');
addBtnIcon.setAttributeNS(null, 'viewBox', '0 0 448 512');
addBtnIconPath.setAttributeNS(null, 'd', 'M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z');
addSongBtn.classList.add('square_button');

addSongBtn.addEventListener('click', function(ev) {
	var newTab = window.open(`https://genius.com/new?artist=${pageData.artist.name}`, '_blank');
});

addBtnIcon.appendChild(addBtnIconPath);
addSongBtn.appendChild(addBtnIcon);
addSongBtn.appendChild(addBtnText);
btnBar.appendChild(addSongBtn);
