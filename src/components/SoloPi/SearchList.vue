<template>
  <a-row>
    <a-col :xs="2" :sm="3" :md="4">
      <sptree @getPath="getCurrentPath" @searchDetail="searchDetail" ref="sptree"></sptree>
    </a-col>
    <a-col :xs="22" :sm="21" :md="20">
      <div id="components-form-demo-advanced-search" :span="18">
        <a-form class="ant-advanced-search-form" :form="form" @submit="handleSearch">
          <a-row :gutter="24">
            <a-col
                    v-for="(item,i) in searchName"
                    :key="i"
                    :span="6"
                    :style="{ display: i < count ? 'block' : 'none' }"
            >
              <a-form-item :label="item">
                <a-input v-decorator="[
                item
              ]" :placeholder="item" />
              </a-form-item>
            </a-col>
            <a-col :span="6" :style="{ textAlign: 'right' }">
              <a-button type="primary" html-type="submit">查询</a-button>
              <a-button :style="{ marginLeft: '8px' }" @click="handleReset">清空</a-button>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="22" :style="{ textAlign: 'right' }">
              <div class="clearfix">
                <a-upload :fileList="fileList" :remove="handleRemove" :beforeUpload="beforeUpload">
                  <a-button>
                    <a-icon type="select" />选择文件
                  </a-button>
                </a-upload>
              </div>
            </a-col>
            <a-col :span="2" :style="{ textAlign: 'left' }">
              <div class="clearfix">
                <a-button
                        type="primary"
                        @click="handleUpload"
                        :disabled="fileList.length === 0"
                        :loading="uploading"
                >
                  <a-icon type="upload" />
                  {{uploading ? '上传中' : '上传文件' }}
                </a-button>
              </div>
            </a-col>
          </a-row>
        </a-form>
        <div class="search-result-list">
          <a-table
                  :rowKey="record => record.id"
                  :dataSource="data"
                  :pagination="pagination"
                  :loading="loading"
                  @change="handleTableChange"
          >
            <a-table-column title="ID" data-index="id" key="id" />
            <a-table-column title="NAME" data-index="name" key="name" />
            <a-table-column title="用例描述" data-index="description" key="description" />
            <a-table-column title="最近更新时间" data-index="addtime" key="addtime" />
            <a-table-column title="操作" key="operation">
              <template slot-scope="text, record">
                <span>
                  <a type="primary" @click="showModal(record)">查看详情</a>
                  <a-modal
                          title="详情"
                          :footer="null"
                          v-model="visible"
                          width="60%"
                          :mask="true"
                          :maskClosable="false"
                          :maskStyle="{opacity: 0.2, background: '#fbfbfb'}"
                  >
                    <pre>{{ viewDetailData }}</pre>
                  </a-modal>
                  <a-divider type="vertical" />
                  <a-popconfirm v-if="data.length" title="确定删除?" @confirm="del(record)">
                    <a href="javascript:;">删除</a>
                  </a-popconfirm>
                  <a-divider type="vertical" />
                  <a @click="downloadSP(record)">下载</a>
                </span>
              </template>
            </a-table-column>
          </a-table>
        </div>
      </div>
    </a-col>
  </a-row>
</template>
<script>
  import reqwest from "reqwest";
  import FileSaver from "file-saver";
  import sptree from "./SPTree.vue";

  export default {
    components: {
      sptree
    },
    mounted() {
      this.fetch();
    },
    data() {
      return {
        expand: false,
        form: this.$form.createForm(this, { name: "advanced_search" }),
        searchName: ["ID", "NAME", "用例描述"],
        data: [],
        pagination: {},
        loading: false,
        fileList: [],
        uploading: false,
        searchData: {},
        viewDetailData: {},
        visible: false,
        currentPath: "SoloPi"
      };
    },
    computed: {
      count() {
        return this.expand ? 11 : 7;
      }
    },
    methods: {
      // 把子组重的值传递给父组件
      getCurrentPath(path) {
        // eslint-disable-next-line no-console
        console.log("此时父组件当前路径为", path);
        this.currentPath = path;
      },
      downloadSP(record) {
        if (this.currentPath.indexOf(".json") != -1) {
          return this.$message.error("请在左侧选择该文件的父级目录！");
        }
        var that = this;
        that.loading = true;
        // eslint-disable-next-line no-console
        console.log(record);
        that.loading = true;
        reqwest({
          url: "http://127.0.0.1:5000/splist/downloadsp",
          method: "get",
          contentType: false, //必须false才会自动加上正确的Content-Type
          data: {
            name: record.name.replace(".json", ""),
            path: this.currentPath
          }
        }).then(data => {
          that.loading = false;
          // eslint-disable-next-line no-console
          console.log(data);
          if (data.msg) {
            return this.$message.error(data.msg);
          }
          const dataJson = JSON.stringify(data);
          // 导出文件
          const blob = new Blob([dataJson], { type: "" });
          FileSaver.saveAs(blob, record.name);
          this.$message.success(record.name + "下载成功！");
        });
      },
      showModal(record) {
        if (this.currentPath.indexOf(".json") != -1) {
          return this.$message.error("请在左侧选择该文件的父级目录！");
        }
        // eslint-disable-next-line no-console
        console.log(record);
        this.loading = true;
        reqwest({
          url: "http://127.0.0.1:5000/splist/viewdetail",
          method: "post",
          contentType: false, //必须false才会自动加上正确的Content-Type
          data: {
            name: record.name,
            path: this.currentPath
          }
        }).then(data => {
          // eslint-disable-next-line no-console
          console.log(data);
          this.loading = false;
          this.visible = true;
          this.viewDetailData = JSON.stringify(data, null, 4);
        });
      },
      del(record) {
        if (this.currentPath.indexOf(".json") != -1) {
          return this.$message.error("请在左侧选择该文件的父级目录！");
        }
        reqwest({
          url: "http://127.0.0.1:5000/splist/dellist/",
          method: "get",
          contentType: false,
          data: {
            id: record.id,
            name: record.name,
            path: this.currentPath
          },
          type: "json"
        }).then(data => {
          // eslint-disable-next-line no-console
          console.log(data.msg);
          this.$message.success(data.msg);
          this.$refs.sptree.refresh();
          this.searchDetail();
        });
      },
      handleRemove(file) {
        const index = this.fileList.indexOf(file);
        const newFileList = this.fileList.slice();
        newFileList.splice(index, 1);
        this.fileList = newFileList;
      },
      beforeUpload(file) {
        // eslint-disable-next-line no-console
        console.log("看一眼data");
        // eslint-disable-next-line no-console
        console.log(this.data);
        // eslint-disable-next-line no-console
        console.log(file);
        var dataName = [];
        var s = 0;
        for (s = 0; s < this.data.length; s++) {
          dataName[s] = this.data[s]["name"];
        }
        if (dataName.indexOf(file.name) != -1) {
          this.$message.error("该" + file.name + "已经存在请重新上传！");
          this.fileList = [...this.fileList];
        } else {
          this.fileList = [...this.fileList, file];
        }
        return false;
      },
      handleUpload() {
        const { fileList } = this;
        const formData = new FormData();
        fileList.forEach(file => {
          formData.append("files", file);
          formData.append("path", this.currentPath);
        });
        // eslint-disable-next-line no-console
        console.log(fileList);
        this.uploading = true;
        // eslint-disable-next-line no-console
        console.log(formData);
        // You can use any AJAX library you like
        reqwest({
          url: "http://127.0.0.1:5000/upload",
          method: "post",
          processData: false, //必须false才会避开jQuery对 formdata 的默认处理
          contentType: false, //必须false才会自动加上正确的Content-Type
          data: formData,
          success: () => {
            this.fileList = [];
            this.uploading = false;
            this.$message.success("上传成功！");
            this.$refs.sptree.refresh();
            this.searchDetail();
          },
          error: () => {
            this.uploading = false;
            this.$message.error("上传失败！");
          }
        });
      },
      handleSearch(e) {
        e.preventDefault();
        this.form.validateFields((error, values) => {
          // eslint-disable-next-line no-console
          console.log("error", error);
          // eslint-disable-next-line no-console
          console.log("Received values of form: ", values);
          this.searchData["id"] = this.paseStr(values["ID"]);
          this.searchData["name"] = this.paseStr(values["NAME"]);
          this.searchData["description"] = this.paseStr(values["用例描述"]);
          this.searchData["path"] = this.currentPath;
          // eslint-disable-next-line no-console
          console.log(this.searchData);
          this.searchDetail(this.searchData);
        });
      },

      handleReset() {
        this.form.resetFields();
      },
      handleTableChange(pagination, filters, sorter) {
        const pager = { ...this.pagination };
        pager.current = pagination.current;
        this.pagination = pager;
        this.fetch({
          results: pagination.pageSize,
          page: pagination.current,
          sortField: sorter.field,
          sortOrder: sorter.order,
          ...filters
        });
      },
      fetch(params = {}) {
        // eslint-disable-next-line no-console
        console.log("params:", params);
        this.searchDetail();
      },
      paseStr(str) {
        if (str === undefined) {
          return "";
        }
        return str;
      },
      searchDetail(
              searchdict = { id: "", name: "", description: "", path: this.currentPath }
      ) {
        this.loading = true;
        reqwest({
          url: "http://127.0.0.1:5000/splist/searchlist",
          method: "post",
          contentType: false, //必须false才会自动加上正确的Content-Type
          data: {
            results: searchdict
          },
          success: data => {
            // eslint-disable-next-line no-console
            console.log(data);
            const pagination = { ...this.pagination };
            // Read total count from server
            // pagination.total = data.totalCount;
            pagination.total = 10;
            this.data = data;
            this.loading = false;
            // eslint-disable-next-line no-console
            console.log(this.data);
            this.pagination = pagination;
            this.form.resetFields();
          }
        });
      }
    }
  };
</script>
<style>
  .ant-advanced-search-form {
    padding: 24px;
    background: #fbfbfb;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
  }

  .ant-advanced-search-form .ant-form-item {
    display: flex;
  }

  .ant-advanced-search-form .ant-form-item-control-wrapper {
    flex: 1;
  }

  #components-form-demo-advanced-search .ant-form {
    max-width: none;
  }
  #components-form-demo-advanced-search .search-result-list {
    margin-top: 0px;
    border: 1px dashed #e9e9e9;
    border-radius: 6px;
    background-color: #fafafa;
    min-height: 200px;
    text-align: center;
    padding-top: 0px;
  }
</style>