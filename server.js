// npm install express
//node --watch server.js
//Ctrl S
const express = require('express');
const app= express();


let clienti = [
{id:1,
    nome : "Han Solo",
    specie: "umano",
    crediti: 1500
},
{id:2,
    nome: "Chewbecca",
    specie:"wookie",
    crediti: 900,
},
{id:3,
    nome: "Greedo",
    specie:"rodiano",
    crediti : 900
},
{id:4,
    nome: "hammerhead",
    specie: "ithoriano",
    crediti: 200
}
];

let bevande = [
    {id: 1,
        nome: "Corelian Ale",
        prezzo: 50,
        gradazione: 8
    },
    {id:2,
        nome: "Juice",
        prezzo: 80,
        gradazione : 15
    },
    {id:3,
        nome: "Meranzane Gold",
        prezzo:120,
        gradazione: 8
    },
    {id:4,
        nome: "Spotchka",
        prezzo:200,
        gradazione: 20
    }
]

let nextClientId = clienti.length+1;

//Middleware -> parametri: request, response, next 
//Sempre prima del router handler
//Log di request method con url
app.use((req,res,next)=>{
    console.log("[CANTINA LOG] "+req.method+" "+req.url);
    next();
});
//Middleware : in assenza di tessera (clientiId), bloccato l'acceso 
//Guardia
app.use("/clienti",(req,res,next)=>{
    const tessera = req.headers["x-tessera"];
    if(!tessera){
        res.status(403).json({error:"devi avere una tessera. Regola della cantina"});
    }
    next();
});
//Aggiunge il contesto
app.use("/clienti",(req,res,next)=>{
    const gettoni = parseInt(req.headers["x-gettoni"]);
    console.log("[MW Clienti gettoni: ]"+gettoni);
    if(isNaN(gettoni)){
        req.gettoni=0;
    }
    else{
        req.gettoni=gettoni;
    }
    next();
});
//Controlla POST e PUT
app.use("/clienti",(req,res,next)=>{
    if((req.method!=="POST")&&(req.method!=="PUT")){
        return next();
    }
    //Estrae il campo dalla richiesta ___> Cliente
    const nome = req.body.nome;
    const specie = req.body.specie;
    const crediti = req.body.crediti;
    //Validazione input
    if(!nome){
        res.status(400).json({errore: "URL mal formato"});
    }

    if(!specie){
        res.status(400).json({errore: "Specie non specificata"});
    }
    if(!crediti){
        res.status(400).json({errore: "Crediti invalidi"});
    }
})

//Route handler
app.get("/clienti",(req,res) => {
res.json(clienti);
});

app.listen(3000,()=>{
    console.log("Connessione aperta sulla porta 3000");
})