const express = require("express"),
      expmsg  = require("express-messages"),
      expval  = require("express-validator"),
      exphbs  = require("express-handlebars"),
      session = require("express-session"),
      bodyParser = require("body-parser"),
      cookieParser = require("cookie-parser"),
      mongodb = require("mongodb"),
      mongoose = require("mongoose"),
      flash = require("connect-flash"),
      passport = require("passport"),
      path = require("path"),
      methodOverride = require("method-override");


mongoose.connect("mongodb://localhost:27017/postApp", { useNewUrlParser: true });

const indexRouter = require("./routes/index"),
      usersRouter = require("./routes/users");

const app = express(),
      port = (process.env.PORT || 3000);


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "handlebars");
app.engine("handlebars", exphbs({defaultLayout: "layout"}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

app.use(session({
    secret: "xxxYYYzzz",
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(expval({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
}));
  
app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.use((req, res, next) => {
    res.status(404);
    res.render("errorViews/404", {layout: "errorLayout"});
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500);
    res.render("errorViews/500", {layout: "errorLayout"});
});

app.listen(port, (err) => {
    if(err) throw err;
    else console.log("App Started At Port " + port);
});