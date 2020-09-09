#!/bin/bash


port=${port:-5000}
ip=${ip:-127.0.0.1}

while [ $# -gt 0 ]; do

   if [[ $1 == *"--"* ]]; then
        param="${1/--/}"
        declare $param="$2"
   fi

  shift
done

export PORT=$port;export IP=$ip; node server.js
