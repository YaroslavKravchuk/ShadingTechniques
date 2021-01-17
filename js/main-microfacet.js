import * as glMatrix from './gl-matrix/common.js';
import {VERT_CODE, FRAG_CODE} from './shader-code-microfacet.js';
import {Controls} from './controls-microfacet.js';
import {RenderCore} from './rendercore.js';
import {Texture} from './texture.js';

var renderCore = null;
var controls = null;

// Call main when the DOM is loaded.
window.addEventListener("load", main);

/**
 * Main entry point for the microfacet shader exercise.
 */
function main() {
    glMatrix.setMatrixArrayType(Array);

    renderCore = new RenderCore(VERT_CODE, FRAG_CODE);
    controls = new Controls(renderCore.gl, renderCore.world);

    const gl = renderCore.gl;

    renderCore.world.shader.use(gl);

    renderCore.loadMesh('data/teapot.obj')
        .then( () => {
            return Texture.load(gl, 'data/flower.png');
        })
        .then( (tex) => {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, tex.textureId);
            renderCore.resize();
            renderCore.repaint();
        });
}
