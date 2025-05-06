#!/bin/bash

echo "Aguardando o MongoDB iniciar..."
until mongosh --eval "db.runCommand({ ping: 1 })" &>/dev/null; do
  echo "Mongo ainda não está pronto. Aguardando..."
  sleep 2
done

echo "MongoDB iniciado. Iniciando replica set..."

mongosh --eval "rs.initiate({
  _id: 'myReplicaSet',
  members: [{ _id: 0, host: 'localhost:27017' }]
})"

sleep 5

echo "Criando usuário admin..."
mongosh admin --eval "
  db.createUser({
    user: '$MONGO_USERNAME',
    pwd: '$MONGO_PASSWORD',
    roles: [ { role: 'root', db: 'admin' } ]
  });
"

echo "Criando banco de dados e coleção..."
mongosh -u "$MONGO_USERNAME" -p "$MONGO_PASSWORD" --authenticationDatabase "admin" <<EOF
use $DB_NAME;
db.$COLLECTION_NAME .insertOne({ criado_em: new Date(), inicial: true });
EOF

echo "Setup finalizado com sucesso."
