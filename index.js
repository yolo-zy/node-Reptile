/*
 * @Author: zhangyong
 * @LastEditors: zhangyong
 * @Email: 673966801@qq.com
 * @Description: 
 * @Date: 2019-02-28 11:13:14
 * @LastEditTime: 2019-03-22 11:10:14
 */
const superagent = require("superagent"); //发送网络请求获取DOM
const cheerio = require("cheerio"); //能够像Jquery一样方便获取DOM节点
const fs = require("fs"); //文件读写
const path = require("path"); //路径配置
const schedule = require("node-schedule"); //定时器任务库


//请求DOM
function getData(params) {
    return new Promise(function (resolve, reject) {
        superagent
            .get(params.url)
            .query({
                params: params.ask,
                key: params.job
            })
            .then(res => {
                let data = [];
                let $ = cheerio.load(res.text);
                $('#job_list_table .postIntro').each(function (i, elem) {
                    let title = $(elem).find('.title');
                    let content = [];
                    $(elem).find('#postIntroList .postIntroL').each(function (j, item) {
                        let p = $(item).find('p');
                        content.push({
                            name: $(p).find('.name').find('a').text().replace(/(^\s*)|(\s*$)/g, ""),
                            money: $(p).find('.money').text().replace(/(^\s*)|(\s*$)/g, ""),
                            address: $(p).find('.address').text().replace(/(^\s*)|(\s*$)/g, ""),
                            exp: $(p).find('.exp').text().replace(/(^\s*)|(\s*$)/g, ""),
                        })
                    })
                    data.push({
                        title: $(title).find('a').text().replace(/(^\s*)|(\s*$)/g, "") + $(title).find('span a').text().replace(/(^\s*)|(\s*$)/g, ""),
                        content: content
                    })
                });
                resolve(data)
            })
            .catch(err => {
                reject(err);
            });
    })
}


//职位
const job = "WEB前端工程师";
//条件 五险 公积金 包吃 包住 周末双休 带薪年假 交通补助
const ask = "d01";
//const ask = "d01p2";//加页码
//目标网址
const url = "http://www.huibo.com/jobsearch/";
// http://www.huibo.com/jobsearch/?params=d01p2&key=WEB前端工程师&timestamp=1551330819#list

async function fnSend() {
    //循环抓取  页码条件ask  格式d01p1
    let content = [];
    for (let i = 1; i <= 10; i++) {
        await getData({
            url: url,
            job: job,
            ask: ask + 'p' + i
        }).then((res) => {
            console.log('第' + i + '页已抓取完,等待抓取下一页');
            content.push({
                title:'第'+i+'页',
                content:res
            })
            fs.writeFile("job.json", JSON.stringify(content), err => {
                if (!err) console.log("保存成功~");
            });
        }).catch((err) => {
            console.log("错误:")
        })
        if (i == 11) {
            console.log('已全部抓取完毕');
        }
    }
}

//定时执行任务
// let j = schedule.scheduleJob('0 0 1 * * 2', function () {
//     console.log("执行任务");
//     fnSend();
// });

fnSend()