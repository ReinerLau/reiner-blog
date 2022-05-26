<!--
 * @Author: Reiner
 * @Date: 2022-05-24 16:27:26
 * @LastEditors: Do not edit
 * @LastEditTime: 2022-05-26 22:03:33
 * @FilePath: \reiner-blog\docs\pages\posts\mini-vue_5.md
 * @Description: 第五章 - 环境配置
-->
# 第五章 - 环境配置

## 初始化项目

1. 新建项目目录
```bash
mkdir my-mini-vue
```
2. 进入项目目录
```bash
cd my-mini-vue
```
3. 初始化 package.json
```bash
yarn init -y
```
4. 初始化目录结构
```
my-mini-vue
├── package.json
├── src
│   └── reactivity (模块)
│       ├── index.ts (模块入口文件)
│       └── tests (存放单元测试)
│           └── index.spec.js (测试文件)
└── yarn.lock
```