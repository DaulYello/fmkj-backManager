<style lang="less">
    @import '../../styles/common.less';
    @import '../../styles/table/table.less';
</style>

<template>
    <div>
        <Row class="margin-top-10">
            <Col>
                <Card>
                    <p slot="title">
                        <Icon type="android-remove"></Icon>
                        公告信息
                    </p>
                    <Row>
                        <Input v-model="query.title" placeholder="请输入标题..." style="width: 200px" />
                        <span @click="handleSearch" style="margin: 0 10px;"><Button type="primary" icon="search">搜索</Button></span>
                    </Row>
                    <Row class="margin-top-10">
                        <span @click="publishNotice"><Button type="primary" icon="android-add">发布公告</Button></span>
                    </Row>
                    <div class="margin-top-10">
                        <Table :loading="loading" :data="pageData" :columns="columns"></Table>
                    </div>
                    <Page  style="text-align:center;margin-top:20px" @on-change="getData" :total="pageInfo.total" :page-size="size" :current="pageInfo.pageNo" size="small" show-elevator show-total></Page>
                </Card>
            </Col>
        </Row>
        <Modal v-model="modelShow" title="重新编辑发布消息" ok-text="取消" cancel-text="" :loading="loading" @on-ok="ok" @on-cancel="cancel">
            <Form ref="tiketForm" :model="noticeData" :rules="noticeRules" :label-width="120">
                <PublishNotice v-bind:title="title" v-bind:content="content" v-bind:id="id"></PublishNotice>
            </Form>
        </Modal>
    </div>
</template>
<script>
    import {formatDate,formatDateByLong} from 'utils/time';
    import VueRouter from "vue-router";
    import PublishNotice from './publishNotice';
    import {publishNotice} from './components/configurate.js';
    import {
        getNoticePage,
        deleteNotice
    } from './components/configurate';
    export default {
        name: 'publishNotice',
        components: {
            PublishNotice
        },
        /*mounted:function(){
            Bus.$on("title",(title) =>{//子组件数据改变之后传递给父组件
                this.title = title;
            });
        },*/
        data () {
            return {
                loading:true,
                page: 1,
                size: 20,
                pageInfo: '',
                pageData: [],
                query:{},
                modelShow: false,
                noticeData: {},
                title:'',
                content:'',
                id:'',
                noticeRules: {
                    type: [{
                        required: true,
                        message: '请输入标题',
                        trigger: 'blur'
                    }],
                    name: [{
                        required: true,
                        message: '请输入消息内容',
                        trigger: 'blur'
                    }]
                },
                columns: [
                    {
                        title: '序号',
                        type: 'index',
                        width: 80,
                        key: 'id',
                        align: 'center'
                    },
                    {
                        title: '标题',
                        width:300,
                        align: 'center',
                        key: 'title',
                        editable: true
                    },
                    {
                        title: '消息内容',
                        align: 'left',
                        key: 'contents',
                        render:(h,params)=>{
                            return h('div',params.row.contents);
                        }
                    },
                    {
                        title: '发布时间',
                        width:300,
                        align: 'center',
                        key: 'time',
                        /*editable: true,*/
                        render:(h,params)=>{
                            return h('div',formatDateByLong(params.row.time,"yyyy-MM-dd hh-mm-ss"));
                        }
                    },
                    {
                        title: '操作',
                        align: 'center',
                        width: 260,
                        key: 'handle',
                        render: (h, params) => {

                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.id=params.row.id;
                                            this.title=params.row.title;
                                            this.content=params.row.contents;
                                            this.modelShow = true;
                                            /*editNotify(params.row.id,params.row.title,params.row.contents);*/
                                        }
                                    }
                                }, '编辑'),
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.$Modal.confirm({
                                                title: '提示',
                                                content: '确定执行删除操作吗?',
                                                width: 400,
                                                onOk: () => {
                                                    deleteNotice(params.row.id).then(data => {
                                                        if (data.status === 200) {
                                                            this.getData(this.page, this.tabIndex);
                                                        } else {
                                                            this.$Message.error(data.message);
                                                        }
                                                    }).catch(error => {
                                                        this.$Message.error('驳回出现异常：' + error);
                                                    });
                                                },
                                                onCancel: () => {
                                                }
                                            })
                                        }
                                    }
                                }, '删除')
                            ])
                        }
                    }
                ]
            };
        },
        methods: {
            getData (page) {
                this.page = page;
                this.loading = true;
                getNoticePage(page,this.size,this.query).then(data => {
                    this.loading = false;
                    if (data.status === 200) {
                        this.pageInfo = data.data;
                        this.pageData = data.data.dataList;
                    } else {
                        this.$Message.error(data.message);
                    }
                }).catch(error => {
                    this.$Message.error('服务器异常' + error);
                });
            },
            publishNotice() {
                this.modelShow = true;
            },
            ok() {
                this.title="";
                this.content="";
                this.getData(1);
            },
            cancel() {
                this.title="";
                this.content="";
                this.getData(1);
            },
            handleSearch(){
                this.getData(1);
            },
            handleDel (val, index) {
                deleteNotice(val.id).then(data => {
                    if (data.status === 200) {
                        this.$Message.success('删除成功');
                        this.getData(this.page);
                    } else {
                        this.$Message.error(data.message);
                    }
                }).catch(error => {
                    this.$Message.error(data.message);
                });
            },
            handleCellChange (val, index, key) {
                this.$Message.success('修改了第 ' + (index + 1) + ' 行列名为 ' + key + ' 的数据');
            },
            handleChange (val, index) {
                this.$Message.success('修改了第' + (index + 1) + '行数据');
            },
            handleInput (val) {
            },
            handleError (message) {
                this.getData(this.page);
                this.$Message.error(message);
            }
        },
        created () {
            this.getData(1);
        }

    };
</script>
