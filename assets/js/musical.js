var pageData = JSON.parse(document.querySelector('meta[itemprop="page_data"]').content);
if (pageData.song.tags.some(tag => tag.name === "Musicals")) {
	console.log("ROUTE:: song > Musicals");
	var styleSheet = document.createElement('style');
	document.head.appendChild(styleSheet);
	styleSheet.sheet.insertRule(".rolename { background-color: rebeccapurple; color: white; cursor: pointer; }");
	styleSheet.sheet.insertRule(".singer-hint { display: none; color: grey; font-weight: bold; font-style: italic; margin-left: 5px; }");
	styleSheet.sheet.insertRule(".rolename:hover + .singer-hint { display: inline-block; }");

	var lyricsEl = document.querySelector('.lyrics');
	var trackInfoEl = document.querySelector('defer-compile[use-initial-content-with-key="track_info"]');
	var roles = lyricsEl.querySelector('section > p')
	var roleRegExp = /\[(?!ALL|BOTH)([A-Z ]+)(, (?:spoken|sung))?\]/g;
	roles.innerHTML = roles.innerHTML.replace(roleRegExp, '<span class="rolename" data-rolename="$1">$&</span>');

	var lastClickedRole = null;
	function openRoleLinking(e) {
		var rolename = e.target.dataset.rolename;
		console.log('rolename', rolename);
		lastClickedRole = rolename;
	}

	var rolenameEls = document.getElementsByClassName('rolename');
	for (var el of rolenameEls) {
		el.addEventListener('click', openRoleLinking);
	}

	var singers = pageData.song.featured_artists;
	var roles = new Set([...pageData.lyrics_data.body.html.matchAll(roleRegExp)].map((match) => match[1]));
	var mapping = {};

	var castEl = document.createElement('div');
	var table = document.createElement('table');
	var caption = document.createElement('h3');
	var captionText = document.createTextNode(`"${pageData.song.title}" ${chrome.i18n.getMessage('cast')}`);
	var thead = document.createElement('thead');
	var headRow = document.createElement('tr');
	var singerHeader = document.createElement('th');
	var roleHeader = document.createElement('th');
	var singerHeaderText = document.createTextNode(chrome.i18n.getMessage('singer'));
	var roleHeaderText = document.createTextNode(chrome.i18n.getMessage('role'));
	var tbody = document.createElement('tbody');

	table.style.width = '100%';
	caption.classList.add('text_label', 'u-x_small_bottom_margin');

	function addRoleToSinger(singer, role) {
		mapping[singer] = role;

		tbody.querySelector(`[data-singer="${singer}"] > td:last-child`).innerHTML = role;
		var roleEls = lyricsEl.querySelectorAll(`.rolename[data-rolename="${role}"]`);
		var singerEl = document.createElement('span');
		console.log(singer, '=', role, mapping, `.rolename[data-rolename="${role}"]`, roleEls)

		var singerText = document.createTextNode(`= ${singer}`);
		singerEl.classList.add('singer-hint');

		singerEl.appendChild(singerText);
		for (var roleEl of roleEls) {
			// console.log(roleEl, roleEl.parentNode, singerEl, roleEl.nextSibling)
			roleEl.parentNode.insertBefore(singerEl.cloneNode(true), roleEl.nextSibling);
		}
	}

	for (var singer of singers) {
		var tr = document.createElement('tr');
		var singerCell = document.createElement('td');
		var roleCell = document.createElement('td');
		var roleAddBtn = document.createTextNode('+');
		var singerLink = document.createElement('a');
		var singerText = document.createTextNode(singer.name);

		tr.dataset.singer = singer.name;
		tr.style.display = 'table-row';
		tr.classList.add('metadata_unit', 'metadata_unit--table_row');
		singerLink.setAttribute('href', singer.url);
		singerCell.style.width = '50%';
		Object.assign(roleCell.style, {
			width: '50%',
			cursor: 'pointer',
		});

		roleCell.addEventListener('click', (e) => addRoleToSinger(e.target.parentElement.dataset.singer, lastClickedRole));

		singerLink.appendChild(singerText);
		singerCell.appendChild(singerLink);
		roleCell.appendChild(roleAddBtn);
		tr.appendChild(singerCell);
		tr.appendChild(roleCell);
		tbody.appendChild(tr);
	}

	singerHeader.appendChild(singerHeaderText);
	roleHeader.appendChild(roleHeaderText);
	headRow.appendChild(singerHeader);
	headRow.appendChild(roleHeader);
	thead.appendChild(headRow);
	table.appendChild(thead);
	table.appendChild(tbody);
	caption.appendChild(captionText);
	castEl.appendChild(caption);
	castEl.appendChild(table);
	trackInfoEl.parentNode.insertBefore(castEl, trackInfoEl);
}
