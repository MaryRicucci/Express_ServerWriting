// npm install express
//node --watch server.js
//Ctrl S
const express = require('express');
const app = express();
app.use(express.json());

let clienti = [
    {id: 1, nome: "Han Solo", specie: "umano", credito: 1500},
    {id: 2, nome: "Greedo", specie: "rodiano", credito: 300},
    {id: 3, nome: "Chewbecca", specie: "wookie",credito: 900},
    {id: 4, nome: "hammerhead", specie: "ithoriano", credito: 200}
];

let bevande = [
    {id: 1,nome: "Corelian Ale", prezzo: 50, gradazione: 8},
    {id: 2, nome: "Juice", prezzo: 80, gradazione: 15},
    {id: 3, nome: "Meranzane Gold", prezzo: 120, gradazione: 8},
    {id: 4, nome: "Spotchka", prezzo: 200, gradazione: 20},
];
let ordini = [
    {id: 1, clienteId: 1, bevandaId: 4, quantita: 3, costoBase: 600, maggiorazione: 90, costoTotale: 690},
    {id: 2, clienteId: 2, bevandaId: 1, quantita: 10, costoBase: 500, maggiorazione: 0, costoTotale: 500},
    {id: 3, clienteId: 3, bevandaId: 3, quantita: 2, costoBase: 240, maggiorazione: 36, costoTotale: 276},
    {id: 4, clienteId: 4, bevandaId: 2, quantita: 2, costoBase: 160, maggiorazione: 24, costoTotale: 184}
];
let taglie = [
    {id:1, clienteId: 2, motivazione: "ha rubato una nave", ricompensa: 800, attiva:true}
];
let missioni =  [{ id: 1, codice: 'AURORA-1', descrizione: 'Recupero piani della Morte Nera', pianeta: 'Scarif', rischio: 'alto', clearance: 3, agente: 'Cassian Andor' },
{ id: 2, codice: 'NEBULA-4', descrizione: 'Sorveglianza porto di Mos Eisley', pianeta: 'Tatooine', rischio: 'basso', clearance: 1, agente: 'Fulcrum' },
{ id: 3, codice: 'ECLIPSE-7', descrizione: 'Sabotaggio generatori imperiali', pianeta: 'Lothal', rischio: 'alto', clearance: 2, agente: 'Hera Syndulla' },
{ id: 4, codice: 'PHANTOM-2', descrizione: 'Estrazione agente sotto copertura', pianeta: 'Coruscant', rischio: 'critico', clearance: 3, agente: 'Sconosciuto' }];
let tessere = [
    {codice: "HAN-001",ruolo:"cliente",clearance:1},
    {codice: "CHEWIE-02",ruolo: "cliente",clearance:1},
    {codice: "BOBA-007",ruolo:"cacciatore",clearance:2},
    {codice : "BOSSK-008",ruolo: "cacciatore",clearance:1},
    {codice: "FULCRUM-3",ruolo: "ribelle", clearance:2},
    {codice : "CASSIAN-9",ruolo: "ribelle",clearance:3},
    {codice: "ADMIN-000", ruolo: "admin", clearance: 3}
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
        return res.status(401).json({ error: "Tessera mancante. Nessuno entra senza tesserino." });
    }
    let tex = null;
    //QUI
    for (let t of tessere) {
        if (t.codice===tessera){
            tex = t;
            console.log(tex);
        }
    }
    
    if(!tex){
         return res.status(403).json({error: "tessera non riconosciuta"});
    }
    else{
        req.tessera=tex;
}

    next();
});
//Aggiunge il contesto
//LETTORE GETTONI
app.use("/clienti", (req, res, next) => {
    const ruolo = req.headers["x-ruolo"];
    if (!ruolo){
        req.ruolo = "ospite";
    }
    else {
        req.ruolo = ruolo ;
    }
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
//Validatore tessera Ordini
app.use("/ordini",(req,res,next)=>{
if((req.tessera.ruolo!=="admin")&&(req.tessera.ruolo!=="cliente")){
        return res.status(405).json({error : "Non hai l'autorizzazione per vedere ordini"});
    }
    next();
})

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

app.use("/missioni",(req,res,next)=>{
    const ruolo = req.tessera.ruolo ;
    if ((ruolo!=="ribelle")&&((ruolo!=="admin"))){
        return res.status(403).json("Non sei autorizzato ad accedere a questa risorsa.");
    }
    next();
});
app.use("/missioni",(req,res,next)=>{
    if (req.method!=="GET"){
        return res.status(405).json("Metodo non consentito. Le missioni non si toccano");
    }
    next();
});

app.use("/missioni",(req,res,next)=>{
    req.clearance = req.tessera.clearance ;
    req.missioniVisibili = [];
    for (let m of missioni) {
        if (m.clearance<=req.clearance){
           req.missioniVisibili.push(m);
        }
    }
    next();
});
//Middleware per taglie
app.use("/taglie",(req,res,next)=>{
    if((req.tessera.ruolo!=="cacciatore")&&(req.tessera.ruolo!=="admin")){
        return res.status(405).json("Non sei autorizzato ad accedere a questa risorsa");
    }

})

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
        clienteId : clienteId ,
        bevandaId : bevandaId ,
        quantita : qta ,
        costo_base : costo_base , 
        maggiorazione : maggiorazione ,
        costo_totale : costo_totale
    };
    ordini.push(newOrder);
    client.credito-=costo_totale;
    nextOrdineId++;
    let numeroTaglie = 0;
    let taglia_riscossa = 0 ;
    for (let t of taglie ) {
    if (t.clienteId===client.id){
        if (t.attiva) {
            t.attiva = false;
            if (client.credito<500){
                taglia_riscossa=t.ricompensa+(t.ricompensa/100)*20;
                //client.credito+=taglia_riscossa; a chi va la ricompensa? a lui? a chi lo vede?
            }
            numeroTaglie++;
        }
    }}
    res.status(201).json({newOrder,taglia_riscossa,numeroTaglie});
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
    if (req.tessera.ruolo!=="admin"){
        return res.status(405).json({error: "Solo l'admin può rimuovere clienti"});
    }
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
//Get clienti/id/ordini
app.get("/clienti/:id/ordini",(req,res)=>{
    const id = parseInt(req.params.id) ;
    let cliente = null ;
    if (!Number.isInteger(Number(id))){
        return res.status(400).json("Id non valido");
    }
    for (let c of clienti) {
        if (c.id===id){
            cliente = c;
            break ;
        }
    }
    if (!cliente) {
        return res.status(404).json("Cliente non trovato");
    }
    let orders = [];
    for (let o of ordini){
        if (o.clienteId===id){
            orders.push(o);
        }
    }
    if (req.ruolo==="admin"){
        return res.status(200).json(orders);
    }
    else{
        let ordineWh = [];
        for (let o of orders) {
            let copia = {
                id: o.id,
                clienteId : o.clienteId,
                bevandaId: o.bevandaId,
                quantita: o.quantita,
                costo_base: o.costo_base ,
                maggiorazione: o.maggiorazione
            }
            ordineWh.push(copia);
        }
        return res.status(200).json(ordineWh);
    }
});
// Rotta GET clienti/id/riepilogo
app.get("/clienti/:id/riepilogo", (req, res) => {
    const id = parseInt(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json("id non valido");
    }
    let cliente = null;
    for (let c of clienti) {
        if (c.id === id) {
            cliente = c;
            break;
        }
    }
    if (!cliente) {
        return res.status(404).json("Utente non trovato");
    }
    let result = {
        cliente: cliente.nome,
        credito_attuale: cliente.credito,
        numero_ordini: 0,
        totale_speso: 0,
        bevanda_preferita: null,
        taglie_attive: 0
    };
    let clientOrders = [];
    let bevandePref = [];
    for (let o of ordini) {
        if (o.clienteId === id) {
            result.totale_speso += o.costoTotale;
            result.numero_ordini++;
            clientOrders.push(o);
        }
    }
    for (let t of taglie) {
        if (t.clienteId === id && t.attiva === true) {
            result.taglie_attive++;
        }
    }
    for (let o of clientOrders) {
        if (bevandePref.length === 0) {
            bevandePref.push({
                id: o.bevandaId,
                qta: o.quantita
            });
            continue;
        }
    let trovata = false;
        for (let b of bevandePref) {
            if (b.id === o.bevandaId) {
                b.qta += o.quantita;
                trovata = true;
                break;
            }
        }

        if (!trovata) {
            bevandePref.push({
                id: o.bevandaId,
                qta: o.quantita
            });
        }
    }
    let bevPref = { id: -1, qta: -1 };
    for (let b of bevandePref) {
        if (b.qta > bevPref.qta) {
            bevPref.id = b.id;
            bevPref.qta = b.qta;
        }
    }
    if (bevPref.id !== -1) {
        for (let b of bevande) {
            if (b.id === bevPref.id) {
                result.bevanda_preferita = b.nome;
                break;
            }
        }
    }

    return res.status(200).json(result);
});

//Get missioni
app.get("/missioni",(req,res)=> {
    if(req.clearance===0){
        return res.status(403).json("Clearance insufficiente. Non sai niente.");
    }
    else if (req.clearance<3){
        let visibili = [];
        for (let m of req.missioniVisibili){
            let copia = {
                id : m.id ,
                nome : m.nome ,
                agente :  "[CLASSIFICATO]" ,
                clearance : m.clearance ,
                descrizione : m.descrizione
            }
            visibili.push(copia);
        }
        return res.status(200).json(visibili);
    }
    else{
        return res.status(200).json(req.missioniVisibili);
    }
});
//get missioni/id
app.get("/missioni/:id", (req, res) => {
    const id = parseInt(req.params.id);
    let copia = null;

    // Caso 1: clearance 0 → blocco totale
    if (req.clearance === 0) {
        return res.status(403).json("Clearance insufficiente. Non sai niente.");
    }

    // Cerco la missione nelle missioni visibili
    for (let m of req.missioniVisibili) {
        if (m.id === id) {
            copia = {
                id: m.id,
                nome: m.nome,
                agente: m.agente,     
                clearance: m.clearance,
                descrizione: m.descrizione
            };

            if (req.clearance < 3) {
                copia.agente = "[CLASSIFICATO]";
            }

            break;
        }
    }
    if (!copia) {
        let presente = false;

        for (let m of missioni) {
            if (m.id === id) {
                presente = true;
                break;
            }
        }

        if (presente) {
            return res.status(403).json("Clearance insufficiente per questa missione.");
        } else {
            return res.status(404).json("Missione non trovata.");
        }
    }
    return res.status(200).json(copia);
});
//PATCH /taglie
app.patch("/taglie/:id/chiudi",(req,res)=>{
    const ruolo = req.tessera.ruolo;
    const id = parseInt(req.params.id);
    if (ruolo!=="admin"){
        return res.status(403).json({errore : 'Non sei autorizzato a modificare questa risorsa'});
    }
    if (isNaN(id)){
        return res.status(400).json({errore: 'ID non valido'});
    }
    let taglia = null;
    for (let t of taglie) {
        // {, motivazione, ricompensa, attiva}
        if (t.id===id){
            taglia = t ;
            break ;
        }
    }
    if (!taglia){
       return res.status(404).json({errore: 'Taglia non trovata'});
    }
    if (!taglia.attiva){
        return res.status(400).json({errore: 'Taglia già riscossa'});
    }
    taglia.attiva = false ;
    res.status(200).json({message: 'taglia riscossa',taglia});
    
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

