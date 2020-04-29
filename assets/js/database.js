class Database {
	db;

	constructor() {
		var request = indexedDB.open('geniusly', 1);
		request.onupgradeneeded = function(){
			console.log('Database created', this, arguments);
			var db = this.result;
			if(!db.objectStoreNames.contains('artists')){
				var store = db.createObjectStore('artists', {
					keyPath: 'id',
					autoIncrement: true
				});
				store.createIndex("geniusId", "geniusId", { unique: true });
			}
		};

		var promise = new Promise((resolve, reject) => {
			var successHandler = function(ev) {
				this.db = ev.target.result;
				resolve(this);
				console.log('Database opened', db);
			};

			request.onsuccess = successHandler.bind(this);
		});

		return promise;
	}

	insert(table, item) {
		console.log("insert", item, this)
		var trans = this.db.transaction([table], 'readwrite');
		var store = trans.objectStore(table);
		var request = store.put(item); // `item` in dem Store ablegen

		// Erfolgs-Event
		request.onsuccess = function(evt){
			console.log('Entry ' + evt.target.result + ' saved');

		};
	}

	getId(id) {
		return new Promise((resolve, reject) => {
			var trans = this.db.transaction(['artists'], 'readonly');
			var store = trans.objectStore('artists');
			var index = store.index('geniusId');
			var get = index.get(id);
			get.onsuccess = function(entry) {
				resolve(entry.target.result);
			};
		})
	}
}