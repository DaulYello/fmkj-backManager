<style lang="less">

@import '../../../styles/table/editable-table.less';

</style>

<template>

<div>
    <Table :ref="refs" :columns="columnsList" :data="thisTableData" border disabled-hover></Table>
</div>

</template>

<script>

import {
    updateQuartz,
    runQuartz,
    changeStatus
}
from 'api/system/system';
//编辑按钮
const editButton = (vm, h, currentRow, index) => {
    return h('Button', {
        props: {
            type: currentRow.editting ? 'success' : 'primary',
            //loading: currentRow.saving
        },
        style: {
            margin: '0 5px'
        },
        on: {
            'click': () => {
                if (!currentRow.editting) {
                    if (currentRow.edittingCell) {
                        for (let name in currentRow.edittingCell) {
                            currentRow.edittingCell[name] = false;
                            vm.edittingStore[index].edittingCell[name] = false;
                        }
                    }
                    vm.edittingStore[index].editting = true;
                    vm.thisTableData = JSON.parse(JSON.stringify(vm.edittingStore));
                } else {
                    vm.edittingStore[index].saving = true;
                    vm.thisTableData = JSON.parse(JSON.stringify(vm.edittingStore));
                    if (vm.edittingStore[index].jobName === '') {
                        vm.$Message.error('任务名称不能为空！')
                        return;
                    }
                    if (vm.edittingStore[index].jobGroup === '') {
                        vm.$Message.error('任务组名不能为空！')
                        return;
                    }
                    if (vm.edittingStore[index].methodName === '') {
                        vm.$Message.error('方法名称不能为空！')
                        return;
                    }
                    if (vm.edittingStore[index].cronExpression === '') {
                        vm.$Message.error('表达式不能为空！')
                        return;
                    }
                    if (vm.edittingStore[index].misfirePolicy === '') {
                        vm.$Message.error('执行策略不能为空！')
                        return;
                    }
                    updateQuartz(vm.thisTableData[index]).then(data => {
                        if (data.status === 200) {
                            let edittingRow = vm.edittingStore[index];
                           // edittingRow.editting = false;
                           // edittingRow.saving = false;
                            vm.thisTableData = JSON.parse(JSON.stringify(vm.edittingStore));
                            vm.$emit('input', vm.handleBackdata(vm.thisTableData));
                            vm.$emit('on-change', vm.handleBackdata(vm.thisTableData), index);
                        } else {
                            let edittingRow = vm.thisTableData[index];
                            edittingRow.editting = false;
                            edittingRow.saving = false;
                            vm.thisTableData = JSON.parse(JSON.stringify(vm.thisTableData));
                            vm.$emit('on-error', data.message);
                        }
                    }).catch(error => {
                        vm.$emit('on-error', '服务器异常' + error);
                    });
                }
            }
        }
    }, currentRow.editting ? '保存' : '编辑');
};
//删除按钮
const deleteButton = (vm, h, currentRow, index) => {
    return h('Poptip', {
        props: {
            confirm: true,
            title: '您确定要删除这条数据吗?'
        },
        on: {
            'on-ok': () => {
                vm.$emit('on-delete', vm.thisTableData[index],function functionName() {
                     vm.loading = false;
                });
            }
        }
    }, [
        h('Button', {
            style: {
                margin: '0 5px'
            },
            props: {
                type: 'error',
                placement: 'top'
            }
        }, '删除')
    ]);
};
//启用
const infoButton = (vm, h, currentRow, index) => {
    let text = vm.thisTableData[index].status === '1' ? '启用' : '暂停';
    return h('Poptip', {
        props: {
            type: 'text',
            size: 'small',
            confirm: true,
            title: '您确定要' + text + '?'
        },
        on: {
            'on-ok': () => {
                let changeValue = vm.thisTableData[index].status === '0' ? 1 : 0;
                changeStatus(vm.thisTableData[index].jobId, changeValue).then(data => {
                    if (data.status === 200) {
                        vm.$emit('on-start', vm.handleBackdata(vm.thisTableData), index, changeValue);
                    } else {
                        vm.$emit('on-error', data.message);
                    }
                }).catch(error => {
                    vm.$emit('on-error', '操作异常！');
                });
            }
        }
    }, [
        h('Button', {
            style: {
                margin: '0 5px'
            },
            props: {
                type: vm.thisTableData[index].status === '1' ? 'info' : 'error',
                placement: 'top'
            }
        }, text)
    ]);
};
//执行按钮
const runButton = (vm, h, currentRow, index) => {
    return h('Poptip', {
        props: {
            type: 'text',
            size: 'small',
            confirm: true,
            title: '您确定要执行?'
        },
        on: {
            'on-ok': () => {
                runQuartz(vm.thisTableData[index].jobId).then(data => {
                    if (data.status === 200) {
                        vm.$emit('on-run', vm.handleBackdata(vm.thisTableData), index);
                    } else {
                        vm.$emit('on-error', data.message);
                    }
                }).catch(error => {
                    vm.$emit('on-error', '操作异常！');
                });
            }
        }
    }, [
        h('Button', {
            style: {
                margin: '5px'
            },
            props: {
                type: 'info',
                placement: 'top'
            }
        }, '执行')
    ]);
};
const incellEditBtn = (vm, h, param) => {
    if (vm.hoverShow) {
        return h('div', {
            'class': {
                'show-edit-btn': vm.hoverShow
            }
        }, [
            h('Button', {
                props: {
                    type: 'text',
                    icon: 'edit'
                },
                on: {
                    click: (event) => {
                        vm.edittingStore[param.index].edittingCell[param.column.key] = true;
                        vm.thisTableData = JSON.parse(JSON.stringify(vm.edittingStore));
                    }
                }
            })
        ]);
    } else {
        return h('Button', {
            props: {
                type: 'text',
                icon: 'edit'
            },
            on: {
                click: (event) => {
                    vm.edittingStore[param.index].edittingCell[param.column.key] = true;
                    vm.thisTableData = JSON.parse(JSON.stringify(vm.edittingStore));
                }
            }
        });
    }
};
const saveIncellEditBtn = (vm, h, param) => {
    return h('Button', {
        props: {
            type: 'text',
            icon: 'checkmark'
        },
        on: {
            click: (event) => {
                vm.edittingStore[param.index].edittingCell[param.column.key] = false;
                vm.thisTableData = JSON.parse(JSON.stringify(vm.edittingStore));
                vm.$emit('input', vm.handleBackdata(vm.thisTableData));
                vm.$emit('on-cell-change', vm.handleBackdata(vm.thisTableData), param.index, param.column.key);
            }
        }
    });
};
const cellInput = (vm, h, param, item) => {
    return h('Input', {
        props: {
            type: 'text',
            value: vm.edittingStore[param.index][item.key]
        },
        on: {
            'on-change' (event) {
                let key = item.key;
                vm.edittingStore[param.index][key] = event.target.value;
            }
        }
    });
};
export default {
    name: 'canEditTable',
    props: {
        refs: String,
        columnsList: Array,
        value: Array,
        url: String,
        editIncell: {
            type: Boolean,
            default: false
        },
        hoverShow: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            columns: [],
            thisTableData: [],
            edittingStore: []
        };
    },
    created() {
        this.init();
    },
    methods: {
        init() {
                let vm = this;
                let editableCell = this.columnsList.filter(item => {
                    if (item.editable) {
                        if (item.editable === true) {
                            return item;
                        }
                    }
                });
                let cloneData = JSON.parse(JSON.stringify(this.value));
                let res = [];
                res = cloneData.map((item, index) => {
                    let isEditting = false;
                    if (this.thisTableData[index]) {
                        if (this.thisTableData[index].editting) {
                            isEditting = true;
                        } else {
                            for (const cell in this.thisTableData[index].edittingCell) {
                                if (this.thisTableData[index].edittingCell[cell] === true) {
                                    isEditting = true;
                                }
                            }
                        }
                    }
                    if (isEditting) {
                        return this.thisTableData[index];
                    } else {
                        this.$set(item, 'editting', false);
                        let edittingCell = {};
                        editableCell.forEach(item => {
                            edittingCell[item.key] = false;
                        });
                        this.$set(item, 'edittingCell', edittingCell);
                        return item;
                    }
                });
                this.thisTableData = res;
                this.edittingStore = JSON.parse(JSON.stringify(this.thisTableData));
                this.columnsList.forEach(item => {
                    if (item.editable) {
                        item.render = (h, param) => {
                            let currentRow = this.thisTableData[param.index];
                            if (!currentRow.editting) {
                                if (this.editIncell) {
                                    return h('Row', {
                                        props: {
                                            type: 'flex',
                                            align: 'middle',
                                            justify: 'center'
                                        }
                                    }, [
                                        h('Col', {
                                            props: {
                                                span: '22'
                                            }
                                        }, [!currentRow.edittingCell[param.column.key] ? h('span', currentRow[item.key]) : cellInput(this, h, param, item)]),
                                        h('Col', {
                                            props: {
                                                span: '2'
                                            }
                                        }, [
                                            currentRow.edittingCell[param.column.key] ? saveIncellEditBtn(this, h, param) : incellEditBtn(this, h, param)
                                        ])
                                    ]);
                                } else {
                                    return h('span', currentRow[item.key]);
                                }
                            } else {
                                return h('Input', {
                                    props: {
                                        type: 'text',
                                        value: currentRow[item.key]
                                    },
                                    on: {
                                        'on-change' (event) {
                                            let key = param.column.key;
                                            vm.edittingStore[param.index][key] = event.target.value;
                                        }
                                    }
                                });
                            }
                        };
                    }
                    if (item.handle) {
                        item.render = (h, param) => {
                            let currentRowData = this.thisTableData[param.index];
                            let children = [];
                            item.handle.forEach(item => {
                                if (item === 'edit') {
                                    children.push(editButton(this, h, currentRowData, param.index));
                                } else if (item === 'delete') {
                                    children.push(deleteButton(this, h, currentRowData, param.index));
                                } else if (item === 'info') {
                                    children.push(infoButton(this, h, currentRowData, param.index));
                                } else if (item === 'run') {
                                    children.push(runButton(this, h, currentRowData, param.index));
                                }

                            });
                            return h('div', children);
                        };
                    }
                });
            },
            handleBackdata(data) {
                let clonedData = JSON.parse(JSON.stringify(data));
                clonedData.forEach(item => {
                    delete item.editting;
                    delete item.edittingCell;
                    delete item.saving;
                });
                return clonedData;
            }
    },
    watch: {
        value(data) {
            this.init();
        }
    }
};

</script>
