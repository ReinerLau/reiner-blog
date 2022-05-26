<!--
 * @Author: Reiner
 * @Date: 2022-05-24 16:27:26
 * @LastEditors: Do not edit
 * @LastEditTime: 2022-05-27 07:52:06
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
