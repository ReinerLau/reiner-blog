<!--
 * @Author: Reiner
 * @Date: 2022-06-09 19:05:00
 * @LastEditors: Do not edit
 * @LastEditTime: 2022-06-09 19:58:51
 * @FilePath: \reiner-blog\docs\pages\mini-vue\mini-vue_12.md
 * @Description: 第十二章 - 优化 stop 
-->
# 第十二章 - 优化 stop

## 测试用例

增加以下两行代码，你会发现测试用例不通过，因为`obj.foo++`相当于`obj.foo = obj.foo + 1`会触发`get`和`set`操作导致`stop`之后还会重新收集依赖

```typescript {15-16}
// src/reactivity/effect.spec.ts
it('stop', () => {
    let obj = reactive({ foo: 1 })
    let dummy;

    const runner = effect(() => {
        dummy = obj.foo
    })

    expect(dummy).toBe(1)
    stop(runner)
    obj.foo = 2
    expect(dummy).toBe(1)

    obj.foo++
    expect(dummy).toBe(1)
})
```

## 解决

添加一个`shouldTrack`标记表示当前状态是否可以应该收集依赖，所以在`trakc`阶段应该对该标记进行判断，默认为`false`，判断为`false`不收集依赖

```typescript {2,17}
// src/reactivity/effect.ts
let shouldTrack
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

    if (!activeEffect) return
    if (!shouldTrack) return

    dep.add(activeEffect)
    activeEffect.deps.push(dep)
}
```

因为`stop`通过修改`this.active`决定`effect`是否生效，如果`this.active === true`说明可以收集依赖，`this.active === false`说明不用收集依赖直接执行`effect`传递进来的回调，这时候因为`shouldTrack === false`，所以不会收集依赖

```typescript {12-22}
// src/reactivity/effect.ts
class ReactiveEffect {
    private _fn: any
    deps = []
    active = true
    onStop?: () => void
    constructor(fn, public scheduler?) {
        this._fn = fn
    }

    run() {
        if (!this.active) {
            return this._fn()
        }
        shouldTrack = true
        activeEffect = this

        const result = this._fn()
        
        shouldTrack = false

        return result
    }

    stop() {
        if (this.active) {
            cleanupEffect(this)
            if (this.onStop) {
                this.onStop()
            }
            this.active = false
        }
    }
}
```

## 优化

因为清除了`effect`，可以将`deps`清空

```typescript {5}
// src/reactivity/effect.ts
function cleanupEffect(effect: ReactiveEffect) {
    effect.deps.forEach((dep: any) => {
        dep.delete(effect)
    })
    effect.deps.length = 0
}
```

提取一个判断逻辑

```typescript {3,17,22-24}
// src/reactivity/effect.ts
export function track(target, key) {
    if(!isTracking()) return

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

    if(dep.has(activeEffect)) return
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
}

function isTracking() {
    return shouldTrack && activeEffect !== undefined
}
```
