// Building Interaction - Click detection and info cards
var BuildingInteraction = (function() {
  var viewer = null;
  var config = window.APP_CONFIG;
  var clickHandler = null;
  var activeInfoCard = null;
  
  function init(viewerInstance) {
    viewer = viewerInstance;
    setupClickHandler();
    
    // Wire up UI callbacks
    UIController.initInfoCard(onInfoCardClose);
    UIController.initSearch(onSearchSelect);
  }
  
  function setupClickHandler() {
    clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    
    clickHandler.setInputAction(function(click) {
      if (CameraController.isIntroPlaying()) return;
      
      var picked = viewer.scene.pick(click.position);
      
      if (Cesium.defined(picked) && picked.primitive) {
        // Get the world position of the click
        var cartesian = viewer.scene.pickPosition(click.position);
        if (!Cesium.defined(cartesian)) {
          // Try globe pick (terrain)
          cartesian = viewer.scene.globe.pick(
            viewer.camera.getPickRay(click.position),
            viewer.scene
          );
        }
        
        if (Cesium.defined(cartesian)) {
          var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          var lat = Cesium.Math.toDegrees(cartographic.latitude);
          var lon = Cesium.Math.toDegrees(cartographic.longitude);
          
          // Find nearest building
          var nearest = findNearestBuilding(lat, lon);
          if (nearest) {
            showBuildingInfo(nearest);
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
  
  function findNearestBuilding(lat, lon) {
    var nearest = null;
    var nearestDist = Infinity;
    
    config.buildings.forEach(function(building) {
      var dLat = (building.lat - lat) * 111320;
      var dLon = (building.lon - lon) * (111320 * Math.cos(lat * Math.PI / 180));
      var dist = Math.sqrt(dLat * dLat + dLon * dLon);
      
      // Dynamic threshold based on building height (taller buildings visible from further)
      var threshold = Math.max(100, building.height * 0.3);
      
      if (dist < threshold && dist < nearestDist) {
        nearestDist = dist;
        nearest = building;
      }
    });
    
    return nearest;
  }
  
  function showBuildingInfo(building) {
    if (activeInfoCard && activeInfoCard.id === building.id) return;
    activeInfoCard = building;
    UIController.showInfoCard(building);
  }
  
  function onInfoCardClose() {
    activeInfoCard = null;
  }
  
  function onSearchSelect(buildingId) {
    var building = config.buildings.find(function(b) { return b.id === buildingId; });
    if (building) {
      showBuildingInfo(building);
      // Fly to building
      CameraController.flyToBuilding(building.lat, building.lon, building.height);
    }
  }
  
  return {
    init: init,
    findNearestBuilding: findNearestBuilding
  };
})();
