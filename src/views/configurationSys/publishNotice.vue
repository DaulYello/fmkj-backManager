<template>
    <div>

        <!--<pre v-highlight><code>$ npm install @packy-tang/vue-tinymce <br>or <br>$ yarn add @packy-tang/vue-tinymce</code></pre>-->
        <Row>
            <div v-show="false">
                <Input v-model="id" hidden style="width: 200px" />
            </div>
        </Row>
        <Row class="margin-top-10">
            <div>
                <span>标题</span>

                <Input v-model="title" placeholder="请输入标题..." style="width: 200px" />
            </div>
        </Row>
        <div class="editor">
            <vue-tinymce v-model="content" :setting="setting" :setup="setup"></vue-tinymce>
        </div>
        <Row class="margin-top-10">
            <span @click="publish"><Button type="primary" icon="android-add">发布</Button></span>
        </Row>
    </div>
</template>
<style scoped>
</style>
<script>
    import { VueTinymce , TinymceSetting } from '@packy-tang/vue-tinymce';
    import {publishNotice,editNotify} from './components/configurate.js';
    import NoticeSys from './noticeSys';
    export default {
        name: 'NoticeSys',
        components: {
            NoticeSys
        },
        data(){
            return {
                //temp_title:this.title,
                /*content: '<p style="text-indent: 25px;">请在这里数据将要发布的消息！</p>',
                title:'',*/
                //noticeTitle:this.title,
                setting: Object.assign(
                    {},

                    // Use scaffold
                    TinymceSetting,

                    // download lang file in your project.
                    // link: https://www.tinymce.com/download/language-packages/
                    {
                        height: 350
                    }
                )
            }
        },
        props:{
            id:{
                type:String,
                required:true
            },
            title:{
                type:String,
                required:true
            },
           content:{
                type: String,
                required: true
           }
        },

        methods: {
            setup(editor){
                /*this.content='<p style="text-indent: 25px;">请在这里数据将要发布的消息！</p>',
                 this.title=''*/
                // init editor yourself
                console.log("init editor yourself")
            },
            publish(){
                console.log("开始发布消息！");
                console.log("开始发布消息title=="+this.title);
                console.log("发布消息的id=="+this.id);
                if(this.id == ""){
                    publishNotice(this.content,this.title).then(data=>{
                        if (data.status==200){
                            this.$Message.success("发布成功！");
                        }else {
                            this.$Message.error(data.message);
                        }
                    });
                }else{
                    console.log("发布消息的id=="+this.id);
                    editNotify(this.id,this.title,this.content).then(data=>{
                        if (data.status==200){
                            this.$Message.success("修改成功！");
                        }else {
                            this.$Message.error(data.message);
                        }
                    });
                }

            }
        },
        components: {
            VueTinymce
        }
    }
</script>
