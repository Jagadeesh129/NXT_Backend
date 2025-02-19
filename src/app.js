const express = require('express');

const app = express();

app.use((req,res)=>{
    res.send("Hello from the server");
})

app.listen(3333, () => {
    console.log("Server is successfully listening on port 3333");
});