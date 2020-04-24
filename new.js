console.log("ROUTE:: new")
var searchParams = new URLSearchParams(document.location.search);

if (searchParams.has('artist')) {
	var artistEl = document.getElementById('song_primary_artist');
	var event = new Event('change');
	artistEl.value = searchParams.get('artist');
	artistEl.dispatchEvent(event);
}
