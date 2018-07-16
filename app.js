let express = require('express');
//验证码模块
let svgCaptcha = require('svg-captcha');
//session模块
let session = require('express-session');
//body-parser 格式化表单的数据
var bodyParser = require('body-parser');
//path
let path = require('path');
// mongo 数据库连接
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'SZHM19';


//创建app
let app = express();

//静态资源托管
app.use(express.static('static'));

//session中间件
app.use(session({
    secret: 'keyboard cat'
}));

//body-Parser 中间件
app.use(bodyParser.urlencoded({
    extended: false
}));

//路由1
//使用get方法 访问登录页时  直接读取页面 并返回
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/static/views/login.html'));

});

//路由2
//生成验证码图片
//把这个地址  设置给 登录页 图片的 src属性
app.get('/login/captchaImg', function (req, res) {
    var captcha = svgCaptcha.create();

    //    console.log(req.session);
    //把验证码的值保存在session中  toLowerCase()  js方法转小写
    req.session.captcha = captcha.text.toLowerCase();
    // console.log(req.session.captcha);
    res.type('svg');
    res.status(200).send(captcha.data);
});

//路由3
//判断验证码
app.post('/login', (req, res) => {
    // console.log(req.body);
    //获取from 表单提交的数据
    let userName = req.body.userName;
    let userPass = req.body.userPass;
    let code = req.body.code;
    //判断验证码
    if (code == req.session.captcha) {
        //正确 设置session保存用户信息 去首页
        req.session.userInfo = {
            userName,
            userPass
        }
        res.redirect('/index');
    } else {
        //返回登录页
        res.setHeader("content-type", 'text/html');
        res.send("<script>alert('验证码错误');window.location.href='/login'</script>")
    }
});

//路由4
//访问首页  判断
app.get('/index', (req, res) => {
    if (req.session.userInfo) {
        //有值 读取首页登录
        res.sendFile(path.join(__dirname, '/static/views/index.html'));
    } else {
        //没值 ,返回登录页
        res.setHeader("content-type", 'text/html');
        res.send("<script>alert('请先登录');window.location.href='/login'</script>")
    }
});

//路由5
//登出
app.get('/logout', (req, res) => {
    //删除session保存的用户数据
    delete req.session.userInfo;
    //跳转登录页
    res.redirect('/login');
});

//路由6
//注册页 展示
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '/static/views/register.html'));
});

//路由7
//注册页 判断注册信息 跳转登录
app.post('/register',(req,res)=>{
    let userName=req.body.userName;
    let password=req.body.password;
    MongoClient.connect(url, function(err, client) {
        const db = client.db(dbName);
        const collection = db.collection('userList');
        collection.find({
            userName
        }).toArray(function(err, docs) {
            console.log(docs.length);
            if(docs.length==0){
                collection.insertOne({
                    userName,password
                }
                , function(err, result) {
                      console.log(err)
                      res.setHeader('content-type','text/html');
                      res.send("<script>window.location='/login'</script>")
                });
            }
        });
    });
})

//监听
app.listen(80, '127.0.0.1', () => {
    console.log('success');
})