const fs = require('fs')
const path = require('path')
const parse = require('@babel/parser')
const traverse = require('@babel/traverse').default

const {transformFromAst} = require('@babel/core')

module.exports = function (options){
    const {entry,output} = options;

    const modules = []

    function parseFile(entry){
        //parse
        const content = fs.readFileSync(entry,'utf-8')

        const ast = parse.parse(content,{//ast格式
            sourceType:"module"
        })

        const dependencies = {}

        traverse(ast,{
            //ImportDeclaration import * from *
            ImportDeclaration({node}){
                dependencies[node.source.value] = path.join(path.dirname(entry),node.source.value)
            }
        })

        const {code} =transformFromAst(ast,null,{
            presets:["@babel/preset-env"]
        })

        return {
            entry,
            dependencies,
            code
        }
    }

    modules.push(parseFile(entry))

    for(let i=0;i<modules.length;i++){//递归获取所有模块信息
        const {dependencies} = modules[i]
        for (const itm in dependencies) {
            modules.push(parseFile(dependencies[itm]))
        }
    }

    const main = {}

    modules.forEach(({entry,...data})=>{
        main[entry] = data
    })

    const outputFilePath = path.join(output.path,output.filename)

    const bundle = `(function(graph){
           function require(module){
                var exports = {}
                function _require(_path){
                      return require(graph[module].dependencies[_path])
                }
                (function(require,code,exports){
                    eval(code)
                })(_require,graph[module].code,exports)
                return exports
           }
           require('${entry}')
    })(${JSON.stringify(main)})`

    fs.writeFileSync(outputFilePath,bundle,'utf-8')
}