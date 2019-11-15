<template>
  <a-layout id="components-layout-demo-custom-trigger">
    <a-layout-sider
            :trigger="null"
            collapsible
            v-model="collapsed"
            :style="{ overflow: 'auto', height: '100vh', left: 0 }"
    >
      <div class="logo" />
      <a-menu theme="dark" mode="inline"  @openChange="onOpenChange" :openKeys="openKeys">
        <a-sub-menu key="solopi">
          <span slot="title">
            <a-icon type="android" theme="filled" />
            <span>SoloPi模块</span>
          </span>
          <a-menu-item key="1"><router-link to="/solopilist">用例列表</router-link></a-menu-item>
          <a-menu-item key="2"><router-link to="/XXX">XXX</router-link></a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="UIauto">
          <span slot="title">
            <a-icon type="thunderbolt" theme="filled" />
            <span>自动化模块</span>
          </span>
          <a-menu-item key="3"><router-link to="/XXX">XXX</router-link></a-menu-item>
          <a-menu-item key="4"><router-link to="/XXX">XXX</router-link></a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0">
        <a-icon
                class="trigger"
                :type="collapsed ? 'menu-unfold' : 'menu-fold'"
                @click="()=> collapsed = !collapsed"
        />
      </a-layout-header>
      <a-layout-content
              :style="{ margin: '24px 16px', padding: '24px', background: '#fff', minHeight: '280px' }"
      >
        <router-view></router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script>
  export default {
    data() {
      return {
        collapsed: false,
        rootSubmenuKeys: ["solopi", "UIauto"],
        openKeys: ["solopi"]
      };
    },
    methods: {
      // 点击菜单，收起其他展开的所有菜单，保持菜单聚焦简洁
      onOpenChange(openKeys) {
        const latestOpenKey = openKeys.find(
                key => this.openKeys.indexOf(key) === -1
        );
        if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
          this.openKeys = openKeys;
        } else {
          this.openKeys = latestOpenKey ? [latestOpenKey] : [];
        }
      }
    }
  };
</script>
<style>
  #components-layout-demo-custom-trigger .trigger {
    font-size: 18px;
    line-height: 64px;
    padding: 0 24px;
    cursor: pointer;
    transition: color 0.3s;
  }

  #components-layout-demo-custom-trigger .trigger:hover {
    color: #1890ff;
  }

  #components-layout-demo-custom-trigger .logo {
    height: 32px;
    background: rgba(255, 255, 255, 0.2);
    margin: 16px;
  }
</style>
