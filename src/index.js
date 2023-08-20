
import { initMixin } from "./init"
//耦合所有方法
function Vue(options) { //options：用户选项
    this._init(options)
}

initMixin(Vue)
export default Vue