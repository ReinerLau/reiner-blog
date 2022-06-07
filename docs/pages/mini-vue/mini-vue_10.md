<!--
 * @Author: Reiner
 * @Date: 2022-06-07 18:38:39
 * @LastEditors: Do not edit
 * @LastEditTime: 2022-06-07 19:33:04
 * @FilePath: \reiner-blog\docs\pages\mini-vue\mini-vue_10.md
 * @Description: 第十章 - 实现 readonly
-->
# 第十章 - 实现 readonly

## 测试用例

`readonly`函数与`reactive`函数的区别在于没有依赖收集、没有触发依赖、不能赋值

```typescript
// src/reactivity/tests/readonly.spec.ts
describe('readonly', () => {
    const original = { foo: 1 }
    const dummy = readonly(original)
    it('happy path', () => {
        expect(dummy).not.toBe(original)
        expect(dummy.foo).toBe(1)

        dummy.foo = 2
        expect(dummy.foo).toBe(1)
    });

});
```

## 实现

```typescript
export function readonly(raw){
    return new Proxy(raw, {
        get(target, key) {
            const res = Reflect.get(target, key)

            return res
        },

        set(target, key, value) {
            return true
        }
    })
}
```

## 重构

因为`get`逻辑相似，可以通过高阶函数的形式创建不同的`get`函数

```typescript {4-15,19,34}
// src/reactivity/reactive.ts
import { track, trigger } from './effect';

const createGetter = (isReadonly = false) => {
    return (target, key) => {
        const res = Reflect.get(target, key)

        if (!isReadonly) {
            // 依赖收集
            track(target, key)
        }

        return res
    }
}

export function reactive(raw) {
    return new Proxy(raw, {
        get: createGetter(),

        set(target, key, value) {
            const res = Reflect.set(target, key, value)

            // 触发依赖
            trigger(target, key)

            return res
        }
    })
}

export function readonly(raw) {
    return new Proxy(raw, {
        get:createGetter(true),

        set(target, key, value) {
            return true
        }
    })
}
```

如果要保持代码的一致性，也要将`set`逻辑抽离出来，`readonly`的`set`相似度不高，可以不抽离

```typescript {2-11,16}
// src/reactivity/reactive.ts
const createSetter = () => {
    return (target, key, value) => {
        const res = Reflect.set(target, key, value)

        // 触发依赖
        trigger(target, key)

        return res
    }
}

export function reactive(raw) {
    return new Proxy(raw, {
        get: createGetter(),
        set: createSetter()
    })
}
```

还可以将传递给`Proxy`的参数抽离成`handlers`

```typescript
// src/reactivity/baseHandlers.ts
import { track, trigger } from './effect';

const createGetter = (isReadonly = false) => {
    return (target, key) => {
        const res = Reflect.get(target, key)

        if (!isReadonly) {
            // 依赖收集
            track(target, key)
        }

        return res
    }
}

const createSetter = () => {
    return (target, key, value) => {
        const res = Reflect.set(target, key, value)

        // 触发依赖
        trigger(target, key)

        return res
    }
}

export const mutableHandler = {
    get: createGetter(),
    set: createSetter()
}

export const readonlyHandler = {
    get: createGetter(true),

    set(target, key, value) {
        return true
    }
}
```

```typescript
// src/reactivtiy/reactive.ts
import { mutableHandler, readonlyHandler } from "./baseHandlers"

export function reactive(raw) {
    return new Proxy(raw, mutableHandler)
}

export function readonly(raw) {
    return new Proxy(raw, readonlyHandler)
}
```

以上优化都是针对可读性的，从性能优化的角度可以将`createGetter`和`createSetter`执行的结果缓存起来，不用每次重新生成

```typescript
// src/reactivity/baseHandlers.ts
const mutableGetter = createGetter()
const mutableSetter = createSetter()
const readonlyGetter = createGetter(true)

export const mutableHandler = {
    get: mutableGetter,
    set: mutableSetter
}

export const readonlyHandler = {
    get: readonlyGetter,

    set(target, key, value) {
        return true
    }
}
```

## 测试警告

在对`readonly`的值进行修改时，需要发出警告，那么需要验证警告是否被发出，可以使用`console.warn`发出警告，然后使用`jest.fn`对其进行`mock`

```typescript {15-19}
// src/reactivity/tests/readonly.spec.ts
import { readonly } from "../reactive";

describe('readonly', () => {
    const original = { foo: 1 }
    const dummy = readonly(original)
    it('happy path', () => {
        expect(dummy).not.toBe(original)
        expect(dummy.foo).toBe(1)

        dummy.foo = 2
        expect(dummy.foo).toBe(1)
    });

    it('call warn',()=>{
        console.warn = jest.fn()
        dummy.foo = 2   
        expect(console.warn).toBeCalled()
    })
});
```

实现

```typescript {5}
export const readonlyHandler = {
    get: readonlyGetter,

    set(target, key, value) {
        console.warn(`不能将${key}赋值为${value}:`, target)
        return true
    }
}
```
