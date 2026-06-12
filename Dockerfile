# --- ETAPA 1: Construcción (Build) ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm ci

# Copiar el resto del código (incluyendo el .env.production y next.config.ts)
COPY . .

# Desactivar telemetría de Next y compilar
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- ETAPA 2: Producción (Runner) ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=400"

# Crear usuario seguro
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar assets necesarios
COPY --from=builder /app/public ./public

# Copiar la optimización Standalone y archivos estáticos
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

# Ejecutamos el servidor optimizado que generó el modo standalone
CMD ["node", "server.js"]
