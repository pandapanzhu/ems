
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  //添加ejs支持和mongoose支持
  ,ejs=require('ejs')
  ,mongoose=require('mongoose')
  //导入index
  ,index=require('./routes')
  ,admin_student=require('./routes/admin/student')
  //使用flash，用于前台提示
  ,flash=require('connect-flash')
  ,session=require('express-session')

  ;

//实例化express 并赋值app变量
var app = express();

//连接本地数据库
mongoose.connect('mongodb://127.0.0.1:27017/ems');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');

//添加html模板支持
app.engine('.html',ejs.__express);
app.set('view engine','html');
//app.set('view engine', 'ejs');

app.use(session({
  secret:'myems',
  key:'ems',
  cookie:{maxAge:1000*60*60*24}
}));


//使用flash，用于前台提示
app.use(flash());

app.use(express.favicon());
app.use(express.logger('dev'));

//此为接受前台传入的数据-->纯文本
//app.use(express.bodyParser());
//要接受图片的话，应改为如下所示：
app.use(express.bodyParser({uploadDir:'E:\\ems\\ems\\up\\temp\\'}));

app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
//调用router中的index.js
index(app);
admin_student(app);
/*app.get('/', routes.index);
app.get('/users', user.list);
app.get('/login',routes.login);
app.post('loginForm',routes.doLogin);*/
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
