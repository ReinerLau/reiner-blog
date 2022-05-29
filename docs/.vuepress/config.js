/*
 * @Author: 
 * @Date: 2022-05-24 15:38:20
 * @LastEditors: Do not edit
 * @LastEditTime: 2022-05-29 11:04:54
 * @FilePath: \reiner-blog\docs\.vuepress\config.js
 * @Description: 配置文件
 */
module.exports = {
    title: "Reiner's Blog",
    description: "Reiner的学习之路",
    head: [
        ['link',
            { rel: 'icon', href: '/avator.jpg' }
        ],
    ],
    themeConfig: {
        logo: '/avator.jpg',
        nav: [
            { text: '首页', link: '/' },
            { text: '文章', link: '/pages/posts/' },
            { text: 'mini-vue系列', link: '/pages/mini-vue/' }
        ],
        sidebar: {
            '/pages/posts/': [
                ['', '阅读指南'],
            ],
            '/pages/mini-vue/': [
                ['', 'mini-vue系列'],
                ['mini-vue_5.md', 'mini-vue第五章-环境配置'],
                ['mini-vue_6.md', 'mini-vue第六章-实现 effect & reactive & 依赖收集 & 触发依赖'],
                ['mini-vue_7.md', 'mini-vue第七章-实现 effect 返回 runner']
            ]
        },
        lastUpdated: true,
        nextLinks: true,
        prevLinks: true,
        sidebarDepth: 1
    },
    base: '/reiner-blog/'
}