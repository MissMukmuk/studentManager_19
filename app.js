let express = require('express');
//验证码模块
let svgCaptcha = require('svg-captcha');
//session
let session = require('express-session');
//path
let path = require('path');

//创建app
let app = express();

//静态资源托管
app.use(express.static('static'));
//session
app.use(session({
    secret: 'keyboard cat'
   
  }))
//路由1
//使用get方法 访问登录页时  直接读取页面 并返回
app.get('/login',(req,res)=>{
  res.sendFile(path.join(__dirname,'/static/views/login.html'));

});

//路由2
//生成验证码图片
//把这个地址  设置给 登录页 图片的 src属性
app.get('/login/captchaImg', function (req, res) {
    var captcha = svgCaptcha.create();
    
   console.log(req.session);
    req.session.captcha = captcha.text;
    console.log(req.session.captcha);
    res.type('svg');
    res.status(200).send(captcha.data);
});

//监听

app.listen(80,'127.0.0.1',()=>{
    console.log('success');
})