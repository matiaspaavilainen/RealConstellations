# syntax=docker/dockerfile:1

ARG NODE_VERSION=25.2.1
ARG PYTHON_VERSION=3.14.3

# Build frontend
FROM node:${NODE_VERSION}-alpine AS frontend-build
WORKDIR /frontend
COPY Frontend/package*.json ./
RUN npm install
COPY Frontend/ ./
RUN npm run build

# Backend
FROM python:${PYTHON_VERSION} AS base

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Create a non-privileged user that the app will run under.
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

RUN --mount=type=cache,target=/root/.cache/pip \
    --mount=type=bind,source=Backend/requirements.txt,target=requirements.txt \
    python -m pip install -r requirements.txt

COPY Backend/ .
COPY --from=frontend-build /frontend/dist/assets ./static/assets
COPY --from=frontend-build /frontend/dist/index.html ./templates/

RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["fastapi", "run", "main.py", "--proxy-headers"]