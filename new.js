console.log("ROUTE:: new")
var searchParams = new URLSearchParams(document.location.search);

async function getTags() {
	var req = await fetch('/api/tags/home');
	return req.json();
}

async function searchTag(tag) {
	var req = await fetch(`/api/tags/autocomplete?q=${tag}`);
	return req.json();
}

if (searchParams.has('artist')) {
	var artistEl = document.getElementById('song_primary_artist');
	var event = new Event('change');
	artistEl.value = searchParams.get('artist');
	artistEl.dispatchEvent(event);
}

if (searchParams.has('defaultGenre')) {
	var defaultGenre = searchParams.get('defaultGenre').split('.');

	getTags().then(function(result) {
		if (defaultGenre[1] === "non-music") {
			var tag = result.response.tags.find((tag) => /https:\/\/genius\.com\/tags\/non-music/.test(tag.url));
		} else {
			var tag = result.response.tags.find((tag) => new RegExp(`https:\/\/genius\.com\/tags\/${defaultGenre[2]}`).test(tag.url));
		}
		document.getElementById(`song_primary_tag_id_${tag.id}`).checked = true;
	});

	var tagSelect = document.getElementById('tag_ids');

	if (defaultGenre.length > 3) {
		for (var genre of defaultGenre.slice(3)) {
			searchTag(genre).then(function(result) {
				if (result.response.tags.length) {
					console.log(result.response.tags[0], tagSelect)
					tagSelect.querySelector(`[value="${result.response.tags[0].id}"]`).selected = true;
					// <li class="search-choice" id="tag_ids_chzn_c_1"><span>Electro</span><a href="javascript:void(0)" class="search-choice-close" rel="1"></a></li>
					var event = new Event('change');
					tagSelect.dispatchEvent(event);
				}
			});
		}
	}
}
