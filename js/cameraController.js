// Camera Controller - Safe version
var CameraController = (function() {
  var viewer = null;
  var config = window.APP_CONFIG;
  var isIntroPlaying = true;
  var keys = { w: false, a: false, s: false, d: false, q: false, e: false, shift: false };
  var moveSpeed = 30;
  var lastTime = Date.now();
  
  function init(v) {
    viewer = v;
    if (!viewer) return;
    
    // Disable controls during intro
    var ctrl = viewer.scene.screenSpaceCameraController;
    ctrl.enableRotate = false;
    ctrl.enableTranslate = false;
    ctrl.enableZoom = false;
    ctrl.enableTilt = false;
    ctrl.enableLook = false;
    
    // Simple fly-in
    try {
      startIntro();
    } catch(e) {
      console.warn('Intro animation failed:', e);
      enableFreeMode();
    }
    
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    setupClickHandlers();
  }
  
  function startIntro() {
    // Simple fly-in: just move camera from higher to lower
    var startAlt = 4000;
    var endAlt = 1500;
    var duration = 5000;
    var startTime = Date.now();
    var center = Cesium.Cartesian3.fromDegrees(config.centerLon - 0.008, config.centerLat, startAlt);
    
    viewer.camera.setView({
      destination: center,
      orientation: { heading: Cesium.Math.toRadians(90), pitch: Cesium.Math.toRadians(-35), roll: 0 }
    });
    
    function anim() {
      var t = Math.min((Date.now() - startTime) / duration, 1.0);
      t = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
      
      var alt = startAlt + (endAlt - startAlt) * t;
      var pos = Cesium.Cartesian3.fromDegrees(
        config.centerLon - 0.008 + 0.008 * t, config.centerLat, alt
      );
      viewer.camera.setView({
        destination: pos,
        orientation: { heading: Cesium.Math.toRadians(90 + t*40), pitch: Cesium.Math.toRadians(-35 + t*10), roll: 0 }
      });
      
      if (t < 1.0) requestAnimationFrame(anim);
      else setTimeout(enableFreeMode, 500);
    }
    
    requestAnimationFrame(anim);
  }
  
  function enableFreeMode() {
    isIntroPlaying = false;
    var c = viewer.scene.screenSpaceCameraController;
    c.enableRotate = true;
    c.enableTranslate = true;
    c.enableZoom = true;
    c.enableTilt = true;
    c.enableLook = true;
    c.inertiaTranslate = 0.95;
    c.inertiaRotate = 0.95;
    c.inertiaZoom = 0.95;
  }
  
  function setupClickHandlers() {
    try {
      var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(function(click) {
        if (isIntroPlaying) return;
        var pos = viewer.scene.pickPosition(click.position);
        if (Cesium.defined(pos)) flyToPosition(pos);
      }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    } catch(e) {}
  }
  
  function flyToPosition(target) {
    if (!viewer || !target) return;
    var start = viewer.camera.position.clone();
    var dur = 1.5, t0 = Date.now();
    var dir = Cesium.Cartesian3.subtract(start, target, new Cesium.Cartesian3());
    Cesium.Cartesian3.normalize(dir, dir);
    var dest = Cesium.Cartesian3.add(target, Cesium.Cartesian3.multiplyByScalar(dir, 200, new Cesium.Cartesian3()), new Cesium.Cartesian3());
    
    function anim() {
      var t = Math.min((Date.now()-t0)/1000/dur, 1);
      t = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
      viewer.camera.setView({
        destination: Cesium.Cartesian3.lerp(start, dest, t, new Cesium.Cartesian3()),
        orientation: { heading: viewer.camera.heading, pitch: viewer.camera.pitch, roll: 0 }
      });
      if (t < 1) requestAnimationFrame(anim);
    }
    requestAnimationFrame(anim);
  }
  
  function flyToBuilding(lat, lon, h) {
    flyToPosition(Cesium.Cartesian3.fromDegrees(lon, lat, h * 0.6));
  }
  
  function onKeyDown(e) {
    if (isIntroPlaying) return;
    switch(e.key.toLowerCase()) {
      case 'w': keys.w=true; break; case 'a': keys.a=true; break;
      case 's': keys.s=true; break; case 'd': keys.d=true; break;
      case 'q': keys.q=true; break; case 'e': keys.e=true; break;
      case 'shift': keys.shift=true; break;
    }
  }
  
  function onKeyUp(e) {
    switch(e.key.toLowerCase()) {
      case 'w': keys.w=false; break; case 'a': keys.a=false; break;
      case 's': keys.s=false; break; case 'd': keys.d=false; break;
      case 'q': keys.q=false; break; case 'e': keys.e=false; break;
      case 'shift': keys.shift=false; break;
    }
  }
  
  function update() {
    if (!viewer || isIntroPlaying) {
      updateCoords();
      return;
    }
    var dt = (Date.now() - lastTime) / 1000;
    lastTime = Date.now();
    updateCoords();
    
    if (!keys.w && !keys.a && !keys.s && !keys.d && !keys.q && !keys.e) return;
    
    var cam = viewer.camera;
    var spd = moveSpeed * (keys.shift ? 3 : 1) * dt;
    var fwd = cam.direction.clone(); fwd.z = 0; Cesium.Cartesian3.normalize(fwd, fwd);
    var rgt = cam.right.clone(); Cesium.Cartesian3.normalize(rgt, rgt);
    
    var mv = new Cesium.Cartesian3();
    if (keys.w) Cesium.Cartesian3.add(mv, fwd, mv);
    if (keys.s) Cesium.Cartesian3.subtract(mv, fwd, mv);
    if (keys.d) Cesium.Cartesian3.add(mv, rgt, mv);
    if (keys.a) Cesium.Cartesian3.subtract(mv, rgt, mv);
    
    if (!Cesium.Cartesian3.equals(mv, Cesium.Cartesian3.ZERO)) {
      Cesium.Cartesian3.normalize(mv, mv);
      Cesium.Cartesian3.multiplyByScalar(mv, spd, mv);
      cam.position = Cesium.Cartesian3.add(cam.position, mv, new Cesium.Cartesian3());
    }
    if (keys.q) cam.moveUp(spd * 0.5);
    if (keys.e) cam.moveDown(spd * 0.5);
  }
  
  function updateCoords() {
    if (!viewer) return;
    var c = Cesium.Cartographic.fromCartesian(viewer.camera.position);
    UIController.updateCoords(
      Cesium.Math.toDegrees(c.latitude),
      Cesium.Math.toDegrees(c.longitude),
      c.height
    );
  }
  
  return {
    init: init, update: update,
    flyToBuilding: flyToBuilding,
    flyToPosition: flyToPosition,
    isIntroPlaying: function() { return isIntroPlaying; },
    skipIntro: function() { enableFreeMode(); }
  };
})();
