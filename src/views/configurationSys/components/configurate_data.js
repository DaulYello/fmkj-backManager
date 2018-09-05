import {
  formatDateByLong
} from 'utils/time';

export const columns = [
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
                            editNotify(params.row.id,params.row.title,params.row.contents);
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
                                content: '确定执行驳回操作吗?',
                                width: 400,
                                onOk: () => {
                                    batchRefuseAcitity(params.row.id,2).then(data => {
                                        if (data.status === 200) {
                                            this.$Message.success('驳回成功');
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
        //handle: ['edit','delete']

];

export default columns;
