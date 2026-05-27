#!/bin/bash
trap 'kill 0' EXIT

cd backend && npm run dev &
cd frontend && npm run dev &

wait
