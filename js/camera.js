import * as vec3 from './gl-matrix/vec3.js';
import * as mat4 from './gl-matrix/mat4.js';

/**
 * A class that represents a camera's coordinate system.
 */
export class Camera {
    /**
     * Constructs the camera with a default position and orientation.
     * 
     * Default position: (0,1,5)
     * Default orientation:  target (0,0,0), up( 0,1,0 )
     */
    constructor() {
        // Camera's position
        this.eye = [0,0,0];

        // Camera's u, v, w axes
        this.u = [1,0,0];
        this.v = [0,1,0];
        this.w = [0,0,1];
        
        // Orient the camera to a default orientation
        this.orient( [0,1,5], [0,0,0], [0,1,0] );
        
        // Rotation and translation matrix, initially set to I
        this.rotation = mat4.create();
        this.translation = mat4.create();
    }

    /**
     * Orient the camera
     * 
     * @param {vec3} eye camera position 
     * @param {vec3} at camera target (the point the camera looks towards) 
     * @param {vec3} up the up direction 
     */
    orient( eye, at, up ) {
        // Set the camera's position
        this.eye = eye;

        // Compute the camera's axes
        // w = eye - at
        vec3.subtract(this.w, this.eye, at);
        vec3.normalize(this.w, this.w);
        // u = up x w
        vec3.cross(this.u, up, this.w);
        vec3.normalize(this.u, this.u);
        // v = w x u
        vec3.cross(this.v, this.w, this.u);
        vec3.normalize(this.v, this.v);
    }

    /**
     * Compute and return the view matrix for this camera.  This is the
     * matrix that converts from world coordinates to camera coordinates.
     * 
     * @param {mat4} out the view matrix is written to this parameter 
     */
    getViewMatrix( out ) {
        // The inverse rotation
        mat4.set(this.rotation, 
            this.u[0], this.v[0], this.w[0], 0, 
            this.u[1], this.v[1], this.w[1], 0,
            this.u[2], this.v[2], this.w[2], 0, 
            0, 0, 0, 1);

        // The inverse translation
        this.translation[12] = -this.eye[0];
        this.translation[13] = -this.eye[1];
        this.translation[14] = -this.eye[2];

        // View matrix = inverse rotation * inverse translation
        mat4.multiply(out, this.rotation, this.translation);
    }

    /**
     * Rotates this camera around the camera's u-axis by vertAngle, and
     * around the y-axis by horizAngle.  
     * 
     * @param {Number} horizAngle horizontal rotation angle (radians)
     * @param {Number} vertAngle vertical rotation angle (radians)
     */
    orbit(horizAngle, vertAngle) {
        const m = mat4.create();
        mat4.rotateY(m, m, horizAngle);
        mat4.rotate(m, m, vertAngle, this.u);

        // Rotate the camera position
        vec3.transformMat4(this.eye, this.eye, m );

        // Rotate the camera axes
        mat4.set(this.rotation, 
            this.u[0], this.u[1], this.u[2], 0, 
            this.v[0], this.v[1], this.v[2], 0,
            this.w[0], this.w[1], this.w[2], 0, 
            0, 0, 0, 1);
        mat4.multiply(this.rotation, m, this.rotation);
        this.u[0] = this.rotation[0]; this.u[1] = this.rotation[1]; this.u[2] = this.rotation[2];
        this.v[0] = this.rotation[4]; this.v[1] = this.rotation[5]; this.v[2] = this.rotation[6];
        this.w[0] = this.rotation[8]; this.w[1] = this.rotation[9]; this.w[2] = this.rotation[10];
    }

    /**
     * Rotates the camera's axes (but not its position) around the camera's u-axis
     * by vertAngle and around the y-axis by horizAngle.
     * 
     * @param {Number} horizAngle horizontal rotation angle (radians)
     * @param {Number} vertAngle vertical rotation angle (radians)
     */
    turn( horizAngle, vertAngle ) {
        const m = mat4.create();
        mat4.rotateY(m, m, horizAngle);
        mat4.rotate(m, m, vertAngle, this.u);

        // Rotate the camera axes
        mat4.set(this.rotation, 
            this.u[0], this.u[1], this.u[2], 0, 
            this.v[0], this.v[1], this.v[2], 0,
            this.w[0], this.w[1], this.w[2], 0, 
            0, 0, 0, 1);
        mat4.multiply(this.rotation, m, this.rotation);
        this.u[0] = this.rotation[0]; this.u[1] = this.rotation[1]; this.u[2] = this.rotation[2];
        this.v[0] = this.rotation[4]; this.v[1] = this.rotation[5]; this.v[2] = this.rotation[6];
        this.w[0] = this.rotation[8]; this.w[1] = this.rotation[9]; this.w[2] = this.rotation[10];
    }

    /**
     * Moves the camera's position along the u and v axes without changing
     * the camera's orientation.
     * @param {Number} deltaU distance to move along camera's u axis 
     * @param {Number} deltaV distance to move along camera's v axis
     */
    track( deltaU, deltaV ) {
        vec3.scaleAndAdd(this.eye, this.eye, this.u, deltaU);
        vec3.scaleAndAdd(this.eye, this.eye, this.v, deltaV);
    }

    /**
     * Move the camera's position along the camera's w axis without changing
     * the camera's orientation.
     * 
     * @param {Number} delta distance to move along the camera's w axis 
     */
    dolly( delta ) {
        vec3.scaleAndAdd(this.eye, this.eye, this.w, -delta);
    }
}