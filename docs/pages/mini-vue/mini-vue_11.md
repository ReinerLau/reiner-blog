<!--
 * @Author: Reiner
 * @Date: 2022-06-08 13:08:55
 * @LastEditors: Do not edit
 * @LastEditTime: 2022-06-08 18:29:17
 * @FilePath: \reiner-blog\docs\pages\mini-vue\mini-vue_11.md
 * @Description: 第十一章 - 实现 isReactive 和 isReadonly
-->
# 第十一章 - 实现 isReactive 和 isReadonly

## isReactive

### 测试用例

`isReactive`验证对象是否经过`Proxy`处理

```typescript {2,10-11}
// src/reactivity/tests/reactive.spec.ts
import {isReactive, reactive} from '../reactive'

describe('reactive', () => {
    it('happy path', () => {
        const original = {foo:1}
        const reactiveObj = reactive(original)

        expect(reactiveObj).not.toBe(original)
        expect(isReactive(reactiveObj)).toBe(true) 
        expect(isReactive(original)).toBe(false) 
        expect(reactiveObj.foo).toBe(1)
    }); 
});
```

### 实现

通过读取对象某个`key`值触发`Proxy`的`get`操作，进而拿到`isReadonly`并返回

```typescript
// src/reactivity/reactive.ts
export function isReactive(value) {
    return value['is_reactive']
}
```

```typescript {6-8}
// src/reactivity/baseHandlers.ts
const createGetter = (isReadonly = false) => {
    return (target, key) => {
        const res = Reflect.get(target, key)

        if (key === 'is_reactive') {
            return !isReadonly
        }

        if (!isReadonly) {
            // 依赖收集
            track(target, key)
        }

        return res
    }
}
```

因为没有经过`Proxy`处理的对象无法触发`get`操作，所以返回`undefined`，可以使用`!!`符号将`undefined`转换为`boolean`返回

```typescript
// src/reactivity/reactive.ts
export function isReactive(value) {
    return !!value['is_reactive']
}
```

可以将`is_reactive`提取出来作为枚举值获取

```typescript
// src/reactivity/reactive.ts
export enum ReactiveFlags {
    IS_REACTIVE = 'is_reactive',
}
export function isReactive(value) {
    return !!value[ReactiveFlags.IS_REACTIVE]
}
```

```typescript
// src/reactivity/baseHandlers.ts
if (key === ReactiveFlags.IS_REACTIVE) {
    return !isReadonly
}
```

## isReadonly

### 测试用例

```typescript {2,10,11}
// src/reactivity/readonly.spec.ts
import { isReadonly, readonly } from "../reactive";

describe('readonly', () => {
    const original = { foo: 1 }
    const dummy = readonly(original)
    it('happy path', () => {
        expect(dummy).not.toBe(original)
        expect(dummy.foo).toBe(1)
        expect(isReadonly(dummy)).toBe(true)
        expect(isReadonly(original)).toBe(false)
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

### 实现

```typescript
// src/reactivity/reactive.ts
export enum ReactiveFlags {
    IS_REACTIVE = 'is_reactive',
    IS_READONLY = 'is_readonly'
}
export function isReadonly(value) {
    return !!value[ReactiveFlags.IS_READONLY]
}
```

```typescript {10-12}
// src/reactivity/baseHandlers.ts
import { ReactiveFlags } from './reactive';

const createGetter = (isReadonly = false) => {
    return (target, key) => {
        const res = Reflect.get(target, key)

        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly
        }

        if (!isReadonly) {
            // 依赖收集
            track(target, key)
        }

        return res
    }
}
```
