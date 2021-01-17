import {SliderControl} from './slider-control.js';

/**
 * Manages controls for the Blinn-Phong shader example.
 */
export class Controls {

    /**
     * Initializes the controls and sets up event handlers.
     * 
     * @param {WebGL2RenderingContext} gl 
     * @param {Object} world object containing the world parameters
     */
    constructor(gl, world) {
        this.gl = gl;
        this.world = world;
        const groupEl = document.getElementById('main-group');

        const initRoughness = 0.002;
        const initExposure = 1000.0;
    
        this.roughnessSlider = new SliderControl(
            "Roughness:", 
            "roughness-slider", 
            groupEl, 
            {min: -16.0, max: 0.0, initial: Math.log2(initRoughness), step: 'any',
            valueFn: (v) => Math.pow(2, v), precision: 5 } );
        this.roughnessSlider.addInputListener( (e) => {
            const v = Math.pow( 2, e.target.value );
            this.gl.uniform1f(this.world.shader.uniform('roughness'), v);
            this.update();
        });
        this.gl.uniform1f(this.world.shader.uniform('roughness'), initRoughness);

        this.exposureSlider = new SliderControl( "Exposure:", "exposure-slider", groupEl, 
            {min: 5.0, max: 18.0, initial: Math.log2(initExposure), precision: 1,
            valueFn: (v) => Math.pow(2, v) });
        this.exposureSlider.addInputListener( (e) => {
            const v = Math.pow(2, e.target.value);
            this.gl.uniform1f(this.world.shader.uniform('exposure'), v);
            this.update();
        });
        this.gl.uniform1f(this.world.shader.uniform('exposure'), initExposure);

        this.canvas = document.getElementById('gl-canvas');
    }

    /**
     * Send a repaint event to the canvas.
     */
    update() {
        this.canvas.dispatchEvent(new Event('repaint'));
    }
}