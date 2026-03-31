// npm install express
//node --watch server.js
//Ctrl S
const express = require('express');
const app = express();


let clienti = [
    {id: 1, nome: "Han Solo", specie: "umano", credito: 1500},
    {id: 2, nome: "Chewbecca", specie: "wookie",credito: 900},
    {id: 3, nome: "Greedo", specie: "rodiano", credito: 900},
    {id: 4, nome: "hammerhead", specie: "ithoriano", credito: 200}
];

let bevande = [
    {id: 1,nome: "Corelian Ale", prezzo: 50, gradazione: 8},
    {id: 2, nome: "Juice", prezzo: 80, gradazione: 15},
    {id: 3, nome: "Meranzane Gold", prezzo: 120, gradazione: 8},
    {id: 4, nome: "Spotchka", prezzo: 200, gradazione: 20},
];

let ordini = [
];
let nextClientId = clienti.length + 1;
let nextBevandaId = bevande.length+1;
let nextOrdineId = ordini.length+1;
//Middleware -> parametri: request, response, next 
//Sempre prima del router handler

//LOGGER
//Log di request method con url
app.use((req, res, next) => {
    console.log("[CANTINA LOG] " + req.method + " " + req.url);
    next();
});
//Middleware : in assenza di tessera (clientiId), bloccato l'acceso 
//GUARDIANO TESSERA
app.use("/clienti", (req, res, next) => {
    const tessera = req.headers["x-tessera"];
    if (!tessera) {
        res.status(403).json({ error: "devi avere una tessera. Regola della cantina" });
    }
    next();
});
//Aggiunge il contesto
//LETTORE GETTONI
app.use("/clienti", (req, res, next) => {
    const gettoni = parseInt(req.headers["x-gettoni"]);
    console.log("[MW Clienti gettoni: ]" + gettoni);
    if (isNaN(gettoni)) {
        req.gettoni = 0;
    }
    else {
        req.gettoni = gettoni;
    }
    next();
});
//Controlla POST e PUT
//VALIDATORE STRUTTURA CLIENTE
app.use("/clienti", (req, res, next) => {
    if ((req.method !== "POST") && (req.method !== "PUT")) {
        return next();
    }
    //Estrae il campo dalla richiesta ___> Cliente
    const nome = req.body.nome;
    const specie = req.body.specie;
    const credito = req.body.credito;
    //Validazione input
    if (!nome || nome.trim() === '') {
        return res.status(400).json({ errore: "URL mal formato" });
    }
    if (!specie || specie.trim() === '') {
        return res.status(400).json({ errore: "URL mal formato" });
    }
    if (!crediti || crediti < 0 || isNaN(parseInt(crediti))) {
        return res.status(400).json({ errore: "URL mal formato" });
    }
    next();
});
//VALIDATORE STRUTTURA ORDINE
    app.use("/ordini", (req, res, next) => {
    //Controlla clienteId, bevanda, quantità
    if(req.method!=="POST"){
        return next();
    }
    const clienteId = req.body.clienteId;
    const bevandaId = req.body.bevandaId;
    const qta = req.body.quantita ;
    if (!clienteId || clienteId.trim()===''){
        return res.status(400).json("URL mal formato");
    }
    if (!bevandaId || bevandaId.trim()===''){
        return res.status(400).json("URL mal formato");
    }
    if (!qta || qta<1 || isNaN(parseInt(qta))){
        return res.status(400).json("URL mal formato");
    }
    next();
});
//Rotta per POST clienti
app.post("/clienti", (req, res) => {
    const nome = req.body.nome;
    const specie = req.body.specie;
    const credito = req.body.credito;

    //Controllo se nuovo utente è già tra I clienti
    for (let c of clienti) {
        if (c.nome.toLocaleLowerCase() === nome.toLowerCase()) {
            res.status(409).resjson({ errore: "Nome non disponibile" });
        }
    }
    let newClient = { id: nextClientId, nome: nome, credito: crediti };
    clienti.push(newClient);
    nextClientId++;
    res.status(201).json(newClient);
});

//Rotta per POST ordini
app.post("/ordini",(req,res)=>{
    //Validazione handler
    const bevandaId = req.body.bevandaId;
    const clienteId = req.body.clienteId;
    const qta = req.body.quantita;
    let costo_base = calcolaCosto(bevandaId,qta);
    let costo_totale = verificaPrezzo(bevandaId,costo_base);
    let newOrder = {
        
    }

})

//Route handler
app.get("/clienti", (req, res) => {
    res.json(clienti);
});

app.listen(3000, () => {
    console.log("Connessione aperta sulla porta 3000");
})


function calcolaCosto(bevandaId,qta){
    let costo_base = 0 ;
    for (let b of bevande) {
        if (b.id===bevandaId){
            costo_base = b.prezzo*qta;
        }
    }
    return costo_base;
  
};

function verificaPrezzo(bevandaId,costo_base) {
    let maggiorazione = false;
    let costo_totale = 0 ;
    for (let b of bevande) {
        if (b.id===bevandaId) {
            if (b.gradazione>10){
                maggiorazione = true;
            }
        }
    }
    if (maggiorazione) {
        let iva = (costo_base/100)*15;
    }
    costo_totale = costo_base+iva ;
    return costo_totale;
}