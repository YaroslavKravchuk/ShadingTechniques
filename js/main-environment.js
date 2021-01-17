import * as glMatrix from './gl-matrix/common.js';
import {VERT_CODE, FRAG_CODE} from './shader-code-environment.js';
import {RenderCore} from './rendercore.js';

// The core rendering functions
var renderCore = null;

// Call main when the DOM is loaded.
window.addEventListener("load", main);

/**
 * Main entry point for the environment map exercise.
 */
function main() {
    glMatrix.setMatrixArrayType(Array);
    
    // Create the core renderer
    renderCore = new RenderCore(VERT_CODE, FRAG_CODE);
    
    const gl = renderCore.gl;
    const cubeMapDir = "data/LancellottiChapel";
    
    // Load the teapot mesh
    renderCore.loadMesh('data/teapot.obj')
        .then( () => {
            return loadEnvMap(gl, cubeMapDir);
        })
        .then( () => {
            renderCore.resize();
            renderCore.repaint();
        });
}

/**
 * Loads the environment map.
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {String} dir directory containing the cube map images. 
 */
function loadEnvMap(gl, dir) {
    const files = [
        'posx.jpg', 'negx.jpg',
        'posy.jpg', 'negy.jpg',
        'posz.jpg', 'negz.jpg',
    ].map( (name) => dir + "/" + name );

    // Call loadImage for each image, store promises in an array
    const imgPromises = files.map( (url) => loadImage(url) );

    // When all promises are resolved, create the cube map texture.
    return Promise.all( imgPromises ).then( (images) => {
        const id = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, id);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

        const w = images[0].width;
        const h = images[0].height;

        gl.texStorage2D(gl.TEXTURE_CUBE_MAP, 1, gl.RGBA8, w, h);
        for( let i = 0; i < 6; i++ ) {
            gl.texSubImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, 0, 0, w, h, gl.RGBA,
                gl.UNSIGNED_BYTE, images[i]);
        }

        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        
        return id;
    });
}

/**
 * Loads an image and returns a promise that resolves to the Image object.
 * 
 * @param {String} url image path 
 * @returns {Promise<Image>}
 */
function loadImage(url) {
    return new Promise( (resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => resolve(img) );
        img.addEventListener('error', () => {
            console.error("Unable to load texture: " + url);
            reject("Unable to load texture: " + url);
        });
        img.src = url;
    });
}
