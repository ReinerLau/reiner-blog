/*
 * @Author: 
 * @Date: 2022-05-24 15:38:20
 * @LastEditors: Do not edit
 * @LastEditTime: 2022-05-24 16:31:18
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
            { text: '文章', link: '/pages/posts/' }
        ],
        sidebar: {
            '/pages/posts/': [
                {
                    title: 'mini-vue系列',
                    children: [
                        ['mini-vue_5.md', 'mini-vue第五章-环境配置']
                    ]
                }
            ]
        },
        lastUpdated: true
    }
}