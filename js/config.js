// Configuration for Shanghai Lujiazui Digital Twin
window.APP_CONFIG = {
  // Cesium Ion Access Token - REPLACE WITH YOUR OWN TOKEN
  // Get one at: https://ion.cesium.com/signup
  cesiumIonToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwY2UxNmM3OS0xNzdkLTQzMTgtYjJlZC05MTA0MWVmYzMyYzIiLCJpZCI6NDQxMjk4LCJzdWIiOiJndW94dWFueXUiLCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoiVW50aXRsZWQiLCJpYXQiOjE3ODA4MzEzMjR9.ruySHM-n61Ex4Zp31OKZtcFwQUvEEcsrOONGg6n2NiA',
  
  // Google Photorealistic 3D Tiles asset ID in Cesium Ion
  google3DTilesAssetId: 2275207,
  
  // Lujiazui center coordinates
  centerLat: 31.2397,
  centerLon: 121.4998,
  centerHeight: 2000,  // Initial camera altitude in meters
  
  // Building database
  buildings: [
    { id: 'shanghai-tower', name: '\u4e0a\u6d77\u4e2d\u5fc3\u5927\u53a6', nameEn: 'Shanghai Tower', lat: 31.2355, lon: 121.5016, height: 632, year: 2015, desc: '632m, 128 floors. The tallest building in China and the second-tallest in the world. Its twisting form reduces wind loads by 24%. Features the world\'s fastest elevators at 20.5 m/s.' },
    { id: 'swfc', name: '\u73af\u7403\u91d1\u878d\u4e2d\u5fc3', nameEn: 'Shanghai World Financial Center', lat: 31.2368, lon: 121.5012, height: 492, year: 2008, desc: '492m, 101 floors. Known for its distinctive trapezoid aperture at the top. A mixed-use skyscraper housing offices, hotels, and observation decks.' },
    { id: 'jinmao', name: '\u91d1\u8302\u5927\u53a6', nameEn: 'Jin Mao Tower', lat: 31.2372, lon: 121.5014, height: 421, year: 1999, desc: '421m, 88 floors. Combines traditional Chinese architecture with modern design. Home to the Grand Hyatt Shanghai hotel.' },
    { id: 'oriental-pearl', name: '\u4e1c\u65b9\u660e\u73e0', nameEn: 'Oriental Pearl Tower', lat: 31.2397, lon: 121.4998, height: 468, year: 1995, desc: '468m TV tower with distinctive spheres. An iconic landmark of Shanghai\'s skyline. Features observation decks, a revolving restaurant, and the Shanghai History Museum.' },
    { id: 'ifc', name: '\u56fd\u91d1\u4e2d\u5fc3', nameEn: 'Shanghai IFC', lat: 31.2379, lon: 121.5025, height: 260, year: 2010, desc: 'Twin towers complex. Tower 1: 260m, Tower 2: 250m. Premium office and retail complex including the Shanghai IFC Mall.' },
    { id: 'bund-center', name: '\u5916\u6ee9\u4e2d\u5fc3', nameEn: 'Bund Center', lat: 31.2404, lon: 121.4898, height: 198, year: 2002, desc: '198m landmark on the Bund. Crown-shaped top is illuminated at night. Houses offices and the Westin Bund Center Hotel.' },
    { id: 'shanghai-tower-sky', name: '\u4e0a\u6d77\u5927\u53a6\u89c2\u666f\u5c42', nameEn: 'Shanghai Tower Observation Deck', lat: 31.2355, lon: 121.5016, height: 562, year: 2016, desc: 'The world\'s highest observation deck at 562m. Offers 360-degree views of Shanghai. Located on floors 118-119.' }
  ],
  
  // Time-of-day presets
  timeOfDay: {
    day: {
      label: 'Day',
      sunIntensity: 1.2,
      ambientIntensity: 0.3,
      skyColor: [0.53, 0.81, 0.98],
      fogDensity: 0.00002,
      fogColor: [0.8, 0.9, 1.0]
    },
    dusk: {
      label: 'Dusk',
      sunIntensity: 0.6,
      ambientIntensity: 0.15,
      skyColor: [0.95, 0.55, 0.25],
      fogDensity: 0.00005,
      fogColor: [0.9, 0.6, 0.3]
    },
    night: {
      label: 'Night',
      sunIntensity: 0.0,
      ambientIntensity: 0.02,
      skyColor: [0.05, 0.05, 0.15],
      fogDensity: 0.00008,
      fogColor: [0.02, 0.02, 0.08]
    }
  }
};
