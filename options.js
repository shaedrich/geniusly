document.addEventListener("DOMContentLoaded", function(event) {
	//do work
	router = new Router({
		el: document.querySelector("main"),
		defaultRoute: "options",
	});

	routeEls = document.querySelectorAll('[data-route]')
	gotoRoute = (e) => location.hash = `#/${e.target.dataset.route}`;
	for (var el of routeEls) {
		el.addEventListener('click', gotoRoute);
	}
});
