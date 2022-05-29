<!--
 * @Author: Reiner
 * @Date: 2022-05-24 16:27:26
 * @LastEditors: Do not edit
 * @LastEditTime: 2022-05-29 10:22:40
 * @FilePath: \reiner-blog\docs\pages\posts\mini-vue_5.md
 * @Description: 第五章 - 环境配置
-->
# 第五章 - 环境配置

## 初始化项目

新建项目目录

```bash
mkdir my-mini-vue
```

进入项目目录

```bash
cd my-mini-vue
```

初始化 package.json

```bash
yarn init -y
```

初始化目录结构

```content
my-mini-vue
├── package.json
├── src
│   └── reactivity (模块)
│       ├── index.ts (模块入口文件)
│       └── tests (存放单元测试)
│           └── index.spec.ts (测试文件)
└── yarn.lock
```

在`index.spec.ts`写一点测试代码用于检查环境搭建是否成功

```javascript
// index.spec.ts
describe('reactivity', () => {
   it('test', () => {
      expect(true).toBe(true)
   }); 
});
```

写好后应该有报错表示`typescript`不认识这些`jest`的测试语法，那么接下来开始集成测试环境让其不报错

## 集成测试环境

安装`typescript`

```bash
yarn add typescript -D
```

初始化`typescript`的配置文件`tsconfig.json`

```bash
npx tsc —init
```

安装`jest`

```bash
yarn add jest -D
```

安装`@types/jest`

```bash
yarn add @types/jest
```

::: tip 提示
当使用第三方库时，我们需要引用它的声明文件，才能获得对应的代码补全、接口提示等功能。

[参考](https://ts.xcatliu.com/basics/declaration-files.html)
:::

修改`tsconfig.json`让`typescript`支持`jest`

```json {5}
{
  "compilerOptions": {
    "target": "es2016",                                  
    "module": "commonjs",                                
    "types": ["jest"],                                    
    "esModuleInterop": true,                             
    "forceConsistentCasingInFileNames": true,            
    "strict": true,                                      
    "skipLibCheck": true                                 
  }
}
```

修改`package.json`配置测试脚本

```json {2}
"scripts": {
  "test":"jest"
}
```

运行测试

```bash
yarn test
```

## 测试ES6模块

`src/reactivity/index.ts`下导出一个函数用于测试

```typescript
// index.ts
export function add(a, b) {
    return a + b
}
```

关闭`typescript`的`any`提示，因为我们不关注类型

```json {10}
// tsconfig.json
{
  "compilerOptions": {
    "target": "es2016",                                  
    "module": "commonjs",                                
    "types": ["jest"],                                    
    "esModuleInterop": true,                             
    "forceConsistentCasingInFileNames": true,            
    "strict": true,                                      
    "noImplicitAny": false,
    "skipLibCheck": true                                 
  }
}
```

用ES6的方式引入函数

```typescript {2,6}
// src/reactivity/tests/index.spec.ts
import { add } from '../index';

describe('reactivity', () => {
    it('test', () => {
        expect(add(1, 2)).toBe(3)
    });
});
```

这时候运行测试会报错，因为`node`不认识ES6模块语法，需要使用`babel`进行语法转换

对照[官方文档](https://jestjs.io/zh-Hans/docs/getting-started#%E4%BD%BF%E7%94%A8-babel)下载相关依赖并配置

```bash
yarn add babel-jest @babel/core @babel/preset-env -D
```

```javascript
// babel.config.js
module.exports = {
  presets: [['@babel/preset-env', {targets: {node: 'current'}}]],
}
```

顺便支持一下`typescript`

```bash
yarn add @babel/preset-typescript -D
```

```javascript {5}
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {targets: {node: 'current'}}],
    '@babel/preset-typescript',
  ],
};
```

现在跑一下测试应该就可以通过了

以上就是开发项目需要的测试环境搭建，下一章正式开始探寻`Vue3`的源码
