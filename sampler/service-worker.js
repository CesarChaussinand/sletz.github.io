
const CACHE_NAME = 'sampler-static'; // Cache name without versioning

const POLY_EFFECT_RESOURCES = [
    '/sampler/',
    '/sampler/faust-ui/index.js',
    '/sampler/faust-ui/index.css',
    '/sampler/faustwasm/index.js',
    '/sampler/sampler.js',
    '/sampler/sampler.wasm',
    '/sampler/sampler.json',
    '/sampler/mixerModule.wasm',
    '/sampler/sampler_effect.wasm',
    '/sampler/sampler_effect.json',
];

const POLY_RESOURCES = [
    '/sampler/',
    '/sampler/faust-ui/index.js',
    '/sampler/faust-ui/index.css',
    '/sampler/faustwasm/index.js',
    '/sampler/sampler.js',
    '/sampler/sampler.wasm',
    '/sampler/sampler.json',
    '/sampler/mixerModule.wasm',
];

/**
 * Install the service worker and cache the resources
 
 */
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Service worker installed");
            const urlToCheck = '/sampler/sampler_effect.json';
            return fetchResourceAndCache(cache, urlToCheck);
        })
    );
});

/**
 * Fetch the resources and cache them
 * 
 * @param {Cache} cache The cache to store the resources
 * @param {string} urlToCheck The URL of the resource to fetch
 * 
 * @returns {Promise<void>} A promise that resolves when the resource is fetched and cached
 */

function fetchResourceAndCache(cache, urlToCheck) {
    return fetch(urlToCheck).then(response => {
        if (response.ok) {
            return cacheResources(cache, POLY_EFFECT_RESOURCES);
        } else {
            return cacheResources(cache, POLY_RESOURCES);
        }
    }).catch(fetchError => {
        console.error(`Failed to fetch ${urlToCheck}:`, fetchError);
    });
}
/**
 * 
 * @param {*} cache The cache to store the resources
 * @param {*} resources The resources to cache
 * @returns 
 */
function cacheResources(cache, resources) {
    return cache.addAll(resources).catch(error => {
        console.error('Failed to cache resources:', error);
    });
}

self.addEventListener("activate", event => {
    console.log("Service worker activated");
});

self.addEventListener('fetch', event => {
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
            return cachedResponse;
        } else {
            try {
                const fetchResponse = await fetch(event.request);
                // Ensure the response is valid before caching it
                if (event.request.method === 'GET' && fetchResponse && fetchResponse.status === 200 && fetchResponse.type === 'basic') {
                    cache.put(event.request, fetchResponse.clone());
                }
                return fetchResponse;
            } catch (e) {
                // Network access failure
                console.log('Network access error', e);
            }
        }
    })());
});