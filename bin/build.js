#! /usr/bin/env node
var Promise=require('bluebird')
var fs=Promise.promisifyAll(require('fs'))
var aws=require('aws-sdk')
var chalk=require('chalk')
aws.config.setPromisesDependency(Promise)
aws.config.region=require('../config').region
var cf=new aws.CloudFormation()
var stringify=require("json-stringify-pretty-compact")
var fs = require('fs');

var name=process.argv[2]
var mainfile=__dirname+'/../templates/'+name
var testfile=__dirname+'/../templates/'+name+'/test.js'
var mainoutput=__dirname+'/../build/templates/'+name+'.json'
var testoutput=__dirname+'/../build/templates/'+name+'-test.json'


Promise.resolve(require(mainfile+'/index'))
.then(function(result){
    var template=JSON.stringify(result)
    create(template,name,mainoutput)
})

if (fs.existsSync(testfile)) {
    Promise.resolve(require(testfile))
    .then(function(result){
        var testtemplate=JSON.stringify(result)
        create(testtemplate,name+'-test',testoutput)
    })
}

function create(temp,name,output){
    console.log('building '+name)
    cf.validateTemplate({
        TemplateBody:temp
    }).promise()
    .tap(()=>console.log(chalk.green(name+" is valid")))
    .catch(error=>console.log(chalk.red(name+" failed:"+error)))
    .tap(()=>console.log("writting to "+output))
    .tap(()=>fs.writeFileAsync(output,temp))

    .tap(()=>console.log('finished building '+name))
}





