// Post Processing - Safe version (all effects optional)
var PostProcessing = (function() {
  var viewer = null;
  
  function init(v) {
    viewer = v;
    if (!viewer || !viewer.scene) return;
    
    var scene = viewer.scene;
    
    // FXAA
    try {
      if (scene.postProcessStages && scene.postProcessStages.fxaa) {
        scene.postProcessStages.fxaa.enabled = true;
      }
    } catch(e) {}
    
    // Bloom
    try {
      if (Cesium.PostProcessStageLibrary) {
        var bloom = Cesium.PostProcessStageLibrary.createBloomStage();
        if (bloom) {
          bloom.uniforms.contrast = 128;
          bloom.uniforms.brightness = 0;
          bloom.uniforms.delta = 0.9;
          bloom.uniforms.sigma = 3.5;
          bloom.uniforms.stepSize = 5;
          scene.postProcessStages.add(bloom);
        }
      }
    } catch(e) {
      console.warn('Bloom unavailable');
    }
    
    // SSAO
    try {
      if (Cesium.PostProcessStageLibrary) {
        var ssao = Cesium.PostProcessStageLibrary.createAmbientOcclusionStage();
        if (ssao) {
          ssao.uniforms.intensity = 0.4;
          ssao.uniforms.bias = 0.1;
          ssao.uniforms.lengthCap = 0.2;
          ssao.uniforms.stepSize = 1;
          scene.postProcessStages.add(ssao);
        }
      }
    } catch(e) {
      console.warn('SSAO unavailable');
    }
  }
  
  function update() {}
  
  return { init: init, update: update };
})();
