import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import GraphsView from '@/views/GraphsView.vue'
import HooksConnectionView from '@/views/HooksConnectionView.vue'
import HistoryView from '@/views/HistoryView.vue'

declare module 'vue-router' {
  interface RouteMeta {
    // Label shown in the sidebar
    title?: string
    // PrimeIcons class, e.g. 'pi pi-sitemap'
    icon?: string
    // Whether this route gets its own sidebar entry
    nav?: boolean
    // Full-bleed routes (e.g. the editor) render without the sidebar
    hideSidebar?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/graphs'
  },
  {
    path: '/graphs',
    name: 'graphs',
    component: GraphsView,
    meta: { title: 'Graphs', icon: 'pi pi-sitemap', nav: true }
  },
  {
    path: '/graphs/:id',
    name: 'graph-editor',
    // Lazy loaded - keeps the Baklava editor out of the initial bundle
    component: () => import('@/views/GraphEditorView.vue'),
    props: true,
    meta: { title: 'Editor', hideSidebar: true }
  },
  {
    path: '/hooks',
    name: 'hooks',
    component: HooksConnectionView,
    meta: { title: 'Hooks', icon: 'pi pi-link', nav: true }
  },
  {
    path: '/history',
    name: 'history',
    component: HistoryView,
    meta: { title: 'History', icon: 'pi pi-history', nav: true }
  }
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
