import type { MarkdownDocumentContext, MarkdownExtension } from '../../../MarkdownEngine.js';
import { assertSourceSize, observeElementResize, renderExtensionError, resolveResourceUrl, waitForElementLayout } from '../../extensionUtils.js';
import { model3DManifest } from './manifest.js';
import type { AnimationMixer, Object3D, PerspectiveCamera, Scene, Timer, WebGLRenderer } from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type Entry = {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  controls: OrbitControls;
  mixer?: AnimationMixer;
  timer?: Timer;
  frame: number | undefined;
  disconnect: () => void;
  disconnectVisibility: () => void;
  onChange: () => void;
};

const disposeObject = (object: Object3D): void => {
  object.traverse((child) => {
    const mesh = child as Object3D & {
      geometry?: { dispose(): void };
      material?: { dispose(): void; map?: { dispose(): void } } | Array<{ dispose(): void; map?: { dispose(): void } }>;
    };
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    for (const material of materials) {
      material.map?.dispose();
      material.dispose();
    }
  });
};

export const model3DExtension = (): MarkdownExtension => {
  const entries = new Map<Element, Entry>();
  const dispose = (container: Element): void => {
    const entry = entries.get(container);
    if (entry) {
      if (entry.frame !== undefined) cancelAnimationFrame(entry.frame);
      try {
        entry.disconnect();
      } catch {
        /* Continue releasing the remaining WebGL resources. */
      }
      try {
        entry.disconnectVisibility();
      } catch {
        /* Continue releasing the remaining WebGL resources. */
      }
      try {
        entry.timer?.dispose();
      } catch {
        /* Continue releasing the remaining WebGL resources. */
      }
      try {
        entry.controls.removeEventListener('change', entry.onChange);
      } catch {
        /* Continue releasing the remaining WebGL resources. */
      }
      try {
        entry.controls.dispose();
      } catch {
        /* Continue releasing the remaining WebGL resources. */
      }
      try {
        disposeObject(entry.scene);
      } catch {
        /* Continue releasing the remaining WebGL resources. */
      }
      try {
        entry.renderer.dispose();
      } catch {
        /* Continue releasing the remaining WebGL resources. */
      }
      try {
        entry.renderer.forceContextLoss();
      } catch {
        /* Continue releasing the remaining WebGL resources. */
      }
    }
    entries.delete(container);
    container.replaceChildren();
  };
  const render = async (container: Element, source: string, context: MarkdownDocumentContext): Promise<void> => {
    const language = container.getAttribute('data-markdown-language') ?? 'gltf';
    let partialRenderer: WebGLRenderer | undefined;
    let partialScene: Scene | undefined;
    let partialControls: OrbitControls | undefined;
    let partialObject: Object3D | undefined;
    let partialTimer: Timer | undefined;
    let partialDisconnect = (): void => undefined;
    let partialDisconnectVisibility = (): void => undefined;
    let partialOnChange = (): void => undefined;
    try {
      assertSourceSize(source, context);
      const [THREE, { OrbitControls }, { STLLoader }, { OBJLoader }, { GLTFLoader }] = await Promise.all([
        import(/* webpackChunkName: "markdown-model-3d" */ 'three'),
        import(/* webpackChunkName: "markdown-model-3d" */ 'three/examples/jsm/controls/OrbitControls.js'),
        import(/* webpackChunkName: "markdown-model-3d" */ 'three/examples/jsm/loaders/STLLoader.js'),
        import(/* webpackChunkName: "markdown-model-3d" */ 'three/examples/jsm/loaders/OBJLoader.js'),
        import(/* webpackChunkName: "markdown-model-3d" */ 'three/examples/jsm/loaders/GLTFLoader.js'),
      ]);
      if (context.signal?.aborted) return;
      dispose(container);
      await waitForElementLayout(container, context);
      if (context.signal?.aborted) return;
      const width = Math.max((context.renderSize ? container.clientWidth : context.width) ?? container.clientWidth ?? 640, 1);
      const height = Math.max((context.renderSize ? container.clientHeight : context.height) ?? container.clientHeight ?? 420, 1);
      const renderer = (partialRenderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      }));
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(width, height, false);
      renderer.domElement.setAttribute('role', 'application');
      renderer.domElement.setAttribute('aria-label', `Interactive ${language.toUpperCase()} model`);
      container.append(renderer.domElement);
      const scene = (partialScene = new THREE.Scene());
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 10000);
      const controls = (partialControls = new OrbitControls(camera, renderer.domElement));
      scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2.5));
      const directional = new THREE.DirectionalLight(0xffffff, 2);
      directional.position.set(3, 5, 4);
      scene.add(directional);
      let object: Object3D;
      let mixer: AnimationMixer | undefined;
      if (language === 'stl') {
        const geometry = new STLLoader().parse(new TextEncoder().encode(source).buffer);
        geometry.computeVertexNormals();
        object = new THREE.Mesh(
          geometry,
          new THREE.MeshStandardMaterial({
            color: 0x78909c,
            roughness: 0.65,
            metalness: 0.05,
          }),
        );
      } else if (language === 'obj') {
        object = new OBJLoader().parse(source);
        // Bare OBJ files have no MTL palette. The loader's white material
        // disappears against a light document under the viewer's lights.
        object.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          for (const material of materials) {
            if ('color' in material && !material.vertexColors && material.color.getHex() === 0xffffff) material.color.setHex(0x78909c);
          }
        });
      } else {
        const base = context.sourceUrl ? new URL('.', context.sourceUrl).href : document.baseURI;
        const manager = new THREE.LoadingManager();
        manager.setURLModifier((url) => resolveResourceUrl(url, context).href);
        const gltf = await new GLTFLoader(manager).parseAsync(source, base);
        if (context.signal?.aborted) {
          disposeObject(gltf.scene);
          controls.dispose();
          renderer.dispose();
          renderer.forceContextLoss();
          container.replaceChildren();
          return;
        }
        object = gltf.scene;
        partialObject = object;
        if (gltf.animations.length) {
          mixer = new THREE.AnimationMixer(object);
          gltf.animations.forEach((clip: import('three').AnimationClip) => mixer!.clipAction(clip).play());
        }
      }
      partialObject = object;
      scene.add(object);
      const box = new THREE.Box3().setFromObject(object);
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      const distance = Math.max(sphere.radius * 2.8, 1);
      camera.position.set(sphere.center.x + distance, sphere.center.y + distance * 0.65, sphere.center.z + distance);
      camera.near = Math.max(distance / 1000, 0.001);
      camera.far = distance * 100;
      camera.updateProjectionMatrix();
      controls.target.copy(sphere.center);
      controls.update();
      // Static models need no clock or visibility listener. Animated models
      // update time once per frame and discard time spent offscreen.
      const timer = mixer ? (partialTimer = new THREE.Timer()) : undefined;
      timer?.connect(container.ownerDocument);
      timer?.reset();
      const onChange = (partialOnChange = (): void => renderer.render(scene, camera));
      const entry: Entry = {
        scene,
        camera,
        renderer,
        controls,
        ...(mixer ? { mixer } : {}),
        ...(timer ? { timer } : {}),
        frame: undefined,
        disconnect: () => undefined,
        disconnectVisibility: () => undefined,
        onChange,
      };
      let visible = true;
      const draw = (): void => {
        if (!visible || context.signal?.aborted) {
          entry.frame = undefined;
          return;
        }
        if (mixer && timer) {
          timer.update();
          mixer.update(timer.getDelta());
        }
        renderer.render(scene, camera);
        if (mixer) entry.frame = requestAnimationFrame(draw);
      };
      controls.addEventListener('change', onChange);
      entry.disconnect = partialDisconnect = observeElementResize(container, context, (nextWidth, nextHeight) => {
        if (!nextWidth || !nextHeight) return;
        camera.aspect = nextWidth / nextHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(nextWidth, nextHeight, false);
        renderer.render(scene, camera);
      });
      if (typeof IntersectionObserver !== 'undefined') {
        const observer = new IntersectionObserver(([observed]) => {
          visible = observed?.isIntersecting ?? true;
          if (!visible && entry.frame !== undefined) {
            cancelAnimationFrame(entry.frame);
            entry.frame = undefined;
          } else if (visible && entry.frame === undefined) {
            timer?.reset();
            draw();
          }
        });
        observer.observe(container);
        entry.disconnectVisibility = partialDisconnectVisibility = () => observer.disconnect();
      }
      entries.set(container, entry);
      draw();
      partialRenderer = undefined;
      partialScene = undefined;
      partialControls = undefined;
      partialObject = undefined;
      partialTimer = undefined;
      partialDisconnect = (): void => undefined;
      partialDisconnectVisibility = (): void => undefined;
      partialOnChange = (): void => undefined;
    } catch (error) {
      if (entries.has(container)) {
        dispose(container);
      } else {
        try {
          partialTimer?.dispose();
        } catch {
          /* Continue releasing partially initialized resources. */
        }
        try {
          partialDisconnect();
        } catch {
          /* Continue releasing partially initialized resources. */
        }
        try {
          partialDisconnectVisibility();
        } catch {
          /* Continue releasing partially initialized resources. */
        }
        try {
          partialControls?.removeEventListener('change', partialOnChange);
        } catch {
          /* Continue releasing partially initialized resources. */
        }
        try {
          partialControls?.dispose();
        } catch {
          /* Continue releasing partially initialized resources. */
        }
        if (partialObject) {
          try {
            disposeObject(partialObject);
          } catch {
            /* Continue releasing partially initialized resources. */
          }
        } else if (partialScene) {
          try {
            disposeObject(partialScene);
          } catch {
            /* Continue releasing partially initialized resources. */
          }
        }
        try {
          partialRenderer?.dispose();
        } catch {
          /* Continue releasing partially initialized resources. */
        }
        try {
          partialRenderer?.forceContextLoss();
        } catch {
          /* Continue releasing partially initialized resources. */
        }
        container.replaceChildren();
      }
      if (!context.signal?.aborted) renderExtensionError(container, 'Three.js', language, source, error, context);
    }
  };
  return {
    name: model3DManifest.name,
    manifest: model3DManifest,
    fences: model3DManifest.fences.map((fence) => ({
      ...fence,
      render,
      dispose,
    })),
    dispose() {
      for (const container of Array.from(entries.keys())) dispose(container);
    },
  };
};
