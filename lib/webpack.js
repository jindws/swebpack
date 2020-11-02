const fs = require('fs')
module.exports = function (options){
    const {entry,mode,output} = options;
    //parse
    const content = fs.readFileSync(entry,'utf-8')
    console.log(content)
}