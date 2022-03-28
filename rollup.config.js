import resolve  from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';
import copy from 'rollup-plugin-copy';
import child_process from 'child_process';

const version = (() =>{
  const tag = child_process.execSync('git tag --points-at HEAD').toString().trim();
  const hash = child_process.execSync('git rev-parse --short HEAD').toString().trim();
  return `${tag ? tag : "vX.X.X"} ( ${hash ? hash : "unknown"} )`;
});
const replaceVersion = (contents, filename) => contents.toString().replace(/%%VERSION%%/g, version);

export default {
  input: 'src/main.js',
  output: [
    {
      name: '',
      file: 'dist/script/browser/contents/GLB/main.js',
      format: 'es',
    }
  ],
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: true,
    }),
    commonjs({}),
    builtins(),
    copy({
      targets: [
        { src: "README.md", dest: "dist/", rename: "@GLB.txt" },
        { src: ["lua/@GLB.anm", "lua/@GLB.obj"], dest: "dist/script/browser/" },
        { src: ["index.html"], dest: "dist/script/browser/contents/GLB/", transform: replaceVersion },
        { src: ["node_modules/@khronosgroup/gltf-viewer/dist/assets", "node_modules/@khronosgroup/gltf-viewer/dist/libs", "node_modules/draco3d/draco_decoder.wasm"], dest: "dist/script/browser/contents/GLB/" },
        { src: ["studio_small_08_4k.hdr"], dest: "dist/script/browser/contents/GLB/assets/" },
      ],
      copyOnce: true,
      verbose: true
    }),
  ],
};
