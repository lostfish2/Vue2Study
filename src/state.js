import { observe } from "./observe/index"

export function initState(vm) {
    const opts = vm.$options
    if (opts.data) {
        initData(vm)
    }
}
function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {  //vm.name
        get() {
            return vm[target][key]    //vm._data.name
        },
        set(newValue) {
            vm[target][key] = newValue
        }
    })
}

function initData(vm) {
    let data = vm.$options.data
    //根实例data可以是对象，也可以是函数，组件data只能是函数
    data = typeof data === 'function' ? data.call(this) : data

    vm._data = data
    //对数据进行劫持 defineProperty
    observe(data)

    //vm._data 用vm来代理
    for (let key in data) {
        proxy(vm, '_data', key)
    }

}