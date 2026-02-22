# Cómo subir el Rally a GitHub (con index.html en la raíz)

Para que GitHub Pages muestre tu sitio, **index.html debe estar en la raíz** del repositorio (no dentro de una subcarpeta).

## 1. Abre la carpeta correcta

La carpeta debe ser **RALLY** (la que contiene `index.html`, `juego.html`, `assets/`, `ejecutar.bat`, etc.).  
Si abres una carpeta padre, GitHub verá una estructura distinta y no encontrará `index.html` en la raíz.

## 2. Subir con Git (recomendado)

En la terminal, desde la carpeta **RALLY**:

```bash
cd "C:\Users\Alvaro´s\OneDrive\Escritorio\RALLY"

git init
git add .
git status
```

Comprueba que en `git status` aparezca **index.html**. Si no aparece, no estás en la carpeta correcta.

Luego:

```bash
git commit -m "Rally Estudiantil 2.0 - sitio HTML"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

(Sustituye `TU-USUARIO` y `TU-REPO` por tu usuario y nombre del repositorio.)

## 3. Si subes por la web (Upload files)

1. Entra a tu repositorio en GitHub.
2. Asegúrate de estar en la **raíz** del repo (no dentro de ninguna carpeta).
3. Arrastra **toda** la carpeta RALLY **desde dentro**: es decir, que los primeros archivos que se vean sean `index.html`, `juego.html`, `instrucciones.html`, `registro.html`, `seleccion-juego.html`, `seleccion-categoria.html`, `resultados.html`, la carpeta `assets/`, etc.
4. Si al arrastrar solo ves una carpeta “RALLY” y dentro los archivos, en la raíz del repo **no** habrá `index.html`. En ese caso, entra a la carpeta RALLY en GitHub, selecciona todo su contenido, y muévelo a la raíz del repositorio (o vuelve a subir desde tu PC abriendo la carpeta RALLY y arrastrando **su contenido** a la raíz del repo).

## 4. GitHub Pages

- En el repo: **Settings → Pages**.
- **Source**: “Deploy from a branch”.
- **Branch**: `main` (o la rama que uses), carpeta **/ (root)**.
- Guarda. La URL será `https://TU-USUARIO.github.io/TU-REPO/`.

Cuando `index.html` esté en la raíz del repositorio, esa URL mostrará la bienvenida del Rally.
