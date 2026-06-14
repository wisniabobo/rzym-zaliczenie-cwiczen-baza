#!/bin/bash
mv pytania.pdf public/pytania.pdf
git add .
git commit -m "Dodanie pytania o pucharek i generacja PDF z pytaniami"
npm run deploy
