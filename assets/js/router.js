class Router {
	el = null;
	routes = {
		privacy: {
			title: "Privacy",
			text: `No personal data is collected.\n\nDo not track option is ${!!+navigator.doNotTrack ? 'on' : 'off'}`,
		},
		options: {
			title: "Options",
			file: "options.html",
		}
	};
	defaultRoute = "options";

	constructor({ el, defaultRoute }) {
		this.el = el;
		if (defaultRoute != null) {
			this.defaultRoute = defaultRoute;
		}
		window.addEventListener("hashchange", this.onHashChange.bind(this), false);
		this.serveRoute(location.hash.startsWith("#/") && location.hash.length > 2 ? location.hash.slice(2) : this.defaultRoute);
	}

	onHashChange(e) {
		var hash = location.hash.slice(1);
		if (hash.startsWith('/')) {
			this.serveRoute(hash.slice(1));
		}
	}

	async serveRoute(route) {
		logger(`Router.serveRoute() :::: "${route}"`)
		if (this.routes[route] == null) {
			throw ReferenceError(`Route "${route}" not found in routes`);
		}
		clearElement(this.el);
		var routeObj = this.routes[route];
		var titleEl = document.createElement('h1');
		var titleText = document.createTextNode(routeObj.title);
		var contentEl = document.createElement('div');
		if (routeObj.file != null) {
			var res = await fetch(`routes/${routeObj.file}`);
			routeObj.text = await res.text();
		}
		contentEl.innerHTML = routeObj.text;
		titleEl.appendChild(titleText);
		this.el.appendChild(titleEl);
		this.el.appendChild(contentEl);
	}
}
