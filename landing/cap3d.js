import * as THREE from 'three';

(function () {
  var stage = document.getElementById('capStage');
  var canvas = document.getElementById('capCanvas');
  if (!stage || !canvas || !window.WebGLRenderingContext) return;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  } catch (e) {
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.4, 7.5);
  camera.lookAt(0, 0, 0);

  // --- Lighting: real depth/shading, not flat ---
  scene.add(new THREE.HemisphereLight(0xc7d2fe, 0x1e1b4b, 1.1));
  var keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
  keyLight.position.set(4, 6, 5);
  scene.add(keyLight);
  var rimLight = new THREE.PointLight(0x818cf8, 6, 20);
  rimLight.position.set(-5, -2, 4);
  scene.add(rimLight);
  var goldGlow = new THREE.PointLight(0xfacc15, 3, 10);
  goldGlow.position.set(1.5, -1.5, 3);
  scene.add(goldGlow);

  // --- Graduation cap group ---
  var cap = new THREE.Group();
  scene.add(cap);

  var indigoMat = new THREE.MeshStandardMaterial({ color: 0x4f46e5, roughness: 0.35, metalness: 0.15 });
  var darkIndigoMat = new THREE.MeshStandardMaterial({ color: 0x241f5c, roughness: 0.5, metalness: 0.1 });
  var goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3, metalness: 0.5, emissive: 0x7a5b00, emissiveIntensity: 0.15 });

  // Board (mortarboard) — thin square slab, rotated to sit like a diamond
  var board = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.22, 3.4), indigoMat);
  board.rotation.y = Math.PI / 4;
  board.position.y = 0.55;
  cap.add(board);

  // Band underneath the board (the part that would sit on a head)
  var band = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 1.25, 0.85, 24),
    darkIndigoMat
  );
  band.position.y = -0.15;
  cap.add(band);

  // Button on top center of the board
  var button = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), goldMat);
  button.position.y = 0.68;
  cap.add(button);

  // Tassel: curved cord + bead
  var tasselCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.68, 0),
    new THREE.Vector3(0.55, 0.3, 0.35),
    new THREE.Vector3(1.05, -0.55, 0.55),
    new THREE.Vector3(1.15, -1.25, 0.6),
  ]);
  var tasselCord = new THREE.Mesh(
    new THREE.TubeGeometry(tasselCurve, 24, 0.045, 8, false),
    goldMat
  );
  cap.add(tasselCord);
  var tasselBead = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), goldMat);
  tasselBead.position.set(1.15, -1.35, 0.6);
  cap.add(tasselBead);

  cap.scale.setScalar(1.15);

  // --- Resize handling ---
  function resize() {
    var w = stage.clientWidth || 1;
    var h = stage.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  if (window.ResizeObserver) {
    new ResizeObserver(resize).observe(stage);
  } else {
    window.addEventListener('resize', resize);
  }

  // --- Interaction: real rotation toward cursor, gentle idle spin otherwise ---
  var targetRotX = 0;
  var targetRotY = 0;
  var idleT = 0;
  var hovering = false;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  if (finePointer) {
    stage.addEventListener('mousemove', function (e) {
      hovering = true;
      var rect = stage.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 1.1;
      targetRotX = -y * 0.7;
    });
    stage.addEventListener('mouseleave', function () {
      hovering = false;
    });
  }

  function animate() {
    requestAnimationFrame(animate);

    if (!hovering) {
      idleT += 0.01;
      targetRotY = Math.sin(idleT) * 0.5 + idleT * 0.15;
      targetRotX = Math.sin(idleT * 0.7) * 0.15;
    }

    cap.rotation.y += (targetRotY - cap.rotation.y) * 0.06;
    cap.rotation.x += (targetRotX - cap.rotation.x) * 0.06;
    cap.position.y = Math.sin(idleT) * 0.08;

    renderer.render(scene, camera);
  }
  animate();
})();
