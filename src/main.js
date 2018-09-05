import Vue from 'vue';
import iView from 'iview';
import {router} from './router/index';
import {appRouter} from './router/router';
import store from './store';
import App from './app.vue';
import '@/locale';
import 'iview/dist/styles/iview.css';
import VueI18n from 'vue-i18n';
import util from './libs/util';
import * as filters from './filters'; // 全局vue filter
import errLog from './store/errLog';// error log组件

import tinymce from 'tinymce';
window.tinymce = tinymce;

/*import ue from './views/configurationSys/publishNotice';*/

/*import '../static/UE/ueditor.config.js';
import '../static/UE/ueditor.parse.min.js';
import '../static/UE/lang/zh-cn/zh-cn.js';
import '../static/UE/ueditor.all.min.js';*/



/*import '../static/utf8-php/ueditor.config.js';
import '../static/utf8-php/ueditor.all.min.js';
import '../static/utf8-php/lang/zh-cn/zh-cn.js';
import '../static/utf8-php/ueditor.parse.min.js';*/

Vue.use(VueI18n);
Vue.use(iView);

// register global utility filters.
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
});

// 生产环境错误日志
if (process.env.NODE_ENV === 'production') {
  Vue.config.errorHandler = function(err, vm) {
    console.log(err, window.location.href);
    errLog.pushLog({
      err,
      url: window.location.href,
      vm
    })
  };
}

new Vue({
    el: '#app',
    router: router,
    store: store,
    render: h => h(App),
    data: {
        currentPageName: ''
        /*return: {
            content: '<p>html content</p>',
            setting: {
                height: 200,
                language_url: "langs/zh_CN.js",
                block_formats: "Paragraph=p;Heading 1=h1;Heading 2=h2;Heading 3=h3;Heading 4=h4;Heading 5=h5;Heading 6=h6;"
            }
        }*/
    },
    mounted () {
        this.currentPageName = this.$route.name;
        // 显示打开的页面的列表
        this.$store.commit('setOpenedList');
        this.$store.commit('initCachepage');
        // 权限菜单过滤相关
        //console.log('updateMenulist.2');
        //this.$store.commit('updateMenulist');
        // iview-admin检查更新
        //util.checkUpdate(this);
    },
    created () {
        let tagsList = [];
        appRouter.map((item) => {
            if (item.children.length <= 1) {
                tagsList.push(item.children[0]);
            } else {
                tagsList.push(...item.children);
            }
        });
        this.$store.commit('setTagsList', tagsList);
    }
});
