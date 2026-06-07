// Cesium Viewer - Minimal safe setup
var CesiumViewer = (function() {
  var viewer = null;
  var tileset = null;
  var config = window.APP_CONFIG;
  
  function init() {
    Cesium.Ion.defaultAccessToken = config.cesiumIonToken;
    
    try {
      viewer = new Cesium.Viewer('cesiumContainer', {
        animation: false,
        timeline: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        homeButton: false,
        geocoder: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        infoBox: false,
        selectionIndicator: false,
        vrButton: false,
        sceneMode: Cesium.SceneMode.SCENE3D,
        // Let everything else use defaults to avoid API issues
      });
    } catch(e) {
      console.error('Viewer creation failed:', e);
      return null;
    }
    
    var scene = viewer.scene;
    
    // Simple lighting - only what's known safe
    scene.globe.enableLighting = true;
    
    // Camera to Lujiazui
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(
        config.centerLon - 0.01, config.centerLat, 3000
      ),
      orientation: {
        heading: Cesium.Math.toRadians(90),
        pitch: Cesium.Math.toRadians(-30),
        roll: 0
      }
    });
    
    // Remove Cesium branding credit
    try {
      var creditEl = viewer._cesiumWidget._creditContainer;
      if (creditEl) creditEl.style.display = 'none';
    } catch(e) {}
    
    // Track render errors
    scene.renderError.addEventListener(function(err) {
      console.error('Cesium render error:', err);
    });
    
    // Load 3D Tiles after a short delay
    setTimeout(loadTiles, 1000);
    
    return viewer;
  }
  
  function loadTiles() {
    UIController.updateLoading(5);
    
    try {
      tileset = viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
          url: Cesium.IonResource.fromAssetId(config.google3DTilesAssetId),
          maximumScreenSpaceError: 16,
          maximumMemoryUsage: 512,
          skipLevelOfDetail: true,
          show: true
        })
      );
      
      tileset.readyPromise.then(function() {
        UIController.updateLoading(50);
      }).otherwise(function(err) {
        console.warn('3D Tiles unavailable:', err);
        UIController.updateLoading(100);
        setTimeout(function() { UIController.hideLoading(); }, 500);
      });
      
      var loaded = 0;
      tileset.tileLoad.addEventListener(function() {
        loaded++;
        UIController.updateLoading(Math.min(50 + loaded, 95));
      });
      
      tileset.allTilesLoaded.addEventListener(function() {
        UIController.updateLoading(100);
        setTimeout(function() { UIController.hideLoading(); }, 500);
      });
      
    } catch(e) {
      console.warn('Tileset creation failed:', e);
      UIController.hideLoading();
    }
    
    // Safety timeout
    setTimeout(function() {
      UIController.hideLoading();
    }, 20000);
  }
  
  return {
    init: init,
    getViewer: function() { return viewer; },
    getTileset: function() { return tileset; }
  };
})();
