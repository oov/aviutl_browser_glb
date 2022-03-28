import { GltfView } from '@khronosgroup/gltf-viewer';
import { createDecoderModule } from 'draco3d/draco3d';
import { vec3, mat4 } from 'gl-matrix';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

let view = undefined, loader = undefined;

export async function load(glb, hdr) {
  if (!view) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    view = new GltfView(canvas.getContext("webgl2", { alpha: true, antialias: true }));
    loader = view.createResourceLoader(createDecoderModule, LIBKTX);
  }
  const state = view.createState();
  state.renderingParameters.clearColor = [0, 0, 0, 0];
  if (hdr) {
    state.environment = await loader.loadEnvironment(hdr.hdr, hdr.luts);
  }
  if (glb) {
    state.gltf = await loader.loadGltf(glb);
    const defaultScene = state.gltf.scene;
    state.sceneIndex = defaultScene === undefined ? 0 : defaultScene;
    state.cameraIndex = undefined;
    if (state.gltf.scenes.length != 0) {
      if (state.sceneIndex > state.gltf.scenes.length - 1) {
        state.sceneIndex = 0;
      }
      const scene = state.gltf.scenes[state.sceneIndex];
      scene.applyTransformHierarchy(state.gltf);
      state.userCamera.aspectRatio = canvas.width / canvas.height;
      state.userCamera.fitViewToScene(state.gltf, state.sceneIndex);

      state.animationIndices = [];
      for (let i = 0; i < state.gltf.animations.length; i++) {
        if (!state.gltf.nonDisjointAnimations(state.animationIndices).includes(i)) {
          state.animationIndices.push(i);
        }
      }
    }
  }
  return state;
}

export function setCamera(state, position, target, rotate) {
  mat4.targetTo(state.userCamera.getTransformMatrix(), position, target, vec3.fromValues(-Math.sin(rotate), Math.cos(rotate), 0));
}

export function render(state) {
  view.renderFrame(state, canvas.width, canvas.height);
}
