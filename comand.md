./network.sh deployCC -ccn chaincode_v6 -ccp ../chaincode -ccl typescript -ccep "OR('Org1MSP.peer','Org2MSP.peer')"

./network.sh up createChannel -c mychannel -ca -s couchdb
