#!/bin/bash

echo "exporting project id"
export PROJECT_ID=lucid-splicer-149022
echo "project id = ${PROJECT_ID}"
echo "deleting slack bot"
kubectl delete -f slack-bot-rc.yaml
echo "building container"
sudo docker build -t gcr.io/${PROJECT_ID}/slack-bot .
echo "pushing container"
sudo gcloud docker push gcr.io/${PROJECT_ID}/slack-bot
echo "building slack bot"
kubectl create -f slack-bot-rc.yaml
echo "complete"
