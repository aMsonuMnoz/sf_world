import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { Vector3, Raycaster, ArrowHelper, Quaternion, Euler } from 'three';
import { scene } from './game';

let moveForward = false, 
moveBackward = false, 
moveLeft = false, 
moveRight = false,
moveUp = false,
moveDown = false;

const velocity = new Vector3();
const direction = new Vector3();
const playerDirection = new Vector3();
const playerRotation = new Vector3();
const quaternion = new Quaternion();

const raycaster = new Raycaster();
raycaster.far = 2;

const groundRaycaster = new Raycaster();
groundRaycaster.ray.direction.set(0,-1,0);
groundRaycaster.far = 5;

//Params ------------------
const playerHeight = 1.5;
const gravity = 1;
const movementSpeed = 100;
const damperFactor = 10;
const jumpHeight = 1;
//Params ------------------


export default class Controls {
    constructor (camera, domElement, collidables) {
        this.collidables = collidables;
        this.controls = new PointerLockControls(camera, domElement);
        const input = document.getElementById("input");
        let isLocked = false;
    
        const instructions = document.getElementById('instructions');
        instructions.addEventListener('click', () => {
            this.controls.lock();
        })
    
        this.controls.addEventListener('lock', () => {
            instructions.style.display = 'none';
            isLocked = true;
        })
    
        this.controls.addEventListener('unlock', () => {
            instructions.style.display = '';
            isLocked=false;
        })
    
    
        document.addEventListener('keydown', (event) =>{
            // if(event.key === 't' || event.key === 'T'){
            //     controls.unlock();
            // }
            if(event.key === 'Escape'){
                event.preventDefault();
            }
            if(!isLocked){
                return;
            }
            if(document.activeElement === input){
                return;
            }
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    moveForward = true;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    moveLeft = true;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    moveBackward = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    moveRight = true;
                    break;
                case 'Space':
                    moveUp = true;
                    break;
                case 'ShiftLeft':
                    moveDown = true;
                    break;
            }
        });
    
        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    moveForward = false;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    moveLeft = false;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    moveBackward = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    moveRight = false;
                    break;
                case 'Space':
                    moveUp = false;
                    break;
                case 'ShiftLeft':
                    moveDown = false;
                    break;
            }
        });


    }

    update (deltaTime) {
        if (this.controls.isLocked) {
            velocity.x -= velocity.x * damperFactor * deltaTime;
            velocity.y -= velocity.y * damperFactor * deltaTime;
            velocity.z -= velocity.z * damperFactor * deltaTime;
            direction.z = Number(moveForward) - Number(moveBackward);
            direction.x = Number(moveRight) - Number(moveLeft);
            direction.y = Number(moveUp) - Number(moveDown);
            direction.normalize();

            playerRotation.x = this.controls.getObject().rotation.x;
            playerRotation.z = this.controls.getObject().rotation.z;
            playerRotation.y = this.controls.getObject().rotation.y;

            playerDirection.x = direction.x;
            playerDirection.y = direction.y;
            playerDirection.z = -direction.z;

            quaternion.setFromEuler(new Euler(playerRotation.x, playerRotation.y, playerRotation.z));
            playerDirection.applyQuaternion(quaternion);
 

            if (moveForward || moveBackward) {
                let potentialZ = velocity.z -= direction.z * movementSpeed * deltaTime;
                this.updateXZRaycasters(playerDirection);
                if (!this.checkCollision(raycaster)) {
                    velocity.z = potentialZ;
                }
                else{
                    velocity.z = 0;
                }
            }
            if (moveLeft || moveRight) {
                let potentialX = velocity.x -= direction.x * movementSpeed * deltaTime;
                this.updateXZRaycasters(playerDirection);
                if (!this.checkCollision(raycaster)) {
                    velocity.x = potentialX;
                }
                else{
                    velocity.x = 0;
                }
            }

            this.checkGroundCollision();


            // Fly Controls
            // if (moveUp || moveDown) {
            //     let potentialY = velocity.y -= direction.y * movementSpeed * deltaTime;
            //     if (!this.checkCollision(playerDirection)) {
            //         velocity.y = potentialY;
            //     }
            //     else{
            //         velocity.y = 0;
            //     }
            // }

            this.controls.moveRight(-velocity.x * deltaTime);
            this.controls.moveForward(-velocity.z * deltaTime);
            this.controls.getObject().position.y -= velocity.y * deltaTime;
        }
    }

    checkCollision(raycaster) {

        this.arrowHelper(raycaster);
        const intersections = raycaster.intersectObjects(this.collidables);
        if (intersections.length > 0) {
            return true;
        }
        return false;
    }

    checkGroundCollision() {
        groundRaycaster.ray.origin.copy(this.controls.getObject().position);
        groundRaycaster.ray.origin.y += 1;
        const gIntersections = groundRaycaster.intersectObjects(this.collidables);
        if (gIntersections.length > 0) {
            const distanceToGround = gIntersections[0].distance;

            if (distanceToGround < playerHeight) {
                this.controls.getObject().position.y -= distanceToGround - playerHeight;
            }
            else if (distanceToGround > playerHeight) {
                this.controls.getObject().position.y += playerHeight - distanceToGround;
            }
        }
        else {
            this.controls.getObject().position.y -= gravity;
        }
    }

    updateXZRaycasters(directionVector) {
        raycaster.ray.origin.copy(this.controls.getObject().position);
        raycaster.ray.origin.y += 1;
        raycaster.ray.direction.copy(directionVector);
        raycaster.ray.direction.y = 0;
    }


    arrowHelper(raycaster) {
            // The direction vector needs to be normalized for the ArrowHelper
            const dir = raycaster.ray.direction.clone().normalize();
            const origin = raycaster.ray.origin;
            const length = raycaster.far || 10; // Default length to 10 if raycaster.far is not set
            const hex = 0x000000;
        
            // Create an arrow helper to visualize the ray
            const arrowHelper = new ArrowHelper(dir, origin, length, hex);
            scene.add(arrowHelper);
        
            // Optional: Remove the helper after a certain duration
            setTimeout(() => scene.remove(arrowHelper), 2 * 1000);
    }
}