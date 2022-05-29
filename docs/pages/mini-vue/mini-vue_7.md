<!--
 * @Author: Reiner
 * @Date: 2022-05-29 09:50:41
 * @LastEditors: Do not edit
 * @LastEditTime: 2022-05-29 10:29:14
 * @FilePath: \reiner-blog\docs\pages\posts\mini-vue_7.md
 * @Description: 第七章 - 实现 effect 返回 runner
-->
# 第七章 - 实现 effect 返回 runner

## 返回runner

测试用例

```typescript {8-17}
// src/reactivity/effect.spec.ts
import { reactive } from "../reactive";
import { effect } from '../effect';

describe('effect', () => {
    // ...
    
    it('should return runner when call effect', () => {
        let foo = 10
        const runner = effect(() => {
            foo++
        })

        expect(foo).toBe(11)
        runner()
        expect(foo).toBe(12)
    })
});
```

实现

```typescript {20}
// src/reactivity/effect.ts
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

    return _effect.run.bind(_effect)
}

// ...
```

## runner返回值

测试用例

```typescript {12,18}
// src/reactivity/effect.spec.ts
import { reactive } from "../reactive";
import { effect } from '../effect';

describe('effect', () => {
    // ...

    it('should return runner when call effect', () => {
        let foo = 10
        const runner = effect(() => {
            foo++
            return 'foo'
        })

        expect(foo).toBe(11)
        runner()
        expect(foo).toBe(12)
        expect(runner()).toBe('foo')
    })
});
```

实现

```typescript {9}
// src/reactivity/effect.ts
class ReactiveEffect {
    constructor(fn) {
        this._fn = fn
    }

    run() {
        activeEffect = this
        return this._fn()
    }
}


let activeEffect = null
export function effect(fn) {
    const _effect = new ReactiveEffect(fn)

    _effect.run()

    return _effect.run.bind(_effect)
}
```
