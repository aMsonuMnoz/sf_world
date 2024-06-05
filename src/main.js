import * as THREE from 'three';
import { init, animate } from './game';
import { setupSocket } from './socket';

document.addEventListener('DOMContentLoaded', () => {
  init();
  animate();
  setupSocket();
});