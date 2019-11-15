<template>
    <div>
        <a-form id="operDir" :form="form" @submit="addDir">
            <a-form-item label="目录" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                <a-input v-decorator="['list']"/>
            </a-form-item>
            <a-form-item :wrapper-col="{offset: 8}">
                <a-button :wrapper-col="{ span: 6}" type="primary" html-type="submit">新增目录</a-button>
                <a-button :wrapper-col="{ span: 6}" :style="{ marginLeft: '2px' }" @click="delDir">删除目录</a-button>
            </a-form-item>
        </a-form>
        <a-directory-tree
                :loadData="onLoadData"
                :treeData="treeData"
                id="spTree"
                :defaultSelectedKeys="['SoloPi']"
                @select="this.onSelect"
                @check="this.onCheck"
                v-if="reFresh"
        ></a-directory-tree>
    </div>
</template>

<script>
    import reqwest from "reqwest";

    export default {
        data() {
            return {
                treeData: [{title: "SoloPi", key: "SoloPi"}],
                form: this.$form.createForm(this, {name: "coordinated"}),
                currentPath: "SoloPi",
                reFresh: true
            };
        },
        methods: {
            delDir() {
                if (!this.currentPath) {
                    return this.$message.error("请先选择要删除的目录！");
                }
                reqwest({
                    url: "http://127.0.0.1:5000/splist/deldirsp",
                    method: "post",
                    contentType: false, //必须false才会自动加上正确的Content-Type
                    data: {
                        path: this.currentPath
                    }
                }).then(data => {
                    // eslint-disable-next-line no-console
                    console.log(data);
                    if (data.code === 1) {
                        return this.$message.error(this.currentPath + data.msg);
                    }
                    this.$message.success(this.currentPath + data.msg);
                    this.refresh();
                });
            },
            addDir(e) {
                e.preventDefault();
                this.form.validateFields((err, values) => {
                    if (!err) {
                        // eslint-disable-next-line no-console
                        console.log("Received values of form: ", values);
                        if (!values.list) {
                            return this.$message.error("输入需要新增目录！");
                        }
                        if (!this.currentPath) {
                            return this.$message.error("请先选择一个目录！");
                        }
                        // // eslint-disable-next-line no-console
                        // console.log("当前目录：", this.currentPath);
                        if (this.currentPath.indexOf(".json") != -1) {
                            return this.$message.error("文件不允许新增目录！");
                        }
                        var addPath = this.currentPath + "/" + values.list;
                        // eslint-disable-next-line no-console
                        console.log("新增目录：", addPath);
                        reqwest({
                            url: "http://127.0.0.1:5000/splist/adddirsp",
                            method: "post",
                            contentType: false, //必须false才会自动加上正确的Content-Type
                            data: {
                                path: addPath
                            }
                        }).then(data => {
                            // eslint-disable-next-line no-console
                            console.log(data);
                            // 重置表单
                            this.form.resetFields();
                            if (data.code === 1) {
                                return this.$message.error(addPath + data.msg);
                            }
                            this.$message.success(addPath + data.msg);
                        });
                        // 刷新树状图
                        this.refresh();
                    }
                });
            },
            onSelect(selectedKeys, info) {
                // eslint-disable-next-line no-console
                console.log("selected", selectedKeys[0], info);
                this.currentPath = selectedKeys[0];
                // 传递给父组件值
                this.$emit("getPath", this.currentPath);
                if (this.currentPath.indexOf(".json") == -1) {
                    this.$emit("searchDetail");
                }
            },
            onCheck(checkedKeys, info) {
                // eslint-disable-next-line no-console
                console.log("onCheck", checkedKeys, info);
            },
            onLoadData(treeNode) {
                // eslint-disable-next-line no-console
                console.log("看看", treeNode);
                // eslint-disable-next-line no-console
                console.log(treeNode.eventKey);
                // treeNode.dataRef.slots.icon = "folder-open"
                return new Promise(resolve => {
                    if (treeNode.dataRef.children) {
                        resolve();
                        return;
                    }
                    setTimeout(() => {
                        // // 去请求接口
                        // // eslint-disable-next-line no-console
                        // console.log("什么时候在这有数");
                        // // eslint-disable-next-line no-console
                        // console.log(treeNode.dataRef);
                        reqwest({
                            url: "http://127.0.0.1:5000/splist/getdirsp",
                            method: "post",
                            contentType: false, //必须false才会自动加上正确的Content-Type
                            data: {
                                path: treeNode.eventKey
                            }
                        }).then(data => {
                            // eslint-disable-next-line no-console
                            console.log(data.filelist);
                            treeNode.dataRef.children = data.filelist;
                            this.treeData = [...this.treeData];
                        });
                        resolve();
                    }, 1000);
                });
            },
            refresh() {
                this.reFresh = false;
                this.$nextTick(() => {
                    this.treeData = [{title: "SoloPi", key: "SoloPi"}];
                    this.currentPath = "SoloPi";
                    this.reFresh = true;
                });
                this.currentPath = "";
            }
        }
    };
</script>

<style scoped>
    #spTree {
        overflow: auto;
        margin-top: 0px;
        border: 1px dashed #e9e9e9;
        border-radius: 6px;
        background-color: #fafafa;
        min-height: 200px;
        text-align: left;
        padding-top: 0px;
    }

    #operDir {
        padding: 1px;
        background: #fbfbfb;
        border: 1px solid #d9d9d9;
        border-radius: 6px;
    }
</style>