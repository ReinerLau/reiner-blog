<!--
 * @Author: Reiner
 * @Date: 2022-06-05 10:57:26
 * @LastEditors: Do not edit
 * @LastEditTime: 2022-06-05 12:36:01
 * @FilePath: \reiner-blog\docs\pages\mini-vue\mini-vue_9.md
 * @Description: 第九章 - 实现 effect.stop
-->
# 第九章 - 实现 effect.stop

## 测试用例

调用`stop`方法，传入调用`effect`后获取到的`runner`

```javascript
let obj = reactive({ foo: 1 })
let dummy;

const runner = effect(()=>{
    dummy = obj.foo    
})

expect(dummy).toBe(1)
stop(runner)
```

修改依赖值后不触发更新，注意不能使用`obj.foo++`，会导致触发`get`重新收集依赖

```javascript
obj.foo = 2
expect(dummy).toBe(1)
```

完整代码

```javascript
// src/reactivity/tests/effect.spec.js
import { stop } from '../effect';
it('stop',()=>{
    let obj = reactive({ foo: 1 })
    let dummy;

    const runner = effect(()=>{
        dummy = obj.foo    
    })

    expect(dummy).toBe(1)
    stop(runner)
    obj.foo = 2
    expect(dummy).toBe(1)
})
```

## 实现

因为依赖值更新是通过`trigger`遍历所有`dep`触发所有收集的`effect`，那么只需要去掉`dep`中`runner`对应的`effect`

导出stop函数

```javascript
// src/reactivity/effect.js
export function stop(runner) {
    runner.effect.stop()
}
```

获取`runner`对应的`effect`

```javascript {9}
// src/reactivity/effect.js
export function effect(fn, option: any = {}) {
    const { scheduler } = option
    const _effect = new ReactiveEffect(fn, scheduler)

    _effect.run()

    const runner: any = _effect.run.bind(_effect)
    runner.effect = _effect

    return runner
}
```

因为一个effect可能对应多个依赖值，一个依赖值对应一个`dep`，需要`effect`反向收集多个相关的`dep`

```javascript {4,29}
// src/reactivity/effect.js
class ReactiveEffect {
    private _fn: any
    deps = []
    constructor(fn, public scheduler?) {
        this._fn = fn
    }

    run() {
        activeEffect = this
        return this._fn()
    }
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
    activeEffect.deps.push(dep)
}
```

实现`effect`的`stop`方法使用`Set.delete`删除`deps`对应的`effect`

```javascript {14-18}
// src/reactivity/effect.js
class ReactiveEffect {
    private _fn: any
    deps = []
    constructor(fn, public scheduler?) {
        this._fn = fn
    }

    run() {
        activeEffect = this
        return this._fn()
    }

    stop() {
        this.deps.forEach((dep: any) => {
            dep.delete(this)
        })
    }
}
```

同时防止`reactice`测试用例不通过

```javascript {16}
// src/reactivity/effect.js
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

    if(!activeEffect) return

    dep.add(activeEffect)
    activeEffect.deps.push(dep)
}
```
