<!--
 * @Author: Reiner
 * @Date: 2022-05-24 16:27:26
 * @LastEditors: Do not edit
 * @LastEditTime: 2022-05-28 19:16:27
 * @FilePath: \reiner-blog\docs\pages\posts\mini-vue_6.md
 * @Description: 第六章 - Reactive原理
-->
# 第六章 - Reactivity原理

## Reactive

`reactive`函数作用是把普通对象变成成一个响应式对象

先写测试用例（记得先删除上一篇文章中用于测试搭建环境的测试用例）

```javascript
// src/reactivity/tests/reactive.spec.js
import {reactive} from '../reactive'

describe('reactive', () => {
    it('happy path', () => {
        const original = {foo:1}
        const reactiveObj = reactive(original)

        expect(reactiveObj).not.toBe(original)
        
        expect(reactiveObj.foo).toBe(1)

        reactiveObj.foo = 2
        expect(reactiveObj.foo).toBe(2)
    }); 
});
```

`reactive`的原理就是利用ES6的新特性`Proxy`监听对象属性的读写操作，然后进行依赖收集，触发依赖

```javascript
// src/reactivity/reactive.js
export function reactive(raw){
    return new Proxy(raw,{
        get(target,key){
            const res = Reflect.get(target,key)

            // TODO: 依赖收集

            return res
        },
        set(target,key,value){
            const res = Reflect.set(target,key,value)

            // TODO: 触发依赖

            return res
        }
    })
}
```

运行测试是可以通过的
