import { initState } from "./state"
import { compilerToFunction } from "./compilier"
export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        const vm = this
        vm.$options = options //将用户的选项挂载到实例上

        //初始化状态
        initState(vm)


        if (options.el) {
            vm.$mount(options.el)
        }
    }
    Vue.prototype.$mount = function (el) {
        const vm = this
        el = document.querySelector(el)
        let ops = vm.$options
        if (!ops.render) {    //先进行查找有无render函数
            let template //没有render看一下是否写了template
            if (!ops.template && el) { //没有模板 但是写了el
                template = el.outerHTML
            } else {
                if (el) {
                    template = ops.template //有模板 有el 则采用模板的内容
                }
            }
            //写了template，就用写了的template
            if (template) {
                const render = compilerToFunction(template)
                ops.render = render
            }
        }

        ops.render //最红可以获取render方法
        //script 考前引用的vue.global.js这个编译过程是在浏览器运行的 
        //runtiome是不不包括模板编译的，整个编译是打包的时候通过loader来转义.vue文件，runtime时不可以使用template
    }
}
