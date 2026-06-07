// UI Controller - Handles all UI interactions
var UIController = (function() {
  var config = window.APP_CONFIG;
  
  // DOM cache
  var els = {};
  function cache() {
    els.loadingScreen = document.getElementById('loadingScreen');
    els.loadingBarFill = document.getElementById('loadingBarFill');
    els.loadingPercent = document.getElementById('loadingPercent');
    els.searchInput = document.getElementById('searchInput');
    els.searchResults = document.getElementById('searchResults');
    els.coordLat = document.getElementById('coordLat');
    els.coordLon = document.getElementById('coordLon');
    els.coordAlt = document.getElementById('coordAlt');
    els.todBtns = document.querySelectorAll('#todToggle .tod-btn');
    els.buildingInfoCard = document.getElementById('buildingInfoCard');
    els.infoName = document.getElementById('infoName');
    els.infoHeight = document.getElementById('infoHeight');
    els.infoYear = document.getElementById('infoYear');
    els.infoDesc = document.getElementById('infoDesc');
    els.closeInfoCard = document.getElementById('closeInfoCard');
  }
  
  // ----- Loading Screen -----
  function updateLoading(percent) {
    if (els.loadingBarFill) {
      els.loadingBarFill.style.width = percent + '%';
      els.loadingPercent.textContent = Math.round(percent) + '%';
    }
  }
  
  function hideLoading() {
    if (els.loadingScreen) {
      els.loadingScreen.classList.add('hidden');
    }
  }
  
  // ----- Coordinate Display -----
  function updateCoords(lat, lon, alt) {
    if (els.coordLat) {
      els.coordLat.textContent = lat.toFixed(6) + '\u00b0N';
      els.coordLon.textContent = lon.toFixed(6) + '\u00b0E';
      els.coordAlt.textContent = (alt / 1000).toFixed(2) + ' km';
    }
  }
  
  // ----- Time-of-Day Toggle -----
  var todCallback = null;
  
  function initTODButtons(onChange) {
    todCallback = onChange;
    els.todBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var tod = this.getAttribute('data-tod');
        setActiveTOD(tod);
        if (todCallback) todCallback(tod);
      });
    });
  }
  
  function setActiveTOD(tod) {
    els.todBtns.forEach(function(b) {
      b.classList.toggle('active', b.getAttribute('data-tod') === tod);
    });
  }
  
  // ----- Search -----
  var searchCallback = null;
  
  function initSearch(onSelect) {
    searchCallback = onSelect;
    
    if (els.searchInput) {
      els.searchInput.addEventListener('input', function() {
        var query = this.value.trim().toLowerCase();
        updateSearchResults(query);
      });
      
      els.searchInput.addEventListener('focus', function() {
        updateSearchResults(this.value.trim().toLowerCase());
      });
      
      // Close on outside click
      document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-box')) {
          if (els.searchResults) els.searchResults.classList.remove('visible');
        }
      });
    }
  }
  
  function updateSearchResults(query) {
    if (!els.searchResults) return;
    
    if (!query || query.length < 1) {
      els.searchResults.classList.remove('visible');
      els.searchResults.innerHTML = '';
      return;
    }
    
    var results = config.buildings.filter(function(b) {
      return b.name.indexOf(query) !== -1 ||
             b.nameEn.toLowerCase().indexOf(query) !== -1;
    });
    
    if (results.length === 0) {
      els.searchResults.innerHTML = '<div class="search-result-item" style="color:rgba(255,255,255,0.3)">No results</div>';
      els.searchResults.classList.add('visible');
      return;
    }
    
    els.searchResults.innerHTML = results.map(function(b) {
      return '<div class="search-result-item" data-id="' + b.id + '">' +
             '<div class="result-name">' + b.name + '</div>' +
             '<div class="result-sub">' + b.nameEn + ' &middot; ' + b.height + 'm</div>' +
             '</div>';
    }).join('');
    
    els.searchResults.classList.add('visible');
    
    // Click handlers
    els.searchResults.querySelectorAll('.search-result-item').forEach(function(item) {
      if (!item.getAttribute('data-id')) return;
      item.addEventListener('click', function() {
        els.searchResults.classList.remove('visible');
        els.searchInput.value = '';
        if (searchCallback) searchCallback(item.getAttribute('data-id'));
      });
    });
  }
  
  // ----- Building Info Card -----
  var closeInfoCallback = null;
  
  function initInfoCard(onClose) {
    closeInfoCallback = onClose;
    if (els.closeInfoCard) {
      els.closeInfoCard.addEventListener('click', hideInfoCard);
    }
  }
  
  function showInfoCard(building) {
    if (!els.buildingInfoCard) return;
    els.infoName.textContent = building.name;
    els.infoHeight.textContent = building.height + ' m';
    els.infoYear.textContent = building.year;
    els.infoDesc.textContent = building.desc;
    els.buildingInfoCard.classList.add('visible');
  }
  
  function hideInfoCard() {
    if (els.buildingInfoCard) {
      els.buildingInfoCard.classList.remove('visible');
    }
    if (closeInfoCallback) closeInfoCallback();
  }
  
  // ----- Transition Overlay -----
  function showTransition(duration) {
    var overlay = document.getElementById('transitionOverlay');
    if (!overlay) return;
    overlay.classList.add('active');
    setTimeout(function() {
      overlay.classList.remove('active');
    }, duration || 1500);
  }
  
  // Initialize
  cache();
  
  return {
    updateLoading: updateLoading,
    hideLoading: hideLoading,
    updateCoords: updateCoords,
    initTODButtons: initTODButtons,
    setActiveTOD: setActiveTOD,
    initSearch: initSearch,
    initInfoCard: initInfoCard,
    showInfoCard: showInfoCard,
    hideInfoCard: hideInfoCard,
    showTransition: showTransition,
    getElement: function(id) { return document.getElementById(id); }
  };
})();
