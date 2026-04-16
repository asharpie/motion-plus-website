/* ============================================
   Motion+ — Interactive 3D STL Viewer
   Uses embedded base64 model data (no fetch needed)
   ============================================ */

(function () {
  var queue = [];
  var loaded = false;
  var loading = false;

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = url;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function loadThreeJS() {
    if (loaded) { flushQueue(); return; }
    if (loading) return;
    loading = true;

    // Use cdnjs for core (most reliable), jsdelivr npm for addons
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js')
      .then(function () {
        return loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js');
      })
      .then(function () {
        return loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/STLLoader.js');
      })
      .then(function () {
        loaded = true;
        flushQueue();
      })
      .catch(function (err) {
        console.error('Three.js load failed, trying alternate CDN...', err);
        // Fallback: try all from jsdelivr npm
        loaded = false;
        loading = false;
        loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js')
          .then(function () {
            return loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js');
          })
          .then(function () {
            return loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/STLLoader.js');
          })
          .then(function () {
            loaded = true;
            flushQueue();
          })
          .catch(function () {
            console.error('All CDNs failed');
            queue.forEach(function (item) {
              var c = document.getElementById(item.id);
              if (c) {
                var el = c.querySelector('.stl-loading');
                if (el) el.innerHTML = '<p style="color:#888;text-align:center;padding:2rem;">3D viewer requires internet connection</p>';
              }
            });
          });
      });
  }

  function flushQueue() {
    while (queue.length > 0) {
      var item = queue.shift();
      createViewer(item.id, item.dataVar, item.opts);
    }
  }

  // Decode base64 to ArrayBuffer
  function base64ToArrayBuffer(base64) {
    var binary = atob(base64);
    var len = binary.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function createViewer(containerId, dataVarName, options) {
    var container = document.getElementById(containerId);
    if (!container) return;

    options = options || {};
    var height = options.height || 400;

    var width = container.clientWidth || container.parentElement.clientWidth || 600;

    // Remove loading spinner
    var loadEl = container.querySelector('.stl-loading');

    try {
      // Get the base64 data from the global variable
      var base64Data = window[dataVarName];
      if (!base64Data) {
        if (loadEl) loadEl.innerHTML = '<p style="color:#888;text-align:center;padding:2rem;">Model data not found: ' + dataVarName + '</p>';
        console.error('Model data variable not found:', dataVarName);
        return;
      }

      var scene = new THREE.Scene();
      scene.background = new THREE.Color(0x141414);

      var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 5000);

      var renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // Remove spinner now that canvas exists
      if (loadEl) loadEl.remove();

      // Lights
      scene.add(new THREE.AmbientLight(0xffffff, 0.6));

      var d1 = new THREE.DirectionalLight(0xffffff, 0.9);
      d1.position.set(1, 1, 1);
      scene.add(d1);

      var d2 = new THREE.DirectionalLight(0xDC143C, 0.25);
      d2.position.set(-1, -0.5, -1);
      scene.add(d2);

      var point = new THREE.PointLight(0xffffff, 0.3, 800);
      point.position.set(0, 100, 50);
      scene.add(point);

      // Controls
      var controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 1.5;

      // Parse STL from base64 data
      var arrayBuffer = base64ToArrayBuffer(base64Data);
      var loader = new THREE.STLLoader();
      var geometry = loader.parse(arrayBuffer);

      geometry.computeBoundingBox();
      geometry.center();
      geometry.computeBoundingSphere();
      var r = geometry.boundingSphere.radius;

      var material = new THREE.MeshPhongMaterial({
        color: options.color || 0xcccccc,
        specular: 0x444444,
        shininess: 40
      });

      var mesh = new THREE.Mesh(geometry, material);
      if (options.rotationX) mesh.rotation.x = options.rotationX;
      if (options.rotationY) mesh.rotation.y = options.rotationY;
      if (options.rotationZ) mesh.rotation.z = options.rotationZ;
      scene.add(mesh);

      // Position camera
      var camMul = options.cameraDistance || 2.8;
      var dist = r * camMul;
      camera.position.set(dist * 0.5, dist * 0.4, dist);
      camera.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);
      controls.minDistance = r * 0.5;
      controls.maxDistance = r * 8;
      controls.update();

      // Grid
      var grid = new THREE.GridHelper(r * 4, 20, 0x333333, 0x222222);
      grid.position.y = -r * 1.1;
      scene.add(grid);

      // Animate
      (function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      })();

      // Resize
      new ResizeObserver(function () {
        var w = container.clientWidth;
        if (w > 0) {
          camera.aspect = w / height;
          camera.updateProjectionMatrix();
          renderer.setSize(w, height);
        }
      }).observe(container);

      // Auto-rotate control
      var t;
      container.addEventListener('pointerdown', function () { controls.autoRotate = false; });
      container.addEventListener('pointerup', function () {
        clearTimeout(t);
        t = setTimeout(function () { controls.autoRotate = true; }, 5000);
      });

    } catch (e) {
      console.error('STL Viewer error:', e);
      if (loadEl) loadEl.innerHTML = '<p style="color:#888;text-align:center;padding:2rem;">Error: ' + e.message + '</p>';
    }
  }

  // Add loading spinner helper
  function addSpinner(container) {
    if (container && !container.querySelector('.stl-loading')) {
      var spinner = document.createElement('div');
      spinner.className = 'stl-loading';
      spinner.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10;';
      spinner.innerHTML = '<div class="loader"></div>';
      container.style.position = 'relative';
      container.appendChild(spinner);
    }
  }

  // Public API — single model: pass the name of the global JS variable
  window.initSTLViewer = function (containerId, dataVarName, options) {
    addSpinner(document.getElementById(containerId));
    if (loaded) {
      createViewer(containerId, dataVarName, options);
    } else {
      queue.push({ id: containerId, dataVar: dataVarName, opts: options });
      loadThreeJS();
    }
  };

  // Multi-model viewer: loads multiple STL variables into one scene
  // models = [{varName: 'STL_MECH_BODY', color: 0xcccccc}, ...]
  function createMultiViewer(containerId, models, options) {
    var container = document.getElementById(containerId);
    if (!container) return;
    options = options || {};
    var height = options.height || 400;
    var width = container.clientWidth || 600;
    var loadEl = container.querySelector('.stl-loading');

    try {
      var scene = new THREE.Scene();
      scene.background = new THREE.Color(0x141414);
      var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
      var renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
      if (loadEl) loadEl.remove();

      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      var d1 = new THREE.DirectionalLight(0xffffff, 0.9);
      d1.position.set(1, 1, 1); scene.add(d1);
      var d2 = new THREE.DirectionalLight(0xDC143C, 0.25);
      d2.position.set(-1, -0.5, -1); scene.add(d2);

      var controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 1.2;

      var loader = new THREE.STLLoader();
      var group = new THREE.Group();
      var loaded_count = 0;

      models.forEach(function (m) {
        var data = window[m.varName];
        if (!data) { console.warn('Missing:', m.varName); return; }
        var buf = base64ToArrayBuffer(data);
        var geo = loader.parse(buf);
        var mat = new THREE.MeshPhongMaterial({
          color: m.color || 0xcccccc,
          specular: 0x444444,
          shininess: 40
        });
        var mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);
        loaded_count++;
      });

      if (options.rotationX) group.rotation.x = options.rotationX;
      if (options.rotationY) group.rotation.y = options.rotationY;
      if (options.rotationZ) group.rotation.z = options.rotationZ;
      scene.add(group);

      // Fit camera to entire group
      var box = new THREE.Box3().setFromObject(group);
      var center = box.getCenter(new THREE.Vector3());
      var size = box.getSize(new THREE.Vector3());
      var maxDim = Math.max(size.x, size.y, size.z);
      var camMul = options.cameraDistance || 2;
      var dist = maxDim * camMul;

      group.position.sub(center); // center the group
      camera.position.set(dist * 0.5, dist * 0.4, dist);
      camera.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);
      controls.minDistance = maxDim * 0.3;
      controls.maxDistance = maxDim * 5;
      controls.update();

      var grid = new THREE.GridHelper(maxDim * 2, 20, 0x333333, 0x222222);
      grid.position.y = -(size.y / 2) * 1.1;
      scene.add(grid);

      (function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      })();

      new ResizeObserver(function () {
        var w = container.clientWidth;
        if (w > 0) {
          camera.aspect = w / height;
          camera.updateProjectionMatrix();
          renderer.setSize(w, height);
        }
      }).observe(container);

      var t;
      container.addEventListener('pointerdown', function () { controls.autoRotate = false; });
      container.addEventListener('pointerup', function () {
        clearTimeout(t);
        t = setTimeout(function () { controls.autoRotate = true; }, 5000);
      });

    } catch (e) {
      console.error('Multi STL Viewer error:', e);
      if (loadEl) loadEl.innerHTML = '<p style="color:#888;text-align:center;padding:2rem;">Error: ' + e.message + '</p>';
    }
  }

  // Public multi-model API
  window.initMultiSTLViewer = function (containerId, models, options) {
    addSpinner(document.getElementById(containerId));
    if (loaded) {
      createMultiViewer(containerId, models, options);
    } else {
      queue.push({ id: containerId, models: models, opts: options, multi: true });
      loadThreeJS();
    }
  };

  // Patch flushQueue to handle multi viewers
  var origFlush = flushQueue;
  flushQueue = function () {
    while (queue.length > 0) {
      var item = queue.shift();
      if (item.multi) {
        createMultiViewer(item.id, item.models, item.opts);
      } else {
        createViewer(item.id, item.dataVar, item.opts);
      }
    }
  };
})();
