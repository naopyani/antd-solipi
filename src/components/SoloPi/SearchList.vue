<template>
  <div id="components-form-demo-advanced-search">
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
        <a-col :span="4" :style="{ textAlign: 'right' }">
          <div class="clearfix">
            <a-upload :fileList="fileList" :remove="handleRemove" :beforeUpload="beforeUpload">
              <a-button>
                <a-icon type="select" />选择文件
              </a-button>
            </a-upload>
          </div>
        </a-col>
        <a-col :span="3" :style="{ textAlign: 'left' }">
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
        <a-col :span="8" :style="{ textAlign: 'left' }">
          <a-button @click="handleReset">
            <a-icon type="download" />下载文件
          </a-button>
        </a-col>
      </a-row>
    </a-form>
    <div class="search-result-list">
      <a-table
        :columns="columns"
        :rowKey="record => record.id"
        :dataSource="data"
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
      >
        <template slot="name" slot-scope="name">{{name.first}} {{name.last}}</template>
      </a-table>
    </div>
  </div>
</template>
<script>
import reqwest from "reqwest";
const columns = [
  {
    title: "ID",
    dataIndex: "id",
    width: "20%"
  },
  {
    title: "NAME",
    dataIndex: "name",
    width: "20%"
  },
  {
    title: "用例描述",
    dataIndex: "description"
  },
  {
    title: "最近更新时间",
    dataIndex: "addtime"
  }
];

export default {
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
      columns,
      fileList: [],
      uploading: false
    };
  },
  computed: {
    count() {
      return this.expand ? 11 : 7;
    }
  },
  methods: {
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
        formData.append("files[]", file);
      });
      // eslint-disable-next-line no-console
      console.log(fileList);
      this.uploading = true;

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
      });
    },

    handleReset() {
      this.form.resetFields();
    },
    handleTableChange(pagination, filters, sorter) {
      // // eslint-disable-next-line no-console
      // console.log("你");
      // // eslint-disable-next-line no-console
      // console.log(pagination);
      // eslint-disable-next-line no-console
      const pager = { ...this.pagination };
      // // eslint-disable-next-line no-console
      // console.log(pager);
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
      this.loading = true;
      reqwest({
        // url: "https://randomuser.me/api/",
        url: "http://127.0.0.1:5000/splist/",
        method: "get",
        data: {
          results: 10
        },
        type: "json"
      }).then(data => {
        // eslint-disable-next-line no-console
        console.log(data);
        const pagination = { ...this.pagination };
        // Read total count from server
        // pagination.total = data.totalCount;
        pagination.total = 10;
        this.loading = false;
        this.data = data;
        // eslint-disable-next-line no-console
        console.log(this.data);
        this.pagination = pagination;
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