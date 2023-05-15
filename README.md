<!-- PROJECT SHIELDS -->
[![NPM][npm-shield]](https://www.npmjs.com/package/@afipsdk/afip.js)
[![Contributors][contributors-shield]](https://github.com/afipsdk/afip.js/graphs/contributors)
[![Closed issues][issues-shield]](https://github.com/afipsdk/afip.js/issues)
[![License][license-shield]](https://github.com/afipsdk/afip.js/blob/master/LICENSE)

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/afipsdk/afip.js">
    <img src="https://github.com/afipsdk/afipsdk.github.io/blob/master/images/logo-colored.png" alt="Afip.js" width="130" height="130">
  </a>

  <h3 align="center">Afip.js</h3>

  <p align="center">
    Librería para conectarse a los Web Services de AFIP
    <br />
    <a href="https://github.com/afipsdk/afip.js/wiki"><strong>Explorar documentación »</strong></a>
    <br />
    <br />
    <a href="https://github.com/afipsdk/afip.js/issues">Reportar un bug</a>
  </p>
</p>

<!-- TABLE OF CONTENTS -->
## Tabla de contenidos

* [Acerca del proyecto](#acerca-del-proyecto)
* [Guia de inicio](#guia-de-inicio)
  * [Instalacion](#instalacion)
  * [Como usarlo](#como-usarlo)
* [Web Services](#web-services)
  * [Factura electronica](#factura-electronica)
  * [Padron alcance 4](#padron-alcance-4)
  * [Padron alcance 5](#padron-alcance-5)
  * [Padron alcance 10](#padron-alcance-10)
  * [Padron alcance 13](#padron-alcance-13)
* [Integrar otro web service](https://afipsdk.com/wiki/js/generic_web_service.html)
* [Ejemplos de uso](https://afipsdk.com/wiki/js/examples/index.html)
* [Tutoriales para la página AFIP](https://afipsdk.com/wiki/js/tutorials/index.html)
* [Solución a errores más frecuentes](https://afipsdk.com/wiki/js/errors.html)
* [Preguntas frecuentes](https://afipsdk.com/wiki/js/faq.html)
* [Proyectos relacionados](#proyectos-relacionados)
* [¿Necesitas ayuda? 🚀](#necesitas-ayuda-)
* [Licencia](#licencia)
* [Contacto](#contacto)



<!-- ABOUT THE PROJECT -->
## Acerca del proyecto
Afip SDK es la forma más rápida y simple de conectarse con los Web Services de AFIP.

Esta librería fue creada con la intención de ayudar a los programadores a usar los Web Services de AFIP sin romperse la cabeza ni perder tiempo tratando de entender la complicada documentación que AFIP provee. Ademas forma parte de [Afip SDK](https://afipsdk.com/).


<!-- START GUIDE -->
## Guia de inicio

### Instalacion
#### Via npm

```
npm install --save @afipsdk/afip.js
```

#### Via Yarn

```
yarn add @afipsdk/afip.js
```

**Siguiente paso** 
* Remplazar *node_modules/@afipsdk/afip.js/Afip_res/cert* por tu certificado provisto por AFIP y *node_modules/@afipsdk/afip.js/Afip_res/key* por la clave generada. 
* La carpeta *Afip_res* deberá tener permisos de escritura.

Ir a [Tutoriales para la página AFIP](https://afipsdk.com/wiki/js/tutorials/index.html) para obtener mas información de como generar la clave y certificado

# Como usarlo

Lo primero es incluir el SDK en tu aplicación
````js
const Afip = require('@afipsdk/afip.js');
````

Luego creamos una instancia de la clase Afip pasandole un Objeto como parámetro.
````js
const afip = new Afip({ CUIT: 20111111112 });
````


Para más información acerca de los parámetros que se le puede pasar a la instancia new `Afip()` consulte sección [Primeros pasos](https://github.com/afipsdk/afip.js/wiki/Primeros-pasos#como-usarlo) de la documentación

Una vez realizado esto podemos comenzar a usar el SDK con los Web Services disponibles


<!-- WEB SERVICES -->
## Web Services

Si necesitas más información de cómo utilizar algún web service echa un vistazo a la [documentación completa de afip.js](https://github.com/afipsdk/afip.js/wiki)

### Factura electronica
Podes encontrar la documentación necesaria para utilizar la [facturación electrónica](https://github.com/afipsdk/afip.js/wiki/Facturaci%C3%B3n-Electr%C3%B3nica) 👈 aquí

### Padron alcance 4
El Servicio Web de Consulta de Padrón denominado A4 ha quedado limitado para Organismos Públicos, si lo necesitas puedes leer la documentación de [consulta al padrón de AFIP alcance 4](https://github.com/afipsdk/afip.js/wiki/Consulta-al-padron-de-AFIP-alcance-4)

### Padron alcance 5
Quienes usaban el padrón A4 pueden utilizar este padrón en modo de remplazo, si queres saber cómo echa un vistazo a la documentación de [consulta al padrón de AFIP alcance 5](https://github.com/afipsdk/afip.js/wiki/Consulta-al-padron-de-AFIP-alcance-5)

### Padron alcance 10
Si tenes que utilizar este web service también está disponible dentro de la librería, su documentación se encuentra en [consulta al padrón de AFIP alcance 10](https://github.com/afipsdk/afip.js/wiki/Consulta-al-padron-de-AFIP-alcance-10)

### Padron alcance 13
Si debes consultar por el CUIT de una persona física tendrás que utilizar este web service, su documentación se encuentra disponible en la wiki de [consulta al padrón de AFIP alcance 13](https://github.com/afipsdk/afip.js/wiki/Consulta-al-padron-de-AFIP-alcance-13)


<!-- RELATED PROJECTS-->
### Proyectos relacionados

#### Libreria para PHP
Si necesitas acceder los web services de AFIP en **PHP** podes utilizar [Afip.php](https://github.com/afipsdk/afip.php)

<!-- AFIP SDK PRO -->
### ¿Necesitas ayuda? 🚀

¿Quieres implementarlo de forma rápida y fiable? Obtén Afip SDK PRO que incluye una amplia documentación con ejemplos, tutoriales, implementación en Frameworks y plataformas, y mucho más.


**[¡Ahora es gratis!](https://afipsdk.com/wiki/js/index.html)**


<!-- LICENCE -->
### Licencia
Distribuido bajo la licencia MIT. Vea `LICENSE` para más información.


<!-- CONTACT -->
### Contacto
Afip SDK - afipsdk@gmail.com

Link del proyecto: [https://github.com/afipsdk/afip.js](https://github.com/afipsdk/afip.js)


_Este software y sus desarrolladores no tienen ninguna relación con la AFIP._

<!-- 
Generate Types:
npx -p typescript tsc src/**/*.js --declaration --allowJs --emitDeclarationOnly --outDir types 
-->
<!-- MARKDOWN LINKS & IMAGES -->
[npm-shield]: https://img.shields.io/npm/dt/@afipsdk/afip.js.svg
[contributors-shield]: https://img.shields.io/github/contributors/afipsdk/afip.js.svg?color=orange
[issues-shield]: https://img.shields.io/github/issues-closed-raw/afipsdk/afip.js.svg?color=blueviolet
[license-shield]: https://img.shields.io/github/license/afipsdk/afip.js.svg?color=blue
