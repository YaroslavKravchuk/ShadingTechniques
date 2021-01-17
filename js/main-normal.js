import * as glMatrix from './gl-matrix/common.js';
import {VERT_CODE, FRAG_CODE} from './shader-code-normal.js';
import {Controls} from './controls-normal-map.js';
import {RenderCore} from './rendercore.js';
import {Texture} from './texture.js';

var renderCore = null;
var controls = null;
var diffTex = null;
var normalMap = null;

/**
 * Main entry point for the normal mapping exercise.
 */
function main() {
    glMatrix.setMatrixArrayType(Array);
    
    renderCore = new RenderCore(VERT_CODE, FRAG_CODE);
    controls = new Controls(renderCore.gl, renderCore.world);

    const gl = renderCore.gl;

    renderCore.world.shader.use(gl);
    gl.uniform1i(renderCore.world.shader.uniform('diffuseTexture'), 0);
    gl.uniform1i(renderCore.world.shader.uniform('normalMap'), 1);

    renderCore.loadMesh('data/sphere.obj')
        .then( () => {
            return Texture.load(gl, 'data/earthmap1k.jpg');
        })
        .then( (tex) => {
            diffTex = tex;
            return Texture.load(gl, 'data/earthNormalMap_1k.png');
        })
        .then( (tex) => {
            normalMap = tex;
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, diffTex.textureId);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, normalMap.textureId);
            renderCore.resize();
            renderCore.repaint();
        });
}

window.addEventListener("load", main);