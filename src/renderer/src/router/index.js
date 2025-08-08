import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@renderer/views/layout/index.vue'
import SceneCreate from '@renderer/views/scene/scene-create/index.vue'
import SceneManage from '@renderer/views/scene/index.vue'
import System from '@renderer/views/system/index.vue'

const routes = [
  {
    path: '/',
    name: 'layout',
    component: Layout,
    children: [
      {
        path: '/sceneManage',
        name: 'sceneManage',
        component: SceneManage
      },
      {
        path: '/system',
        name: 'system',
        component: System
      },
    ]
  },
  {
    path: '/sceneCreate',
    name: 'sceneCreate',
    component: SceneCreate
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
