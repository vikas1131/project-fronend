const express = require('express')
 
const app = express()
 
const path=require('path')
const staticPath = path.join(process.cwd(),'build')
app.use(express.static(staticPath))
app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'))
})
 
app.listen(80, () => {
    console.log('listening on port http://54.88.31.60:80')
})