/**
 * @file 初始化一个react项目
 * @author wenber
 */

require('shelljs/global');

var spawn = require('../lib/spawn');
var config = require('../config');
var fs = require('fs');
var path = require('path');
var util = require('../lib/util');
var _ = require('lodash');
var packageJSON = {};

module.exports = function () {
    // 初始项目
    util.logSuccess('初始化项目开始');
    spawn('npm', ['init'])
        // 创建项目目录结构
        .then(function () {
            return spawn('mkdir', ['-p'].concat(config.directories));
        })
        // 安装项目依赖
        .then(function () {
            util.logSuccess('创建项目目录结构完成');
            return spawn('npm', ['install', '--save'].concat(config.dependencies));
        })
        // 安装环境依赖
        .then(function () {
            util.logSuccess('安装项目依赖完成');
            return spawn('npm', ['install', '--save-dev'].concat(config.devDependencies));
        })
        // 同步任务
        .then(function () {
            util.logSuccess('安装环境依赖完成');
            updatePackageConf();
            // root
            var filePath = path.resolve(__dirname, '../template/root');
            var filesList = fs.readdirSync(filePath);
            filesList.forEach(function (item) {
                // 模板类，需要特殊处理,目前只替换项目名，如果有其他需求，这里细化判断
                if (/tp$/.test(item)) {
                    content = fs.readFileSync(filePath + '/' + item, 'UTF-8');
                    content = content.replace(/\@name\@/g, config.proName);
                    fs.writeFileSync(process.cwd() + '/' + path.basename(item, '.tp'), content, 'UTF-8');
                }
                // 普通文件，直接拷贝
                else {
                    cp(path.resolve(filePath, item), process.cwd() + '/' + item);
                }
            });
            copyPlainFile('common', 'src/common');
            copyPlainFile('debug', 'debug');
            copyPlainFile('middleware', 'middleware');
            copyPlainFile('page', 'src/page');
            copyPlainFile('config', 'config');
            copyPlainFile('src', 'src');
            util.logSuccess('项目目录文件初始化完成');
        });
};

/**
 * 直接拷贝文件夹A
 * @param {string} sourceDir 源目录名
 * @param {string} destDir 目的目录名
 */
function copyPlainFile(sourceDir, destDir) {
    sourceDir = path.resolve(__dirname, '../template/' + sourceDir);
    cp('-r', sourceDir + '/', process.cwd() + '/' + destDir + '/');
};

/**
 * 更新项目的package.json
 */
function updatePackageConf() {
    var packagePath = path.resolve(process.cwd(), './package.json');
    packageJSON = JSON.parse(
        fs.readFileSync(packagePath, 'UTF-8')
    );
    config.proName = packageJSON.name;
    packageJSON.eslintConfig = config.eslintConfig;
    packageJSON.scripts = _.extend(config.scripts, packageJSON.scripts);
    fs.writeFileSync(packagePath, JSON.stringify(packageJSON, null, 2));
}