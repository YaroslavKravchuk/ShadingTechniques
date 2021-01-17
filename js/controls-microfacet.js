import {SliderControl} from './slider-control.js';

/**
 * Manages controls for the microfacet shader exercise.
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

        const initExposure = 1000.0;
        const initAlpha = 0.5;
    
        this.alphaSlider = new SliderControl(
            "Alpha:", 
            "alpha-slider", 
            groupEl, 
            {min: 0.01, max: 1.0, initial: initAlpha, step: 'any', precision: 2 } );
        this.alphaSlider.addInputListener( (e) => {
            const v = e.target.value;
            this.gl.uniform1f(this.world.shader.uniform('alpha'), v);
            this.update();
        });
        this.gl.uniform1f(this.world.shader.uniform('alpha'), initAlpha);


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