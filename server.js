// npm install express
//node --watch server.js
//Ctrl S
const express = require('express');
const app = express();
app.use(express.json());
//Tutti i MIDDLEWARE OK

let clienti = [
    {id: 1, nome: "Han Solo", specie: "umano", credito: 1500},
    {id: 2, nome: "Chewbecca", specie: "wookie",credito: 900},
    {id: 3, nome: "Greedo", specie: "rodiano", credito: 300},
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
    if (!credito || credito < 0 || isNaN(parseInt(credito))) {
        return res.status(400).json({ errore: "URL mal formato" });
    }
    next();
});
//VALIDATORE STRUTTURA ORDINE
app.use("/ordini", (req, res, next) => {
    if (req.method !== "POST") {
        return next();
    }

    const clienteId = req.body.clienteId;
    const bevandaId = req.body.bevandaId;
    const qta = req.body.quantita;

    // clienteId deve essere un numero valido
    if (clienteId === undefined || isNaN(parseInt(clienteId))) {
        return res.status(400).json("URL mal formato");
    }

    // bevandaId deve essere un numero valido
    if (bevandaId === undefined || isNaN(parseInt(bevandaId))) {
        return res.status(400).json("URL mal formato");
    }

    // quantita deve essere un numero >= 1
    if (qta === undefined || isNaN(parseInt(qta)) || qta < 1) {
        return res.status(400).json("URL mal formato");
    }

    next();
});

app.use("/bevande",(req,res,next)=>{
const headerReq = req.headers["x-gradazione-max"];
const parsed = parseInt(headerReq);
if(!headerReq||Number.isNaN(parsed)){
    req.gradazioneMax = null ;
}
else {
    req.gradazioneMax = parsed;
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
            return res.status(409).json({ errore: "Nome non disponibile" });
        }
    }
    let newClient = { id: nextClientId, nome: nome,specie: specie, credito: credito };
    clienti.push(newClient);
    nextClientId++;
     res.status(201).json(newClient);
});

//Route handler
app.get("/clienti", (req, res) => {
    res.json(clienti);
});

app.get("/clienti/:id",(req,res)=>{
    const idCliente = parseInt(req.params.id);
    let cliente = null;
    for (let c of clienti) {
        if(c.id===idCliente){
            cliente = c ;
            break;
        }
    }
    if(!cliente){
        return res.status(404).json("Cliente non trovato");
    }
    res.status(200).json(cliente);
});

//Rotta per POST ordini
app.post("/ordini",(req,res)=>{
    //Validazione handler
    let clienteId = null;
    let bevandaId = null;
    for (let c of clienti) {
        if (c.id ===req.body.clienteId){
            clienteId = req.body.clienteId;
            break;
        }
    }

    for (let b of bevande) {
        if(b.id===req.body.bevandaId){
            bevandaId = req.body.bevandaId;
            break;
        }
    }

    if(!clienteId) {
        return res.status(404).res.json("Cliente non trovato")
    }
    
    if(!bevandaId) {
        return res.status(404).res.json("Bevanda non trovata");
    }
    
    const qta = req.body.quantita;
    let costo_base = calcolaCosto(bevandaId,qta);
    let verifyMag = verificaPrezzo(bevandaId,costo_base);
    let maggiorazione = verifyMag.iva ;
    let costo_totale = verifyMag.costo_totale ;
    const idCliente = req.body.clienteId ;
    let client = null;
    for (let c of clienti) {
        if (c.id===idCliente) {
            client = c;
        }
    }
    if (!client) {
        return res.status(404).json("Cliente non trovato");
    }
    if(client.credito<costo_totale){
        return res.status(403).json("Credito insufficiente");
    }
    let newOrder = {
        id : nextOrdineId ,
        cliente : clienteId ,
        bevanda : bevandaId ,
        quantita : qta ,
        costo_base : costo_base , 
        maggiorazione : maggiorazione ,
        costo_totale : costo_totale
    }
    ordini.push(newOrder);
    client.credito-=costo_totale;
    nextOrdineId++;
    res.status(201).json(newOrder);
})

//Rotta per PUT cliente
app.put("/clienti/:id",(req,res)=>{
    const idCliente = parseInt(req.params.id);
    let cliente = null;
    for (let c of clienti) {
        if (c.id===idCliente) {
           cliente = c;
           break;
        }
    }
    if(!cliente){
        return res.status(404).json("Utente non trovato");
    }
    cliente.nome = req.body.nome;
    cliente.credito = req.body.credito;
    cliente.specie = req.body.specie;
    res.status(200).json(cliente);
});

//Rotta per DELETE cliente
app.delete("/clienti/:id",(req,res)=>{
    const id = parseInt(req.params.id);
    let cliente = -1;
    for (let c=0; c<clienti.length;c++) {
        if (clienti[c].id ===id) {
            cliente = c;
            break;
        }
    }
    if(cliente<0){
        return res.status(404).json("Cliente non trovato");
    }
    clienti.splice(cliente,1);
    res.status(200).json("Cliente eliminato");
})


//Rotta per GET ordini
app.get("/ordini",(req,res)=>{
    res.json(ordini);
})
app.get("/ordini/:id",(req,res)=>{
    const id = parseInt(req.params.id);
    let ordine = null;
    for (let o of ordini) {
        if (o.id===id){
            ordine=o;
            break;
        }
    }
    if(!ordine){
        return res.status(404).json("Ordine non trovato")
    }
    res.status(200).json(ordine);
})

//Rotta per GET bevande 
app.get("/bevande",(req,res)=>{
    let bev = [];
  if (req.gradazioneMax===null){
    return res.json(bevande);
  }
  else {
    for (let b of bevande) {
        if (b.gradazione<=req.gradazioneMax){
           bev.push(b);
        }
    }
    res.status(200).json(bev);
  }
})


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
    let iva = 0 ;
    let costo_totale = 0 ;
    for (let b of bevande) {
        if (b.id===bevandaId) {
            if (b.gradazione>10){
                maggiorazione = true;
            }
        }
    }
    if (maggiorazione) {
        iva = (costo_base/100)*15;
    }
    costo_totale = costo_base+iva ;
    return {iva, costo_totale};
}
