var cacheName = 'subway';
var filesToCache = [
	'/',
	'index.html'
];

self.addEventListener('install', function(e) {
	console.log('service worker install');
	e.waitUtill(caches.open(cacheName).then(function(cache) {
		console.log('serviceworker caching app shell');
		return cache.addAll(filesToCache);
	}));
});

self.addEventListener('activate', function(e) {
	console.log('serviceworker activate');
	e.waitUtill(
		caches.keys().then(function(keyList) {
			return Promise.all(keyList.map(function(key) {
				console.log('serviceworker removing old cache ' + key);
				if (key !== cacheName) {
					return caches.delete(key);
				}
			}))
		}))
});

self.addEventListener('fetch', function(e) {
	console.log('serviceworker fetch', e.request.url);
	e.respondWith(fetch(e.request).
		then(function (response) {
			return caches.open(cacheName).
				then(function(cache) {
					cache.put(e.request.url, response.clone());
					console.log('serviceworker fetched and cached data');
					return response;
				});
		}));
});