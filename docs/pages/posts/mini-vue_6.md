<!--
 * @Author: Reiner
 * @Date: 2022-05-24 16:27:26
 * @LastEditors: Do not edit
 * @LastEditTime: 2022-05-28 22:45:19
 * @FilePath: \reiner-blog\docs\pages\posts\mini-vue_6.md
 * @Description: 第六章 - Reactive原理
-->
# 第六章 - Reactivity原理

## Reactive

`reactive`函数作用是把普通对象变成成一个响应式对象

先写测试用例（记得先删除上一篇文章中用于测试搭建环境的测试用例）

```javascript
// src/reactivity/tests/reactive.spec.js
import { reactive } from '../reactive'

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
        get(target, key){
            const res = Reflect.get(target,key)

            return res
        },
        set(target, key, value){
            const res = Reflect.set(target,key,value)

            return res
        }
    })
}
```

运行测试是可以通过的

## Effect

个人理解，`effect`函数的作用就是接收一个函数转换成响应式对象的依赖，响应式对象的读操作会进行依赖收集，写操作会触发依赖，也就是执行一次函数

先写测试用例

```javascript
// src/reactivity/tests/effect.spec.js
import { reactive } from "../reactive";
import { effect } from '../effect';

describe('effect', () => {
    it('happy path', () => {
        const user = reactive({ age: 10 })

        let newAge
        effect(() => {
            newAge = user.age + 1
        })

        expect(newAge).toBe(11)
    });
});
```

`effect`函数在接收到函数后先执行一次函数

实现

```javascript
// src/reactivity/effect.js
class ReactiveEffect {
    constructor(fn) {
        this._fn = fn
    }

    run() {
        this._fn()
    }
}

export function effect(fn) {
    const _effect = new ReactiveEffect(fn)

    _effect.run()
}
```

以面向对象的方式的触发依赖

## 依赖收集

```javascript{2,9-10}
// src/reactivity/reactive.js
import { track } from './effect';

export function reactive(raw) {
    return new Proxy(raw, {
        get(target, key) {
            const res = Reflect.get(target, key)

            // 依赖收集
            track(target, key)

            return res
        },

        set(target, key, value) {
            const res = Reflect.set(target, key, value)

            return res
        }
    })
}
```

```javascript{8,13-35}
// src/reactivity/effect.js
class ReactiveEffect {
    constructor(fn) {
        this._fn = fn
    }

    run() {
        activeEffect = this
        this._fn()
    }
}

let activeEffect = null
export function effect(fn) {
    const _effect = new ReactiveEffect(fn)

    _effect.run()
}

let targetMaps = new Map()
export function track(target, key) {
    let depsMap = targetMaps.get(target)
    if (!depsMap) {
        depsMap = new Map()
        targetMaps.set(target, depsMap)
    }

    let dep = depsMap.get(key)
    if (!dep) {
        dep = new Set()
        depsMap.set(key, dep)
    }

    dep.add(activeEffect)
}
```

## 触发依赖

先改测试用例

```javascript{16-18}
// src/reactivity/tests/effect.spec.js
import { reactive } from "../reactive";
import { effect } from '../effect';

describe('effect', () => {
    it('happy path', () => {
        const user = reactive({ age: 10 })

        let newAge
        effect(() => {
            newAge = user.age + 1
        })

        expect(newAge).toBe(11)

        // 更新
        user.age++
        expect(newAge).toBe(12)
    });
});
```

实现

```javascript{2,18-19}
// src/reactivity/reactive.js
import { track,trigger } from './effect';

export function reactive(raw) {
    return new Proxy(raw, {
        get(target, key) {
            const res = Reflect.get(target, key)

            // 依赖收集
            track(target, key)

            return res
        },

        set(target, key, value) {
            const res = Reflect.set(target, key, value)

            // 触发依赖
            trigger(target,key)

            return res
        }
    })
}
```

```javascript{38-45}
// src/reactivity/effect.js
class ReactiveEffect {
    constructor(fn) {
        this._fn = fn
    }

    run() {
        activeEffect = this
        this._fn()
    }
}


let activeEffect = null
export function effect(fn) {
    const _effect = new ReactiveEffect(fn)

    _effect.run()
}

let targetMaps = new Map()
export function track(target, key) {
    let depsMap = targetMaps.get(target)
    if (!depsMap) {
        depsMap = new Map()
        targetMaps.set(target, depsMap)
    }

    let dep = depsMap.get(key)
    if (!dep) {
        dep = new Set()
        depsMap.set(key, dep)
    }

    dep.add(activeEffect)
}

export function trigger(target, key) {
    let depsMap = targetMaps.get(target)
    let dep = depsMap.get(key)

    for (const effect of dep) {
        effect.run()
    }
}
```
