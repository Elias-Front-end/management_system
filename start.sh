#!/usr/bin/env bash
cd backend
gunicorn backend.wsgi:application