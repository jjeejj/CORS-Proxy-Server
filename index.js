const Koa = require('koa');
const https = require('https');
const http = require('http');
const request = require('superagent'); 
const bodyParser = require('koa-bodyparser');
const app = new Koa();
const cors = require('./cors');

app.use(cors()); //允许所有的 CORS 请求
app.use(bodyParser()); //解析请求的 body体
/**
 * 处理代理的请求
 */
app.use(async (ctx,next)=>{
    try{
        let reqMethod = ctx.request.method.toLocaleLowerCase(), reqHeaders = ctx.request.headers || {},reqBody = ctx.request.body || {},query = ctx.request.query || {},remoteUrl = query.remoteUrl;

        if(!remoteUrl) {
            ctx.status = 400;
            return ctx.body= '请传入 query 参数 remoteUrl 实际请求的地址';
        };
        delete query.remoteUrl;
        //删除请求中的 host
        delete reqHeaders.host;

        let res = await request[reqMethod](remoteUrl).set(reqHeaders).send(reqBody);;

        console.log('res.body || res.text',res.body, ' || ', res.text);

        return ctx.body = res.body && JSON.stringify(res.body) != '{}' ? res.body : res.text;
    }catch(err){
        ctx.status = 500;
        return ctx.body =  err.message;
    };
});

let httpServer = http.createServer(app.callback());

httpServer.listen(process.env.PORT || 4500,()=>{
    console.log('cors http server is running on ',process.env.PORT || 4500, ' port');
});

// const httpsOptions = {
//     key: fs.readFileSync('./keys/agent2-key.pem'),
//     cert: fs.readFileSync('./keys/agent2-cert.pem')
// };
// let httpsServer = https.createServer(httpsOptions,app.callback());
// httpsServer.listen(4501,()=>{
//     console.log('cors https server is running on ',process.env.PORT || 4501, ' port');
// });