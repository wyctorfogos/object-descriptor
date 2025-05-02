#!/bin/bash

echo "Waiting for MongoDB to start..."

sleep 15

mongosh --eval "rs.initiate({ _id: 'myReplicaSet', members: [{ _id: 0, host: 'localhost:27017' }] })"

echo "Replica Set initiated"

mongo admin --eval "
  db.createUser({ user: '$MONGO_USERNAME', pwd: '$MONGO_PASSWORD', roles: [{ role: 'userAdminAnyDatabase', db: 'admin' }] });
  db.grantRolesToUser('$MONGO_USERNAME', [{ role: 'root', db: 'admin' }])
"

echo "User created"