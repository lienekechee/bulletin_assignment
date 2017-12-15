const express = require('express')
const app = express()
const pug = require('pug')
const bodyParser = require('body-parser')
const path = require('path')
const cookieParser = require('cookie-parser')
const port= process.env.port


app.set('views', './views')
app.set('view engine', 'pug')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
console.log (__dirname)
app.use(cookieParser())
require('dotenv').config()

//connecting to database
const Client = require('pg')
const client = new Client({
	database: 'bulletinboard',
	port: process.env.databaseport,
	host: 'localhost',
	user: process.env.POSTGRES_USER
})

client.connect()



//Get request rendering index.pug
app.get('/', function (req, res){
	res.render ('index')
})

app.get('/getCookie', (req,res)=>{
	console.log(req.cookies)

	res.send("Cookie read")
})

app.get('/setCookie', (req, res)=>{

	res.cookie('name', 'tobi', { 
		domain: '.example.com', 
		path: '/admin', 
		secure: true });
})

//Post request insert messages into database
app.post('/postMsg', function(req, res){

	//getting data from form
	const data = {title : req.body.msgSubject, body: req.body.msgBody}
	console.log (data)

	//inserting data into messages table
	client.query('insert into messages(title, body) values ($1, $2)', [data.title, data.body], (err, result)=>{
		console.log(err ? err.stack : result.rows)

	});

	res.redirect('/bulletin')

});

//Get request retrieving messages from database
app.get('/bulletin', function(req, res){

	client.query('select * from messages order by id asc', (err, result)=>{
		
		console.log(err ? err.stack : result.rows) //
  	
    results = result.rows
    console.log (results)
	res.render ('bulletin', {results: result.rows}) 
	});
});


app.listen(port, function(){
	console.log('ITS WORKING!')
})

//Review: initially i had both the response and results parameters in the request and query 
//both shortened to res. These parameters were therefore conflated.  They must have distinct
//names because they refer to the outcomes to two separate processes.

//Routes
//1. GET = retrieve index page with form
	
//2. POST = CREATE; post message content to the server by adding row to table in database
	//a. connect to database
	//b. handle connection errors
	//c. SQL query insert data into table
	//d. select all data in the table
	//e. use query.on('row') to push rows into array
	//f. return results res.send/res.json
	//e. close connection


//3. GET = retrieve information from database for bulletin board page
	//a. connect to database
	//b. handle connection errors
	//c. SQL query select all data from table
	//d. use query.on('row') to push rows into array
	//e. res.render bulletin page the displays each item in the array in order of id

//4. GET = READ; retrieve bulletinboard page