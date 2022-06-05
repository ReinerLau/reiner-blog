<!--
 * @Author: Reiner
 * @Date: 2022-06-01 07:55:46
 * @LastEditors: Do not edit
 * @LastEditTime: 2022-06-05 13:56:14
 * @FilePath: \reiner-blog\docs\pages\mini-vue\mini-vue_8.md
 * @Description: 第八章 - 实现 effect.scheduler
-->
# 第八章 - 实现 effect.scheduler

## 测试用例

```typescript
// src/reactivity/tests/effect.spec.ts
import { reactive } from "../reactive";
import { effect } from '../effect';

describe('effect', () => {
    // ...
    it('shcheduler', () => {
        let dummy;
        let run: any
        const scheduler = jest.fn(() => {
            run = runner
        })
        const obj = reactive({ foo: 1 })
        const runner = effect(() => {
            dummy = obj.foo
        }, { scheduler })

        expect(scheduler).not.toHaveBeenCalled()
        expect(dummy).toBe(1)
        obj.foo++
        expect(scheduler).toHaveBeenCalledTimes(1)
        expect(dummy).toBe(1)
        run()
        expect(dummy).toBe(2)
    })
}}
```

## 实现

```typescript {4,15-17,30-36}
// src/reactivity/effect.ts
class ReactiveEffect {
    private _fn: any
    constructor(fn, public scheduler?) {
        this._fn = fn
    }

    run() {
        activeEffect = this
        return this._fn()
    }
}

let activeEffect
export function effect(fn, option: any = {}) {
    const { scheduler } = option
    const _effect = new ReactiveEffect(fn, scheduler)

    _effect.run()

    return _effect.run.bind(_effect)
}

// ...

export function trigger(target, key) {
    let depsMap = targetMaps.get(target)
    let dep = depsMap.get(key)

    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler()
        } else {
            effect.run()
        }
    }
}
```
