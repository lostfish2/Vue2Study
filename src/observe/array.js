//重写数组中部分方法


let oldArrayProto = Array.prototype

//newArrayProto.__proto__ = oldArrayProto
export let newArrayProto = Object.create(oldArrayProto)

let methods = [
    'push',
    'pop',
    'shift',
    'unshift',
    'reverse',
    'sort',
    'splice'
]//concat slice不会改变原数组

methods.forEach(method => {
    //arr.push(1,2,3)
    newArrayProto[method] = function (...args) {
        const result = oldArrayProto[method].call(this, ...args)

        console.log('method', method)

        //对新增的数据进行劫持
        let inserted  //新增的内容
        let ob = this.__ob__
        switch (method) {
            case 'push':
            case 'unshift': //arr.unshift(1,2,3)
                inserted = args
                break;
            case 'splice':  //arr,splice(0,1,{a:1},{b:2})
                inserted = args.slice(2)
            default:
                break;
        }
        if (!inserted) {
            //对新增内容进行观测
            ob.observeArray(inserted)
        }


        return result
    }

})

