function clearElement(elm) {
	while (elm.hasChildNodes()) {
		elm.removeChild(elm.lastChild);
	}
}

function logger(text, level) {
	console.log(`${(new Date()).toISOString()}`, text)
}

function getFromPath(obj, path) {
	return path.split('.').reduce(function(initialValue, iterator) {
		if (initialValue != null && initialValue[iterator] != null) {
			return initialValue[iterator];
		}
		else {
			console.error(`${iterator} does not exist in object`)
			return null;
		}
		return initialValue;
	}, obj);
}
