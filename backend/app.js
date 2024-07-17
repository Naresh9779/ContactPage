const express = require('express');

const contactRoutes=require('./contactRoute');
const Cors =require('cors')

const app = express();


app.use(express.json());
app.use(Cors())

app.use('/api',contactRoutes)


module.exports=app;
