const express = require('express');
const yt = require("yt-converter");
const fs=require('fs');
const path=require('path')
const fse = require('fs-extra');

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

function descargar_video(url,name,carpeta)
{
    return new Promise((resolve, reject) => {
        yt.convertAudio({
            url: url,
            itag: 140,
            directoryDownload: __dirname+"/downloads/"+carpeta,
            title:name
            }, (a)=>{
            console.log("Bajando: %",a)
            }, (path)=>{
            console.log("Se ha bajado")
            resolve( __dirname+"/downloads/"+carpeta)
        })       
    })
    
}
function limpiarTexto(texto) {

}

function crearCarpeta(name){
    // Ruta de la carpeta que deseas crear
    const nombreCarpeta = './downloads/'+name;
    // Verificar si la carpeta ya existe
    if (!fs.existsSync(nombreCarpeta)) {
    // Crear la carpeta
    fs.mkdir(nombreCarpeta, (err) => {
        if (err) {
        console.error('Error al crear la carpeta:', err);
        } else {
        console.log('Carpeta creada exitosamente:', nombreCarpeta);
        }
    });
    } else {
    console.log('La carpeta ya existe:', nombreCarpeta);
    }
}
function eliminarCarpeta(name) {
    const nombreCarpeta = './downloads/'+name; // Ruta de la carpeta que deseas eliminar
    // Elimina la carpeta y su contenido de forma recursiva
    fse.remove(nombreCarpeta)
      .then(() => {
        console.log('Carpeta y su contenido eliminados:', nombreCarpeta);
      })
      .catch((err) => {
        console.error('Error al eliminar la carpeta:', err);
      });
}
function generarCodigoAleatorio(nro=4) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let codigo = '';
  
    for (let i = 0; i < nro; i++) {
      const randomIndex = Math.floor(Math.random() * caracteres.length);
      codigo += caracteres.charAt(randomIndex);
    }
    return codigo;
}
  
function verArchivos(name){
    return new Promise((resolve, reject) => {
        const directorio='./downloads/'+name;
        let archivoEncontrado=false;
        console.log("directorio",directorio)
        fs.readdir(directorio, (err, archivos) => {
            if (err) {
                console.error('Error al leer el directorio:', err);
                return;
            }
            archivos.forEach((archivo) => {
                console.log("Arch",archivo)
                if(!archivoEncontrado){resolve(archivo);}
            });
        });
    })
}



console.clear()

app.use(express.json())
app.use(express.static(path.join(__dirname, './public')));
app.get('/api/:url', async(req, res)=>{
    cod=req.params.url;
    console.log(req.params.url)
    data=await buscar_video("https://www.youtube.com/watch?v="+cod)
    if(!data){
        return res.status(200).json({"error":"No es un video"})
    }else{
        const provisorioName=generarCodigoAleatorio();
        crearCarpeta(provisorioName);
        console.log(1)
        const nuevoAudio=await descargar_video("https://www.youtube.com/watch?v="+cod,data.title,provisorioName)
        console.log(2,nuevoAudio,provisorioName)
        const nameArchivo=await verArchivos(provisorioName);
        console.log(3,nameArchivo)
        return res.download('./downloads/'+provisorioName+'/'+nameArchivo,function(e){
            //Si hay error le aviso al cliente
            if(e){
                return res.status(500).send('Error al descargar el archivo');
            }            
            eliminarCarpeta(provisorioName)
        })
    }
})

app.get('*', function (req, res) {
    console.log("NO entro nada")
    res.sendFile(path.join(__dirname, './public/index.html'))
})



const init=async()=>{
console.clear()
const port=process.env.PORT|| 8000;
app.listen(port)
console.log("Listen ",port)
//eliminarCarpeta('ZFGY')
}

init()