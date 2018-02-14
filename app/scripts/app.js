/*
Challenge:

Use what you've learned about Promises to request thumbnails in parallel but create them in the
proper order even if all the requests haven't finished.
 */

// Inline configuration for jshint below. Prevents `gulp jshint` from failing with quiz starter code.
/* jshint unused: false */

(function(document) {
  'use strict';

  var home = null;

  /**
   * Helper function to show the search query.
   * @param {String} query - The search query.
   */
  function addSearchHeader(query) {
    home.innerHTML = '<h2 class="page-title">query: ' + query + '</h2>';
  }

  /**
   * Helper function to create a planet thumbnail.
   * @param  {Object} data - The raw data describing the planet.
   */
  function createPlanetThumb(data) {
    return new Promise(function(resolve) {
      var pT = document.createElement('planet-thumb');
      for (var d in data) {
        pT[d] = data[d];
      }
      home.appendChild(pT);
      console.log('rendered: ' + data.pl_name);
      resolve();
    });
  }

  /**
   * XHR wrapped in a promise
   * @param  {String} url - The URL to fetch.
   * @return {Promise}    - A Promise that resolves when the XHR succeeds and fails otherwise.
   */
  function get(url) {
    return fetch(url);
  }

  /**
   * Performs an XHR for a JSON and returns a parsed JSON response.
   * @param  {String} url - The JSON URL to fetch.
   * @return {Promise}    - A promise that passes the parsed JSON response.
   */
  function getJSON(url) {
    console.log('sent: ' + url);
    return get(url).then(function(response) {
      // For testing purposes, I'm making sure that the urls don't return in order
      if (url === 'data/planets/Kepler-62f.json') {
        return new Promise(function(resolve) {
          setTimeout(function() {
            console.log('received: ' + url);
            resolve(response.json());
          }, 500);
        });
      } else {
        console.log('received: ' + url);
        return response.json();
      }
    });
  }

  window.addEventListener('WebComponentsReady', function() {
    home = document.querySelector('section[data-route="home"]');
    /*
    Your code goes here!
     */
    getJSON('../data/earth-like-results.json')
      // .then(function(response) {
      //   addSearchHeader(response.query);

      //   Promise.all(response.results.map(getJSON))
      //     .then(function(planets) {
      //       var seq = Promise.resolve();

      //       planets.forEach(function(planet) {
      //         seq = seq.then(function() {
      //           createPlanetThumb(planet);
      //         });
      //       });
      //     });
      // });
      .then(function(response) {
        addSearchHeader(response.query);
        return response;
      })
      .then(function(response) {
        var seq = Promise.resolve();

        var arrayOfPromises = response.results.map(getJSON);

        arrayOfPromises.forEach(function(promise)  {
          seq = seq.then(function() {
            return promise.then(createPlanetThumb);
          });
        });
      });
  });
})(document);
