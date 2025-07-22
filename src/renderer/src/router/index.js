import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/pano-create/create-pano.vue'

const routes = [
  {
    path: '/',
    name: 'createPano',
    component: Home
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
