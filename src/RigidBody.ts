/* Assignment 2: Hole in the Ground
 * CS 4388/ CS 5388, Fall 2025, Texas State University
 * Instructor: Isayas Berhe Adhanom <isayas@txstate.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'

export class RigidBody extends gfx.Mesh3
{
    // Parameter to approximate downward acceleration due to gravity
    public static gravity = -10;

    // The current velocity of the rigid body
    public velocity: gfx.Vector3;

    // The current radius of the rigid body's collision sphere
    private radius: number;

    constructor(baseMesh: gfx.Mesh3)
    {   
        super();

        // Copy over all the mesh data from the base mesh
        this.positionBuffer = baseMesh.positionBuffer;
        this.normalBuffer = baseMesh.normalBuffer;
        this.colorBuffer = baseMesh.colorBuffer;
        this.indexBuffer = baseMesh.indexBuffer;
        this.texCoordBuffer = baseMesh.texCoordBuffer;
        this.vertexCount = baseMesh.vertexCount;
        this.hasVertexColors = baseMesh.hasVertexColors;
        this.triangleCount = baseMesh.triangleCount;
        this.material = baseMesh.material;
        this.boundingBox = baseMesh.boundingBox;
        this.boundingSphere = baseMesh.boundingSphere;
        this.visible = baseMesh.visible;

        this.velocity = new gfx.Vector3();
        this.radius = baseMesh.boundingSphere.radius;
    }

    update(deltaTime: number): void
    {

        
        // PART 2: RIGID BODY PHYSICS
        // In this part, you should use the formulas described in class to
        // 1. Compute the acceleration vector
        // 2. Update the velocity
        // 3. Update the position
        
        // ADD YOUR CODE HERE

        const acceleration = new gfx.Vector3(0, -9.8, 0);

        // v_new = v_old + a * dt
        const a_dt = gfx.Vector3.multiplyScalar(acceleration, deltaTime);
        this.velocity.add(a_dt);

        // p_new = p_old + v_new * dt
        const v_dt = gfx.Vector3.multiplyScalar(this.velocity, deltaTime);
        this.position.add(v_dt);


    }

    // You can use this method to set the radius of the collision sphere.
    // It will also properly scale the object to appear within the collision sphere.
    setRadius(radius: number): void
    {
        this.radius = radius;
        
        const scaleFactor = this.radius / this.boundingSphere.radius;
        this.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }

    // Get the current radius of the collision sphere.
    getRadius(): number
    {
        return this.radius;
    }
}
