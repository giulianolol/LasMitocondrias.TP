#!/usr/bin/env bash

# ----------------------------------------------------------
# setup_backend.sh
# Automatiza la instalación de Node.js, npm, Express y nodemon 
# ----------------------------------------------------------

function echo_info {
  echo -e "\e[1;34m[INFO]\e[0m $1"
}

function echo_error {
  echo -e "\e[1;31m[ERROR]\e[0m $1"
}

TARGET_DIR="Backend"
if [ ! -d "$TARGET_DIR" ]; then
  echo_error "No encontré la carpeta '$TARGET_DIR'. Asegurate de que exista en la ruta donde corrés este script."
  exit 1
fi

echo_info "Actualizando paquetes e instalando dependencias..."
sudo apt update -y
sudo apt install -y curl build-essential

#Instalar Node.js
if ! command -v node >/dev/null 2>&1; then
  echo_info "Instalando Node.js 18.x desde NodeSource..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt install -y nodejs
else
  echo_info "Ya existe Node.js instalado: $(node -v). Se omite instalación."
fi

# Verificar instalación de npm
if ! command -v npm >/dev/null 2>&1; then
  echo_error "npm no se instaló correctamente. Verificá la instalación de Node.js."
  exit 1
else
  echo_info "npm existe: $(npm -v)"
fi

cd "$TARGET_DIR" || { echo_error "No se pudo entrar a $TARGET_DIR"; exit 1; }

if [ ! -f "package.json" ]; then
  echo_info "Inicializando package.json con valores por defecto..."
  npm init -y
else
  echo_info "package.json ya existe, se omite npm init."
fi

# Instalar Express y dependencias de desarrollo
echo_info "Instalando express y nodemon..."
npm install express
npm install --save-dev nodemon

# Ajustar scripts en package.json
echo_info "Agregando scripts 'start' y 'dev' en package.json..."
if ! grep -q "\"dev\"" package.json; then
  sed -i 's/"scripts": {/"scripts": {\
    "start": "node server.js",\
    "dev": "nodemon server.js",/' package.json
  echo_info "Scripts agregados correctamente."
else
  echo_info "Los scripts 'start' y/o 'dev' ya existían. Se omite esta parte."
fi

# 10. Mensaje final
echo_info "Instalación completa."