// Single monolithic app.js to eliminate load-order issues
(function() {
  'use strict';
  
  // ===== CONFIG =====
  var CONFIG = {
    cesiumIonToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwY2UxNmM3OS0xNzdkLTQzMTgtYjJlZC05MTA0MWVmYzMyYzIiLCJpZCI6NDQxMjk4LCJzdWIiOiJndW94dWFueXUiLCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoiVW50aXRsZWQiLCJpYXQiOjE3ODA4MzEzMjR9.ruySHM-n61Ex4Zp31OKZtcFwQUvEEcsrOONGg6n2NiA',
    google3DTilesAssetId: 2275207,
    centerLat: 31.2397,
    centerLon: 121.4998,
    buildings: [
      { id: 'shanghai-tower', name: '上海中心大厦', nameEn: 'Shanghai Tower', lat: 31.2355, lon: 121.5016, height: 632, year: 2015, desc: '632m, 128 floors. The tallest building in China and second-tallest in the world.' },
      { id: 'swfc', name: '环球金融中心', nameEn: 'Shanghai World Financial Center', lat: 31.2368, lon: 121.5012, height: 492, year: 2008, desc: '492m, 101 floors. Known for its distinctive trapezoid aperture.' },
      { id: 'jinmao', name: '金茂大厦', nameEn: 'Jin Mao Tower', lat: 31.2372, lon: 121.5014, height: 421, year: 1999, desc: '421m, 88 floors. Combines traditional Chinese design with modern architecture.' },
      { id: 'oriental-pearl', name: '东方明珠', nameEn: 'Oriental Pearl Tower', lat: 31.2397, lon: 121.4998, height: 468, year: 1995, desc: '468m TV tower. An iconic landmark of Shanghai skyline.' },
      { id: 'ifc', name: '国金中心', nameEn: 'Shanghai IFC', lat: 31.2379, lon: 121.5025, height: 260, year: 2010, desc: 'Premium office and retail complex in Lujiazui.' },
      { id: 'bund-center', name: '外滩中心', nameEn: 'Bund Center', lat: 31.2404, lon: 121.4898, height: 198, year: 2002, desc: '198m landmark on the Bund. Crown-shaped top.' }
    ],
    timeOfDay: {
      day:   { sunIntensity: 1.2, ambientIntensity: 0.3, skyColor: [0.53,0.81,0.98], fogDensity: 0.00002 },
      dusk:  { sunIntensity: 0.6, ambientIntensity: 0.15, skyColor: [0.95,0.55,0.25], fogDensity: 0.00005 },
      night: { sunIntensity: 0.0, ambientIntensity: 0.02, skyColor: [0.05,0.05,0.15], fogDensity: 0.00008 }
    }
  };
  
  // ===== DOM ELEMENTS =====
  var $ = function(id) { return document.getElementById(id); };
  var els = {
    loadingScreen: $('loadingScreen'),
    loadingBarFill: $('loadingBarFill'),
    loadingPercent: $('loadingPercent'),
    searchInput: $('searchInput'),
    searchResults: $('searchResults'),
    coordLat: $('coordLat'),
    coordLon: $('coordLon'),
    coordAlt: $('coordAlt'),
    todBtns: document.querySelectorAll('#todToggle .tod-btn'),
    buildingInfoCard: $('buildingInfoCard'),
    infoName: $('infoName'),
    infoHeight: $('infoHeight'),
    infoYear: $('infoYear'),
    infoDesc: $('infoDesc'),
    closeInfoCard: $('closeInfoCard'),
    errorBanner: $('errorBanner')
  };
  
  // Error display helper
  function showError(msg) {
    console.error(msg);
    if (els.errorBanner) {
      els.errorBanner.style.display = 'block';
      els.errorBanner.textContent = 'Error: ' + msg;
    }
  }
  
  // ===== LOADING =====
  function updateLoading(pct) {
    if (els.loadingBarFill) els.loadingBarFill.style.width = pct + '%';
    if (els.loadingPercent) els.loadingPercent.textContent = Math.round(pct) + '%';
  }
  function hideLoading() {
    if (els.loadingScreen) els.loadingScreen.classList.add('hidden');
  }
  
  // ===== CESIUM VIEWER =====
  var viewer = null;
  var tileset = null;
  
  function initViewer() {
    console.log('Cesium version:', Cesium.VERSION);
    
    Cesium.Ion.defaultAccessToken = CONFIG.cesiumIonToken;
    
    viewer = new Cesium.Viewer('cesiumContainer', {
      animation: false, timeline: false,
      baseLayerPicker: false, fullscreenButton: false,
      homeButton: false, geocoder: false,
      sceneModePicker: false, navigationHelpButton: false,
      infoBox: false, selectionIndicator: false, vrButton: false,
      sceneMode: Cesium.SceneMode.SCENE3D
    });
    
    console.log('Viewer created');
    
    // Track render errors
    viewer.scene.renderError.addEventListener(function(err) {
      showError('Cesium render error: ' + err);
    });
    
    // Set camera to Lujiazui
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(CONFIG.centerLon - 0.01, CONFIG.centerLat, 3000),
      orientation: { heading: Cesium.Math.toRadians(90), pitch: Cesium.Math.toRadians(-30), roll: 0 }
    });
    
    console.log('Camera set');
    
    // Load 3D Tiles after delay
    updateLoading(5);
    setTimeout(loadTiles, 1000);
    
    // Coordinate display
    setInterval(updateCoords, 200);
    
    return viewer;
  }
  
  function loadTiles() {
    try {
      tileset = viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
          url: Cesium.IonResource.fromAssetId(CONFIG.google3DTilesAssetId),
          maximumScreenSpaceError: 16,
          maximumMemoryUsage: 512,
          skipLevelOfDetail: true,
          show: true
        })
      );
      
      var loaded = 0;
      tileset.tileLoad.addEventListener(function() {
        loaded++;
        updateLoading(Math.min(10 + loaded * 0.5, 95));
      });
      
      tileset.readyPromise.then(function() {
        console.log('3D Tiles ready');
        updateLoading(60);
      }).otherwise(function(e) {
        console.warn('3D Tiles unavailable:', e);
        updateLoading(100);
        setTimeout(hideLoading, 500);
      });
      
      tileset.allTilesLoaded.addEventListener(function() {
        updateLoading(100);
        setTimeout(hideLoading, 500);
      });
      
    } catch(e) {
      console.warn('Tileset creation failed:', e);
      updateLoading(100);
      setTimeout(hideLoading, 500);
    }
    
    // Safety timeout
    setTimeout(function() {
      if (els.loadingScreen && !els.loadingScreen.classList.contains('hidden')) {
        hideLoading();
      }
    }, 20000);
  }
  
  // ===== CAMERA & COORDS =====
  function updateCoords() {
    if (!viewer) return;
    var c = Cesium.Cartographic.fromCartesian(viewer.camera.position);
    if (els.coordLat) els.coordLat.textContent = Cesium.Math.toDegrees(c.latitude).toFixed(6) + '\u00b0N';
    if (els.coordLon) els.coordLon.textContent = Cesium.Math.toDegrees(c.longitude).toFixed(6) + '\u00b0E';
    if (els.coordAlt) els.coordAlt.textContent = (c.height / 1000).toFixed(2) + ' km';
  }
  
  // ===== TIME OF DAY =====
  function initTOD() {
    els.todBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var tod = this.getAttribute('data-tod');
        els.todBtns.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        applyTOD(tod);
      });
    });
  }
  
  function applyTOD(tod) {
    if (!viewer) return;
    var preset = CONFIG.timeOfDay[tod];
    if (!preset) return;
    var s = viewer.scene;
    
    // Light intensity
    try {
      s.light = new Cesium.SunLight({ intensity: preset.sunIntensity });
    } catch(e) {}
    
    // Background / sky color
    try {
      s.backgroundColor = Cesium.Color.fromBytes(
        Math.round(preset.skyColor[0] * 255),
        Math.round(preset.skyColor[1] * 255),
        Math.round(preset.skyColor[2] * 255)
      );
    } catch(e) {}
    
    // Fog
    try {
      if (!s.fog) s.fog = new Cesium.Fog();
      s.fog.density = preset.fogDensity;
      s.fog.enabled = true;
    } catch(e) {}
    
    // Globe base color tint for night effect
    try {
      if (tod === 'night') {
        s.globe.baseColor = Cesium.Color.fromBytes(20, 20, 50, 180);
      } else if (tod === 'dusk') {
        s.globe.baseColor = Cesium.Color.WHITE;
      } else {
        s.globe.baseColor = Cesium.Color.WHITE;
      }
    } catch(e) {}
    
    // Atmosphere brightness
    try {
      if (s.skyAtmosphere) {
        if (tod === 'night') {
          s.skyAtmosphere.brightnessShift = -0.6;
          s.skyAtmosphere.hueShift = 0.1;
        } else if (tod === 'dusk') {
          s.skyAtmosphere.brightnessShift = -0.3;
          s.skyAtmosphere.hueShift = -0.05;
        } else {
          s.skyAtmosphere.brightnessShift = -0.15;
          s.skyAtmosphere.hueShift = 0;
        }
      } else {
        // Create atmosphere if it doesn't exist
        try { s.skyAtmosphere = new Cesium.SkyAtmosphere(); } catch(e2) {}
      }
    } catch(e) {}
    
    // Globe translucency for night
    try {
      if (!s.globe.translucency) s.globe.translucency = new Cesium.Translucency();
      s.globe.translucency.enabled = true;
      if (tod === 'night') {
        s.globe.translucency.frontFaceAlpha = 0.85;
      } else {
        s.globe.translucency.frontFaceAlpha = 1.0;
      }
    } catch(e) {}
    
    console.log('TOD applied: ' + tod);
  }
  
  // ===== SEARCH =====
  function initSearch() {
    if (!els.searchInput) return;
    
    els.searchInput.addEventListener('input', function() {
      var q = this.value.trim().toLowerCase();
      if (!els.searchResults) return;
      
      if (q.length < 1) {
        els.searchResults.classList.remove('visible');
        els.searchResults.innerHTML = '';
        return;
      }
      
      var matches = CONFIG.buildings.filter(function(b) {
        return b.name.indexOf(q) !== -1 || b.nameEn.toLowerCase().indexOf(q) !== -1;
      });
      
      els.searchResults.innerHTML = matches.map(function(b) {
        return '<div class="search-result-item" data-id="' + b.id + '">' +
          '<div class="result-name">' + b.name + '</div>' +
          '<div class="result-sub">' + b.nameEn + ' &middot; ' + b.height + 'm</div></div>';
      }).join('') || '<div class="search-result-item" style="color:rgba(255,255,255,0.3)">No results</div>';
      
      els.searchResults.classList.add('visible');
      
      els.searchResults.querySelectorAll('.search-result-item[data-id]').forEach(function(item) {
        item.addEventListener('click', function() {
          els.searchResults.classList.remove('visible');
          els.searchInput.value = '';
          flyToBuilding(item.getAttribute('data-id'));
        });
      });
    });
    
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.search-box') && els.searchResults) {
        els.searchResults.classList.remove('visible');
      }
    });
  }
  
  function flyToBuilding(id) {
    var b = CONFIG.buildings.find(function(x) { return x.id === id; });
    if (!b || !viewer) return;
    
    showBuildingInfo(b);
    
    var target = Cesium.Cartesian3.fromDegrees(b.lon, b.lat, b.height * 0.6);
    var start = viewer.camera.position.clone();
    var t0 = Date.now();
    
    function anim() {
      var t = Math.min((Date.now() - t0) / 1500, 1);
      t = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
      viewer.camera.setView({
        destination: Cesium.Cartesian3.lerp(start, target, t, new Cesium.Cartesian3()),
        orientation: { heading: viewer.camera.heading, pitch: viewer.camera.pitch, roll: 0 }
      });
      if (t < 1) requestAnimationFrame(anim);
    }
    requestAnimationFrame(anim);
  }
  
  // ===== BUILDING INFO =====
  function showBuildingInfo(b) {
    if (!els.buildingInfoCard) return;
    els.infoName.textContent = b.name;
    els.infoHeight.textContent = b.height + ' m';
    els.infoYear.textContent = b.year;
    els.infoDesc.textContent = b.desc;
    els.buildingInfoCard.classList.add('visible');
  }
  
  function hideBuildingInfo() {
    if (els.buildingInfoCard) els.buildingInfoCard.classList.remove('visible');
  }
  
  function initBuildingInfo() {
    if (els.closeInfoCard) els.closeInfoCard.addEventListener('click', hideBuildingInfo);
  }
  
  // ===== DOUBLE CLICK =====
  function initDoubleClick() {
    try {
      new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas).setInputAction(function(click) {
        var pos = viewer.scene.pickPosition(click.position);
        if (!Cesium.defined(pos)) return;
        var c = Cesium.Cartographic.fromCartesian(pos);
        flyToNearestBuilding(Cesium.Math.toDegrees(c.latitude), Cesium.Math.toDegrees(c.longitude));
      }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    } catch(e) {}
  }
  
  function flyToNearestBuilding(lat, lon) {
    var nearest = null, best = Infinity;
    CONFIG.buildings.forEach(function(b) {
      var d = Math.sqrt(Math.pow((b.lat-lat)*111320,2) + Math.pow((b.lon-lon)*111320*Math.cos(lat*Math.PI/180),2));
      if (d < 200 && d < best) { best = d; nearest = b; }
    });
    if (nearest) flyToBuilding(nearest.id);
  }
  
  // ===== POST PROCESSING =====
  function initPostProcessing() {
    if (!viewer || !viewer.scene) return;
    try {
      if (Cesium.PostProcessStageLibrary) {
        var bloom = Cesium.PostProcessStageLibrary.createBloomStage();
        if (bloom) {
          bloom.uniforms.contrast = 128;
          bloom.uniforms.brightness = 0;
          viewer.scene.postProcessStages.add(bloom);
        }
      }
    } catch(e) { console.warn('Bloom unavailable'); }
  }
  
  // ===== CAMERA FLY-IN =====
  function startFlyIn() {
    var startAlt = 4000, endAlt = 1800;
    var duration = 5000, t0 = Date.now();
    var startLon = CONFIG.centerLon - 0.012;
    
    function anim() {
      var t = Math.min((Date.now() - t0) / duration, 1);
      t = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
      
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(startLon + 0.012*t, CONFIG.centerLat, startAlt + (endAlt - startAlt) * t),
        orientation: { heading: Cesium.Math.toRadians(90 + t*40), pitch: Cesium.Math.toRadians(-35 + t*12), roll: 0 }
      });
      
      if (t < 1) requestAnimationFrame(anim);
    }
    requestAnimationFrame(anim);
  }
  
  // ===== MAIN INIT =====
  console.log('App starting...');
  
  try { initViewer(); } catch(e) { showError('Viewer init: ' + e.message); return; }
  
  // Init features one at a time with error catching
  try { initTOD(); } catch(e) { showError('TOD init: ' + e.message); }
  try { initSearch(); } catch(e) { showError('Search init: ' + e.message); }
  try { initBuildingInfo(); } catch(e) { showError('Info init: ' + e.message); }
  try { initDoubleClick(); } catch(e) { showError('DblClick init: ' + e.message); }
  try { initPostProcessing(); } catch(e) { showError('PostProc init: ' + e.message); }
  try { startFlyIn(); } catch(e) { showError('FlyIn init: ' + e.message); }
  
  console.log('App ready!');
})();
