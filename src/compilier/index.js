import { parseHTML } from "./parse"
export function compilerToFunction(template) {
    //1 template转换成ast语法树
    let ast = parseHTML(template)
    //2 生成render方法(返回结果为虚拟dom)
    console.log(ast)
}