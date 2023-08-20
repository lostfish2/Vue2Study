import { newArrayProto } from './array'

class Observer {
    constructor(data) {
        //object.defineProperty只能劫持已经存在的属性($set,$delete)

        // data.__ob__ = this  //给数据加了一个标识 如果数据上有__ob__，则说明这个属性被观测过
        Object.defineProperty(data, '__ob__', {
            value: this,
            enumerable: false
        })
        if (Array.isArray(data)) {
            //重写数组方法,7个变异方法,是可以修改数组本身
            //对数组中对象进行监控

            // data.__proto__ = {  //这样干掉了原本的push，再也无法调用原生的slice，contact等；保留数组原有方法，重写部分方法
            //     push() {
            //         console.log('this is repush')
            //     }
            // }
            data.__proto__ = newArrayProto
            this.observeArray(data)
        } else {
            this.walk(data)
        }

    }
    walk(data) { //循环遍历对象，劫持属性
        Object.keys(data).forEach(key => {
            defineReactive(data, key, data[key])
        })
    }
    observeArray(data) { //观测数组
        data.forEach(item => {
            observe(item)
        })
    }
}

export function defineReactive(target, key, value) {
    observe(value)  //递归，对所有的对象都进行属性劫持
    Object.defineProperty(target, key, {
        get() {
            return value
        },
        set(newValue) {
            if (value === newValue) return
            value = newValue
        }
    })
}
export function observe(data) {
    //对这个对象进行劫持
    if (typeof data !== 'object' || data == null) {
        return
    }
    if (data.__ob__ instanceof Observer) {
        return data.__ob__
    }
    return new Observer(data)

}

