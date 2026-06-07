// Lighting Manager - Day/Dusk/Night (safe version)
var LightingManager = (function() {
  var viewer = null;
  var config = window.APP_CONFIG;
  var currentTOD = 'day';
  var isTransitioning = false;
  var transitionProgress = 0;
  var nightEntities = [];
  
  function init(v) {
    viewer = v;
    // Don't apply any preset during init - let Cesium use defaults
    currentTOD = 'day';
  }
  
  function setTimeOfDay(tod) {
    if (!viewer) return;
    currentTOD = tod;
    
    var preset = config.timeOfDay[tod];
    if (!preset) return;
    var scene = viewer.scene;
    if (!scene) return;
    
    try {
      // Only set light - safest property
      scene.light = new Cesium.SunLight({ intensity: preset.sunIntensity });
    } catch(e) {}
    
    // Fog - only if available
    try {
      if (!scene.fog) scene.fog = new Cesium.Fog();
      scene.fog.density = preset.fogDensity;
      scene.fog.enabled = true;
    } catch(e) {}
    
    // Atmosphere - only if it exists
    try {
      if (scene.skyAtmosphere) {
        scene.skyAtmosphere.brightnessShift = -0.2;
      }
    } catch(e) {}
    
    // Background color
    try {
      scene.backgroundColor = Cesium.Color.fromBytes(
        preset.skyColor[0] * 255,
        preset.skyColor[1] * 255,
        preset.skyColor[2] * 255
      );
    } catch(e) {}
    
    UIController.setActiveTOD(tod);
  }
  
  function update() {}
  
  return {
    init: init,
    setTimeOfDay: setTimeOfDay,
    update: update,
    getCurrentTOD: function() { return currentTOD; }
  };
})();
