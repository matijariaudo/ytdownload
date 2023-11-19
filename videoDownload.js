const express = require('express');
const yt = require("yt-converter");
const fs=require('fs');
const path=require('path')

const app = express()
require('dotenv').config()

function buscar_video(url)
{
    return new Promise((resolve, reject) => {
        yt.getInfo(url).then(info => {
        resolve(info)
        }).catch(e=>{
        resolve()
        });    
    })
    
}

function descargar_video(url,newName)
{
    return new Promise((resolve, reject) => {
        yt.convertAudio({
            url: url,
            itag: 140,
            directoryDownload: __dirname+"/downloads",
            title: newName
            }, (a)=>{
            console.log("Bajando: %",a)
            }, (path)=>{
            console.log("Se ha bajado",__dirname+"/downloads/"+newName)
            resolve(__dirname+"/downloads/"+newName)
        })       
    })
    
}
function limpiarTexto(texto) {
    // Reemplazar caracteres con acentos por sus equivalentes sin acentos
    const mapaAcentos = {
      'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
      'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U'
      // Puedes añadir más caracteres con acento y sus equivalentes aquí
    };
  
    texto = texto.replace(/[áéíóúÁÉÍÓÚ]/g, function(match) {
      return mapaAcentos[match];
    });
  
    // Eliminar puntos y caracteres que no son letras ni paréntesis
    texto = texto.replace(/[^a-zA-Z() \s]/g, '');

  
    return texto;
}
  
function verArchivos(){
    fs.readdir('./downloads', (err, archivos) => {
        if (err) {
            console.error('Error al leer el directorio:', err);
            return;
        }
        
        console.log('Archivos en la carpeta:');
        archivos.forEach((archivo) => {
            console.log(archivo);
        });
        return;
    });
}



console.clear()

app.use(express.json())
app.use(express.static(path.join(__dirname, './public')));
app.get('/api/:url', async(req, res)=>{
    cod=req.params.url;
    data=await buscar_video("https://www.youtube.com/watch?v="+cod)
    if(!data){
        return res.status(200).json({"error":"No es un video"})
    }else{
        console.log(req.params.url)
        nam=data.title; 
        const nuevoAudio=await descargar_video("https://www.youtube.com/watch?v="+cod,nam)
        verArchivos();
        return res.download(nuevoAudio+".mp3",function(e){
            //Si hay error le aviso al cliente
            if(e){
                return res.status(500).send('Error al descargar el archivo');
            }            
            //Si no hay error elimino el archivo
            fs.unlink(nuevoAudio+".mp3", (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error al eliminar el archivo:', unlinkErr);
                } else {
                    console.log('Archivo eliminado correctamente');
                }
            });
        })
    }
})

app.get('*', function (req, res) {
    console.log("NO entro nada")
    res.sendFile(path.join(__dirname, './public/index.html'))
})



const init=async()=>{
console.clear()
const port=process.env.PORT|| 3000;
app.listen(port)
console.log("Listen ",port)
}

init()