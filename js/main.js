// Main Entry Point - Safe version
(function() {
  'use strict';
  
  console.log('Lujiazui Digital Twin - Starting...');
  
  var viewer = CesiumViewer.init();
  if (!viewer) {
    document.getElementById('loadingScreen').innerHTML =
      '<div style="color:#fff;text-align:center;padding-top:35vh;font-family:sans-serif">' +
      '<h2>Unable to initialize 3D view</h2>' +
      '<p>Please check WebGL support in your browser.</p></div>';
    return;
  }
  
  // Init UI only
  UIController.initTODButtons(function(tod) {
    console.log('TOD changed:', tod);
  });
  
  UIController.initSearch(function(id) {
    var b = window.APP_CONFIG.buildings.find(function(x) { return x.id === id; });
    if (b) {
      UIController.showInfoCard(b);
      CameraController.flyToBuilding(b.lat, b.lon, b.height);
    }
  });
  
  UIController.initInfoCard(function() {});
  
  // Try to init optional modules
  try { LightingManager.init(viewer); } catch(e) {}
  try { RiverEffect.init(viewer); } catch(e) {}
  try { PostProcessing.init(viewer); } catch(e) {}
  try { CameraController.init(viewer); } catch(e) {}
  try { BuildingInteraction.init(viewer); } catch(e) {}
  
  // Render loop
  function loop() {
    try {
      CameraController.update();
      LightingManager.update();
      RiverEffect.update();
      PostProcessing.update();
    } catch(e) {}
    
    if (viewer && viewer.scene) {
      viewer.scene.requestRender();
    }
    requestAnimationFrame(loop);
  }
  
  requestAnimationFrame(loop);
  
  document.addEventListener('keydown', function(e) {
    if (e.key === ' ' && typeof CameraController !== 'undefined' && CameraController.isIntroPlaying()) {
      e.preventDefault();
      CameraController.skipIntro();
    }
  });
  
  console.log('Lujiazui Digital Twin - Ready');
})();
