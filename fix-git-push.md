# Arreglar el push rechazado por archivos grandes

GitHub rechaza el push porque se subieron **node_modules** (por un error en `.gitignore`) y un GLB de 76 MB.

## 1. Dejar de trackear y corregir

En la raíz del proyecto (en la terminal):

```bash
# Dejar de trackear node_modules (no se borra de tu disco)
git rm -r --cached node_modules

# Opcional: dejar de trackear el GLB pesado (lo tendrás solo en tu máquina)
git rm --cached "public/Hitem3d-1773009408248.glb"

# Añadir el .gitignore corregido
git add .gitignore
git commit -m "fix: no trackear node_modules ni GLB grande"
```

## 2. Quitar los archivos grandes del historial

Los commits antiguos siguen teniendo esos archivos. Hay que reescribir el historial:

```bash
git filter-branch --force --index-filter "git rm -rf --cached --ignore-unmatch node_modules public/Hitem3d-1773009408248.glb" --prune-empty HEAD
```

Si da error con `filter-branch`, usa (requiere tener instalado `git-filter-repo`):

```bash
git filter-repo --path node_modules --invert-paths --force
git filter-repo --path "public/Hitem3d-1773009408248.glb" --invert-paths --force
```

## 3. Volver a subir

```bash
git push origin main --force
```

**Nota:** Si ya habías hecho push antes, `--force` reescribe la rama en GitHub. Si trabajas con más gente, avisa antes.

## 4. El archivo GLB

Si dejaste de trackear `public/Hitem3d-1773009408248.glb`:

- Sigue en tu carpeta `public/` y la app seguirá funcionando en local.
- No estará en el repo. Para tenerlo en GitHub tendrías que usar **Git LFS** (Large File Storage) o subirlo a un CDN y cargarlo por URL.
