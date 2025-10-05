/* Assignment 2: Hole in the Ground
 * CS 4388/ CS 5388, Fall 2025, Texas State University
 * Instructor: Isayas Berhe Adhanom <isayas@txstate.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'
import { RigidBody } from './RigidBody';

export class App extends gfx.GfxApp
{
    // State variable to store the current stage of the game
    private stage: number;

    // Current hole radius
    private holeRadius: number;

    // Mesh of a ground plane with a hole in it
    private hole: gfx.Mesh3;

    // Template mesh to create sphere instances
    private sphere: gfx.Mesh3;

    // Bounding box that defines the dimensions of the play area
    private playArea: gfx.BoundingBox3;

    // Group that will hold all the rigid bodies currently in the scene
    private rigidBodies: gfx.Node3;  

    // A plane mesh that will be used to display dynamic text
    private textPlane: gfx.Mesh3;

    // A dynamic texture that will be displayed on the plane mesh
    private text: gfx.Text;

    // A sound effect to play when an object falls inside the hole
    private holeSound: HTMLAudioElement;

    // A sound effect to play when the user wins the game
    private winSound: HTMLAudioElement;

    // Vector used to store user input from keyboard or mouse
    private inputVector: gfx.Vector2;


    // --- Create the App class ---
    constructor()
    {
        // initialize the base class gfx.GfxApp
        super();

        this.stage = 0;

        this.holeRadius = 1;
        this.hole = gfx.MeshLoader.loadOBJ('./assets/hole.obj');
        this.sphere = gfx.Geometry3Factory.createSphere(1, 2);

        this.playArea = new gfx.BoundingBox3();
        this.rigidBodies = new gfx.Node3();
        
        this.textPlane = gfx.Geometry3Factory.createPlane();
        this.text = new gfx.Text('press a button to start', 512, 256, '48px Helvetica');
        this.holeSound = new Audio('./assets/hole.mp3');
        this.winSound = new Audio('./assets/win.mp3');

        this.inputVector = new gfx.Vector2();
    }


    // --- Initialize the graphics scene ---
    createScene(): void 
    {
        // Setup the camera projection matrix, position, and look direction.
        // We will learn more about camera models later in this course.
        this.camera.setPerspectiveCamera(60, 1920/1080, 0.1, 50)
        this.camera.position.set(0, 12, 12);
        this.camera.lookAt(gfx.Vector3.ZERO);

        // Create an ambient light that illuminates everything in the scene
        const ambientLight = new gfx.AmbientLight(new gfx.Color(0.3, 0.3, 0.3));
        this.scene.add(ambientLight);

        // Create a directional light that is infinitely far away (sunlight)
        const directionalLight = new gfx.DirectionalLight(new gfx.Color(0.6, 0.6, 0.6));
        directionalLight.position.set(0, 2, 1);
        this.scene.add(directionalLight);

        // Set the hole mesh material color to green
        this.hole.material.setColor(new gfx.Color(83/255, 209/255, 110/255));

        // Create a bounding box for the game
        this.playArea.min.set(-10, 0, -16);
        this.playArea.max.set(10, 30, 8);

        // Position the text plane mesh on the ground
        this.textPlane.position.set(0, 0.1, 4.5);
        this.textPlane.scale.set(16, 8, 1);
        this.textPlane.rotation.setEulerAngles(-Math.PI/2, 0, Math.PI);

        // Set up the dynamic texture for the text plane
        const textMaterial = new gfx.UnlitMaterial();
        textMaterial.texture = this.text;
        this.textPlane.material = textMaterial;

        // Draw lines for the bounding box
        const playBounds = new gfx.Line3();
        playBounds.createFromBox(this.playArea);
        playBounds.color.set(1, 1, 1);
        this.scene.add(playBounds);

        // Add the objects to the scene
        this.scene.add(this.hole);
        this.scene.add(this.textPlane);
        this.scene.add(this.rigidBodies);
    }

    
    // --- Update is called once each frame by the main graphics loop ---
    update(deltaTime: number): void 
    {
        // This code defines the gravity and friction parameters used in the
        // instructor's example implementation. You should not change them
        // for the initial scene because the spheres are placed purposefully
        // to allow you and the TAs to visually check that the physics code
        // is working correctly.  However, you can optionally define different
        // parameters for use in the custom scene that you create in Part 5.

        // The movement speed of the hole in meters / sec
        const holeSpeed = 10;

        // The friction constant will cause physics objects to slow down upon collision
        const frictionSlowDown = 0.9;

        // Hole radius scale factor
        const holeScaleFactor = 1.25;

        // Move hole based on the user input
        this.hole.position.x += this.inputVector.x * holeSpeed * deltaTime;
        this.hole.position.z -= this.inputVector.y * holeSpeed * deltaTime;



        // PART 1: HOLE MO// ADD YOUR CODE HEREVEMENT
        // The code above allows the user to move the hole in the X and Z directions.
        // However, we want to add some boundary checks to prevent the hole from
        // leaving the boundaries, which are defined in the playArea member variable.
        
        // ADD YOUR CODE

        const r = this.holeRadius;

        const minX = this.playArea.min.x + r;
        const maxX = this.playArea.max.x - r;

        const minZ = this.playArea.min.z + r;
        const maxZ = this.playArea.max.z - r;


        if(this.hole.position.x < minX){
            this.hole.position.x = minX;
        }
        if(this.hole.position.x > maxX){
            this.hole.position.x = maxX;
        }

        if(this.hole.position.z < minZ){
            this.hole.position.z = minZ;
        }
        if(this.hole.position.z > maxZ){
            this.hole.position.z = maxZ;
        }



        // Update rigid body physics
        // You do not need to modify this code
        this.rigidBodies.children.forEach((transform: gfx.Node3) => {
            const rb = transform as RigidBody;
            rb.update(deltaTime);
        });

        // Handle object-object collisions
        // You do not need to modify this code
        for(let i=0; i < this.rigidBodies.children.length; i++)
        {
            for(let j=i+1; j < this.rigidBodies.children.length; j++)
            {
                const rb1 = this.rigidBodies.children[i] as RigidBody;
                const rb2 = this.rigidBodies.children[j] as RigidBody;

                this.handleObjectCollision(rb1, rb2, frictionSlowDown)
            }
        }

        // Handle object-environment collisions
        // You do not need to modify this code
        this.rigidBodies.children.forEach((transform: gfx.Node3) => {
            const rb = transform as RigidBody;

            // The object has fallen far enough to score a point
            if(rb.position.y < -10)
            {
                this.holeSound.play(); 

                // Remove the object from the scene
                rb.remove();

                //Check if we captured the last sphere
                if(this.rigidBodies.children.length == 0)
                    this.startNextStage();
                else
                    this.setHoleRadius(this.holeRadius * holeScaleFactor);
            }
            // The object is within range of the hole and can fit inside
            else if(rb.getRadius() < this.holeRadius && rb.position.distanceTo(this.hole.position) < this.holeRadius)
            {
                this.handleRimCollision(rb, frictionSlowDown);
            }
            // The object has not fallen all the way into the hole yet
            else if(rb.position.y + rb.getRadius() > 0)
            {
                this.handleBoundaryCollision(rb, frictionSlowDown);
            }
            
        });
    }

    
    handleBoundaryCollision(rb: RigidBody, frictionSlowDown: number): void
    {


        // PART 3: BOUNDARY COLLISIONS
        
        // As a first step, you should read the explanations about detecting collisions,
        // updating position after a collision, and updating velocity after a collision.
        // The additional reading about rigid body dynamics (linked in the instructions
        // and also posted on Canvas) may also be helpful.

        // In this method, you will need to:
        // 1. Check if the sphere is intersecting each boundary of the play area. 
        // 2. Correct the intersection by adjusting the position of the sphere.
        // 3. Compute the reflected velocity after the collision.
        // 4. Slow down the velocity after the collision due to friction.

        // ADD YOUR CODE HERE

        const restitution = 0.8;    // bounciness
        const r = rb.getRadius();

        // collide with floor only when not over the hole
        if (rb.position.y < r) {
            rb.position.y = r;          // resolve penetration
            if (rb.velocity.y < 0) {
                rb.velocity.y = -rb.velocity.y * restitution; // reflect normal
                // tangential friction along floor
                rb.velocity.x *= frictionSlowDown;
                rb.velocity.z *= frictionSlowDown;
            }
        }

        const minX = this.playArea.min.x + r;
        const maxX = this.playArea.max.x - r;
        const minZ = this.playArea.min.z + r;
        const maxZ = this.playArea.max.z - r;

        // Left wall (x = -10)
        if (rb.position.x < minX) {
            rb.position.x = minX;
            if (rb.velocity.x < 0)
                rb.velocity.x = -rb.velocity.x * restitution;
            rb.velocity.z *= frictionSlowDown;
        }

        // Right wall (x = 10)
        if (rb.position.x > maxX) {
            rb.position.x = maxX;
            if (rb.velocity.x > 0)
                rb.velocity.x = -rb.velocity.x * restitution;
            rb.velocity.z *= frictionSlowDown;
        }

        // Back wall (z = -16)
        if (rb.position.z < minZ) {
            rb.position.z = minZ;
            if (rb.velocity.z < 0)
                rb.velocity.z = -rb.velocity.z * restitution;
            rb.velocity.x *= frictionSlowDown;
        }

        // Front wall (z = 8)
        if (rb.position.z > maxZ) {
            rb.position.z = maxZ;
            if (rb.velocity.z > 0)
                rb.velocity.z = -rb.velocity.z * restitution;
            rb.velocity.x *= frictionSlowDown;
        }


    }


    handleObjectCollision(rb1: RigidBody, rb2: RigidBody, frictionSlowDown: number): void
    {
        

        // PART 4: RIGID BODY COLLISIONS
        // This is the most challenging part of this assignment, so make sure to
        // read all the information described in the instructions.  If you are
        // struggling with understanding the math or have questions about how to 
        // implement the equations, then you should seek help from a TA.

        // ADD YOUR CODE HERE

        const e = 0.8; // restitution (bounciness)

        const rSum = rb1.getRadius() + rb2.getRadius();

        // delta = p2 - p1
        const delta = gfx.Vector3.subtract(rb2.position, rb1.position);
        let dist = delta.length();
        if (dist === 0) { delta.set(1, 0, 0); dist = 1; } // avoid NaN 

        // no collision
        if (dist >= rSum) return;

        // contact normal
        const n = gfx.Vector3.multiplyScalar(delta, 1 / dist);

        // 1) positional correction: push each out by half the overlap
        const overlap = 0.5 * (rSum - dist);
        rb1.position.add(gfx.Vector3.multiplyScalar(n, -overlap));
        rb2.position.add(gfx.Vector3.multiplyScalar(n, +overlap));

        // 2) impulse along the normal (equal masses)
        const rv = gfx.Vector3.subtract(rb2.velocity, rb1.velocity);
        const vAlongN = gfx.Vector3.dot(rv, n);
        if (vAlongN > 0) return; // already separating

        const j = -(1 + e) * vAlongN / 2; // (1/m1 + 1/m2) with m1=m2=1
        const impulse = gfx.Vector3.multiplyScalar(n, j);
        rb1.velocity.subtract(impulse);
        rb2.velocity.add(impulse);

        // 3) simple friction: damp the tangential component only
        const v1n = gfx.Vector3.multiplyScalar(n, gfx.Vector3.dot(rb1.velocity, n));
        const v2n = gfx.Vector3.multiplyScalar(n, gfx.Vector3.dot(rb2.velocity, n));

        const v1t = gfx.Vector3.subtract(rb1.velocity, v1n);
        const v2t = gfx.Vector3.subtract(rb2.velocity, v2n);

        v1t.multiplyScalar(frictionSlowDown);
        v2t.multiplyScalar(frictionSlowDown);

        rb1.velocity.set(v1n.x + v1t.x, v1n.y + v1t.y, v1n.z + v1t.z);
        rb2.velocity.set(v2n.x + v2t.x, v2n.y + v2t.y, v2n.z + v2t.z);


    }


    // This method handles collisions between the rigid body and the rim
    // of the hole. You do not need to modify this code
    handleRimCollision(rb: RigidBody, frictionSlowDown: number): void
    {
        // Compute the rigid body's position, ignoring any vertical displacement
        const rbOnGround = new gfx.Vector3(rb.position.x, 0, rb.position.z);

        // Find the closest point along the rim of the hole
        const rimPoint = gfx.Vector3.subtract(rbOnGround, this.hole.position);
        rimPoint.normalize();
        rimPoint.multiplyScalar(this.holeRadius);
        rimPoint.add(this.hole.position.clone());

        // If the rigid body is colliding with the point on the rim
        if(rb.position.distanceTo(rimPoint) < rb.getRadius())
        {
            // Correct the position of the rigid body so that it is no longer intersecting
            const correctionDistance = rb.getRadius() - rb.position.distanceTo(rimPoint) ;
            const correctionMovement = gfx.Vector3.subtract(rb.position, rimPoint);
            correctionMovement.normalize();
            correctionMovement.multiplyScalar(correctionDistance);
            rb.position.add(correctionMovement);

            // Compute the collision normal
            const rimNormal = gfx.Vector3.subtract(this.hole.position, rimPoint);
            rimNormal.normalize();

            // Reflect the velocity about the collision normal
            rb.velocity.reflect(rimNormal);

            // Slow down the velocity due to friction
            rb.velocity.multiplyScalar(frictionSlowDown);
        }
    }


    // This method advances to the next stage of the game
    startNextStage(): void
    {
        // Create a test scene when the user presses start
        if(this.stage == 0)
        {
            // Do not modify the spheres in this initial test scene.
            // They are used to visually check that the physics code
            // is working correctly during grading.
            
            this.textPlane.visible = false;
            
            const rb1 = new RigidBody(this.sphere);
            rb1.material = new gfx.GouraudMaterial();
            rb1.material.setColor(gfx.Color.RED);
            rb1.position.set(0, 0.25, 7.5);
            rb1.setRadius(0.25);
            rb1.velocity.set(0, 10, -4);
            this.rigidBodies.add(rb1);
    
            const rb2 = new RigidBody(this.sphere);
            rb2.material = new gfx.GouraudMaterial();
            rb2.material.setColor(gfx.Color.GREEN);
            rb2.position.set(-8, 1, -5);
            rb2.setRadius(0.5);
            rb2.velocity.set(4, 0, 0);
            this.rigidBodies.add(rb2);
    
            const rb3 = new RigidBody(this.sphere);
            rb3.material = new gfx.GouraudMaterial();
            rb3.material.setColor(gfx.Color.BLUE);
            rb3.position.set(8, 1, -4.5);
            rb3.setRadius(0.5);
            rb3.velocity.set(-9, 0, 0);
            this.rigidBodies.add(rb3);
    
            const rb4 = new RigidBody(this.sphere);
            rb4.material = new gfx.GouraudMaterial();
            rb4.material.setColor(gfx.Color.YELLOW);
            rb4.position.set(0, 0.25, -12);
            rb4.setRadius(0.5);
            rb4.velocity.set(15, 10, -20);
            this.rigidBodies.add(rb4);
        }
        // The user has finished the test scene
        else if(this.stage == 1)
        {
            this.setHoleRadius(0.5);
            this.hole.position.x = 0;
            this.hole.position.z = 4.4;
            

            // PART 5: CREATE YOUR OWN GAME
            // In this part, you should create your own custom scene!  You should
            // refer the code above to see how rigid bodies were created for the
            // test scene. You have a lot of freedom to create your own game,
            // as long as it meets the minimum requirements in the rubric.  
            // Creativity is encouraged!

            // COMMENT OUT THIS CODE
            this.text.text = 'ROUND 2!';
            this.text.updateTextureImage();
            this.textPlane.visible = true;

            // ADD YOUR CODE HERE

            const rb1 = new RigidBody(this.sphere);
            rb1.material = new gfx.GouraudMaterial();
            rb1.material.setColor(gfx.Color.RED);
            rb1.position.set(0, 0.25, 7.5);
            rb1.setRadius(0.25);
            rb1.velocity.set(0, 10, -4);
            this.rigidBodies.add(rb1);
    
            const rb2 = new RigidBody(this.sphere);
            rb2.material = new gfx.GouraudMaterial();
            rb2.material.setColor(gfx.Color.GREEN);
            rb2.position.set(-8, 1, -5);
            rb2.setRadius(0.6);
            rb2.velocity.set(9, 0, 0);
            this.rigidBodies.add(rb2);
    
            const rb3 = new RigidBody(this.sphere);
            rb3.material = new gfx.GouraudMaterial();
            rb3.material.setColor(gfx.Color.BLUE);
            rb3.position.set(8, 1, -5);
            rb3.setRadius(1.1);
            rb3.velocity.set(-9, 0, 0);
            this.rigidBodies.add(rb3);
    
            const rb4 = new RigidBody(this.sphere);
            rb4.material = new gfx.GouraudMaterial();
            rb4.material.setColor(gfx.Color.YELLOW);
            rb4.position.set(0, 0.25, -12);
            rb4.setRadius(0.4);
            rb4.velocity.set(15, 10, -30);
            this.rigidBodies.add(rb4);

            
            const rb5 = new RigidBody(this.sphere);
            rb5.material = new gfx.GouraudMaterial();
            rb5.material.setColor(gfx.Color.PURPLE);
            rb5.position.set(0, 1, 9);
            rb5.setRadius(0.9);
            rb5.velocity.set(0, 10, -4);
            this.rigidBodies.add(rb5);
    
            const rb6 = new RigidBody(this.sphere);
            rb6.material = new gfx.GouraudMaterial();
            rb6.material.setColor(gfx.Color.CYAN);
            rb6.position.set(0, 1, 4.4);
            rb6.setRadius(0.3);
            rb6.velocity.set(1, 0, 0);
            this.rigidBodies.add(rb6);
    
            const rb7 = new RigidBody(this.sphere);
            rb7.material = new gfx.GouraudMaterial();
            rb7.material.setColor(gfx.Color.BLACK);
            rb7.position.set(8, 8, -2);
            rb7.setRadius(1.5);
            rb7.velocity.set(-9, 0, 0);
            this.rigidBodies.add(rb7);
    
            const rb8 = new RigidBody(this.sphere);
            rb8.material = new gfx.GouraudMaterial();
            rb8.material.setColor(gfx.Color.WHITE);
            rb8.position.set(4, 0.3, -2);
            rb8.setRadius(1);
            rb8.velocity.set(15, 10, -15);
            this.rigidBodies.add(rb8);

            const rb9 = new RigidBody(this.sphere);
            rb9.material = new gfx.GouraudMaterial();
            rb9.material.setColor(gfx.Color.BLACK);
            rb9.position.set(0, 0.25, -20);
            rb9.setRadius(0.5);
            rb9.velocity.set(15, 10, -30);
            this.rigidBodies.add(rb9);


        }
        // The user has finished the game
        else
        {
            this.text.text = 'YOU WIN!';
            this.text.updateTextureImage();
            this.textPlane.visible = true;
            this.winSound.play();
        }

        this.stage++;
    }


    // Set the radius of the hole and update the scale of the
    // hole mesh so that it is displayed at the correct size.
    setHoleRadius(radius: number): void
    {
        this.holeRadius = radius;
        this.hole.scale.set(radius, 1, radius);
    }


    // Set the x or y components of the input vector when either
    // the WASD or arrow keys are pressed.
    onKeyDown(event: KeyboardEvent): void 
    {
        if(event.key == 'w' || event.key == 'ArrowUp')
            this.inputVector.y = 1;
        else if(event.key == 's' || event.key == 'ArrowDown')
            this.inputVector.y = -1;
        else if(event.key == 'a' || event.key == 'ArrowLeft')
            this.inputVector.x = -1;
        else if(event.key == 'd' || event.key == 'ArrowRight')
            this.inputVector.x = 1;
    }


    // Reset the x or y components of the input vector when either
    // the WASD or arrow keys are released.
    onKeyUp(event: KeyboardEvent): void 
    {
        if((event.key == 'w' || event.key == 'ArrowUp') && this.inputVector.y == 1)
            this.inputVector.y = 0;
        else if((event.key == 's' || event.key == 'ArrowDown') && this.inputVector.y == -1)
            this.inputVector.y = 0;
        else if((event.key == 'a' || event.key == 'ArrowLeft')  && this.inputVector.x == -1)
            this.inputVector.x = 0;
        else if((event.key == 'd' || event.key == 'ArrowRight')  && this.inputVector.x == 1)
            this.inputVector.x = 0;
    }


    // These mouse events are not necessary to play the game on a computer. However, they
    // are included so that the game is playable on touch screen devices without a keyboard.
    onMouseMove(event: MouseEvent): void 
    {
        // Only update the mouse position if only the left button is currently pressed down
        if(event.buttons == 1)
        {
            const mouseCoordinates = this.getNormalizedDeviceCoordinates(event.x, event.y);

            if(mouseCoordinates.x < -0.5)
                this.inputVector.x = -1;
            else if(mouseCoordinates.x > 0.5)
                this.inputVector.x = 1;

            if(mouseCoordinates.y < -0.5)
                this.inputVector.y = -1;
            else if(mouseCoordinates.y > 0.5)
                this.inputVector.y = 1;
        }
    }


    onMouseUp(event: MouseEvent): void
    {
        // Left mouse button
        if(event.button == 0)
            this.inputVector.set(0, 0);
    }


    onMouseDown(event: MouseEvent): void 
    {
        if(this.stage==0)
            this.startNextStage();
        else
            this.onMouseMove(event);
    }
}