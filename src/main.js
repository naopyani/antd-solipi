import Vue from 'vue'
import 'ant-design-vue/dist/antd.less'
import App from './App.vue'
import Antd from "ant-design-vue";
import VueRouter from 'vue-router'
// 2. 手动安装 VueRouter 
Vue.use(VueRouter)
Vue.use(Antd)
Vue.config.productionTip = false

import router from './router.js'

new Vue({
    render: h => h(App),
    router
}).$mount('#app')
