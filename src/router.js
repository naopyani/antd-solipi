import VueRouter from 'vue-router'
import Home from './components/Home.vue'
import SearchList from './components/SoloPi/SearchList.vue'
import XXX from './components/SoloPi/XXX.vue'

var router = new VueRouter({
    routes: [
        {
            path: '/', component: Home
        },
        {
            path: '/solopilist', component: SearchList
        }
        ,
        {
            path: '/XXX', component: XXX
        }
    ]
})

export default router